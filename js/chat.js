// RECRUITER CHAT INTERACTION
// Calls the Cloudflare Worker proxy (never the Anthropic API directly —
// this file is public, so it must never contain a real API key).
const CHAT_PROXY_URL = "https://eric-carr-chat.erccrr.workers.dev";

const chatSendBtn = document.getElementById("chat-send");
const chatInputEl = document.getElementById("chat-input");
const chatMessagesEl = document.getElementById("chat-messages");

var chatHistory = [];

function addChatBubble(text, role) {
  var bubble = document.createElement("div");
  bubble.className = "chat-bubble " + (role === "user" ? "chat-bubble-user" : "chat-bubble-bot");
  bubble.textContent = text;
  chatMessagesEl.appendChild(bubble);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  return bubble;
}

async function sendChatMessage() {
  var question = chatInputEl.value.trim();
  if (!question) return;

  chatInputEl.value = "";
  chatSendBtn.disabled = true;
  addChatBubble(question, "user");
  chatHistory.push({ role: "user", content: question });

  var loadingBubble = addChatBubble("...", "bot");

  try {
    var response = await fetch(CHAT_PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory }),
    });

    if (!response.ok) {
      var errorBody = await response.text().catch(function () { return "(no response body)"; });
      console.error("Chat proxy returned an error status:", response.status, errorBody);
      throw new Error("http-status");
    }

    var data = await response.json();
    var textBlock = (data.content || []).find(function (b) {
      return b.type === "text";
    });
    var answer = textBlock ? textBlock.text : "Sorry, I couldn't generate a response.";

    loadingBubble.textContent = answer;
    chatHistory.push({ role: "assistant", content: answer });
  } catch (err) {
    // TypeError with no useful message is the browser's generic signature for a
    // network-level failure — the request never got a response at all. This is
    // the pattern for CORS blocks, offline connections, or a privacy feature
    // (e.g. iOS Safari's cross-site tracking prevention) blocking the request
    // to a different domain than the page itself.
    var isNetworkFailure = err instanceof TypeError;
    console.error("Chat request failed.", {
      type: isNetworkFailure ? "network-or-blocked" : "other",
      message: err && err.message,
      userAgent: navigator.userAgent,
    });
    loadingBubble.textContent = isNetworkFailure
      ? "Couldn't reach the chat — this can happen with strict privacy settings or a spotty connection. Please try again, or reach out directly using the contact links above."
      : "Something went wrong — please try again, or reach out directly using the contact links above.";
  } finally {
    chatSendBtn.disabled = false;
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }
}

chatSendBtn.addEventListener("click", sendChatMessage);
chatInputEl.addEventListener("keydown", function (e) {
  if (e.key === "Enter") sendChatMessage();
});
