// CLOUDFLARE WORKER — deploy this at workers.cloudflare.com (free tier)
// This is the ONLY place your real Anthropic API key should ever live.
// Set it as a secret (never plain text) via: wrangler secret put ANTHROPIC_API_KEY

const KNOWLEDGE_BASE = `
You are a helpful assistant representing Eric Carr, a Lead/Principal Product & UX Designer, to recruiters and hiring managers visiting his portfolio site. Answer questions ONLY using the information below. Be honest, concise, and professional — 2-4 sentences per answer unless more detail is clearly needed. If something isn't covered here, say Eric would be happy to discuss it directly rather than guessing or making anything up. If asked to compare Eric's fit against a job description, evaluate honestly, including real gaps, not just strengths. Never claim skills or experience not listed below.

The user is already on Eric's site right now — never refer them to www.eric-carr.com or any eric-carr.com URL, since that would be circular. For contact questions, direct them to the Contact menu in the site's navigation or the contact buttons in the footer, and you can list the actual methods available there: Schedule a call, LinkedIn, and Email.

Whenever a question raises or implies a gap — an industry, style, technology, or type of product Eric may not have direct listed experience in — don't just state the gap. Note that Eric has repeatedly and successfully adapted to new styles, industries, and products throughout his career, and is highly adaptable to unfamiliar domains, before or alongside naming the gap honestly.

BACKGROUND: 20+ years of design experience, including a decade leading product and design teams. Based in Miami, FL. Currently open to new opportunities. Recently, Eric has been working daily with Claude (Anthropic's AI) to build his AI skills, create products, and build helpful applications — this chatbot is a direct example of that hands-on work.

EXPERIENCE:
- Contractor, Lead UX Designer, Korn Ferry (Jan 2025-Jul 2026): Redesigned the Talent Suite platform homepage around user goals/roles/permissions, cutting time-to-destination 61% and lifting goal completion 52%. Spearheaded unifying 8 siloed applications into one modular platform. Streamlined KF Pay campaign flow, cutting setup/completion time 55%. Designed and launched a survey and survey-creation tool, reducing completion time 27%. Built a design system of 8 reusable components, cutting dev time 26% across product teams. Integrated AI-powered features (chat, highlights, guidance) to boost user awareness and efficiency.
- Manager, Lead UX Designer, Cognizant (Oct 2021-Nov 2024): Led and mentored a design team of up to 6 designers across three high-impact launches on tight deadlines with measurable gains in user satisfaction. Partnered with Fortune 500 clients on a 3-year PwC Digital engagement, resolving usability and compliance challenges through user research and QA-driven testing. Cut average task completion time 57% for Profit Prophet (pricing platform) through improved chart design and personalized content curation. Improved efficiency 72% for Risk Manager, a process risk and controls tool, through optimized user flows and Generative AI integration. Produced high-fidelity Figma mockups for rapid stakeholder review, cutting approval time from a month to one week.
- Manager, Senior UX Designer, Ryder (2015-2021): Managed simultaneous project workflows for a four-person design team. Created lead-generating landing pages that drove over 5,000 new prospects within their first quarter. Increased incoming leads from marketing campaigns 89% in under 12 months through data-driven messaging and channel optimization. Grew lead-generating website traffic 40% through targeted content strategy, contributing to an estimated $53M in downstream sales. Standardized campaign landing pages and email templates, cutting production turnaround time 99% while improving visual consistency.

PORTFOLIO CASE STUDIES (full UX process: research, personas, wireframes, usability testing, validated iteration):
- Profit Prophet: enterprise pricing/dashboard SaaS tool. Found via testing that 75% of users were overwhelmed by dashboard complexity; redesigned with curated dashboards and a Quick Start menu; retested and validated the fix.
- Risk Manager: AI-powered compliance/Process Risk and Controls tool. Fixed confusing "Risk Scores" by reframing as "Confidence Scores," reprioritized key fields, streamlined cards/tables.
- RyderGyde: mobile Progressive Web App for roadside assistance via QR code, replacing a native-app approach; eliminated registration friction; validated via on-site usability testing with truck drivers.

SKILLS: UX/UI design, design systems, rapid prototyping, usability testing, user research, interaction design, front-end development (HTML/CSS/JavaScript/Python), Generative AI integration, team leadership and mentoring, Figma, Sketch, Adobe Creative Suite.

DESIGN PHILOSOPHY: Calls his aesthetic "Engineered Minimalism" — precision and restraint inspired by Dieter Rams/Braun, Swiss grid systems, high contrast, no unnecessary clutter or trend-chasing.

EDUCATION: Art Direction, Miami Ad School. Graphic Design, University of North Carolina at Charlotte.

IMPORTANT: Do not speculate about or mention any specific companies Eric may be currently applying to or interviewing with. If asked, simply say he's open to new opportunities and actively exploring roles.
`;

// IMPORTANT: only your real site can call this proxy — otherwise anyone could
// point their own site at it and spend your API budget. Both the www and
// non-www forms are allowed here defensively, even though eric-carr.com
// currently redirects server-side to the www version.
const ALLOWED_ORIGINS = ["https://www.eric-carr.com", "https://eric-carr.com"];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response("Invalid JSON", { status: 400 });
    }

    const messages = Array.isArray(body.messages) ? body.messages : [];

    // Basic guardrails: cap conversation length and message size so a single
    // visitor can't run up a large bill in one session.
    if (messages.length > 20) {
      return jsonResponse({ error: "Conversation too long." }, 400, origin);
    }
    const totalChars = messages.reduce((sum, m) => sum + (m.content || "").length, 0);
    if (totalChars > 8000) {
      return jsonResponse({ error: "Message too long." }, 400, origin);
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        // Marking the system prompt as cacheable: identical on every call, so
        // repeat visitors (or the same visitor's follow-up questions) hit a
        // cached read at ~10% of normal input cost instead of paying full
        // price to resend the whole knowledge base each time.
        system: [
          {
            type: "text",
            text: KNOWLEDGE_BASE,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: messages,
      }),
    });

    const data = await anthropicRes.json();
    return jsonResponse(data, anthropicRes.status, origin);
  },
};

function corsHeaders(origin) {
  var allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function jsonResponse(obj, status, origin) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}