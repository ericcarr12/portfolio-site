// DROPDOWN ON DESKTOP NAV    
const dropBtn = document.getElementById('drop-toggle1');
const dropMenu = document.getElementById('drop-menu1');
const dropBtn2 = document.getElementById('drop-toggle2');
const dropMenu2 = document.getElementById('drop-menu2');

dropBtn.addEventListener('click', function(event) {
  event.stopPropagation();
  dropMenu2.classList.remove('show'); 
  dropMenu.classList.toggle('show');
});

dropBtn2.addEventListener('click', function(event) {
  event.stopPropagation();
  dropMenu.classList.remove('show'); 
  dropMenu2.classList.toggle('show');
});

// Close the dropdown if a user clicks anywhere else on the page
window.addEventListener('click', function() {
  if (dropMenu.classList.contains('show')) {
    dropMenu.classList.remove('show');
  } 
  if (dropMenu2.classList.contains('show')) {
    dropMenu2.classList.remove('show');
  }
});


// SLIDING SIDE NAV - MOBILE
var sideNav = document.getElementById("sideNav");
function expandNav() {
	sideNav.style.right = "0";
}

function collapseNav() {
	sideNav.style.right = "-100%";
}

window.addEventListener('mouseup',function(event){
    if(event.target !== sideNav && !sideNav.contains(event.target)){
        collapseNav();
    }
  }); 

document.getElementById("hamburger").addEventListener("click", expandNav);
document.getElementById("close").addEventListener("click", collapseNav);


// ENCRYPT EMAIL
var encEmail = "ZXJpY21jYXJyQHBtLm1l";
var mailtoLink = "mailto:".concat(atob(encEmail));

["contact", "contact-mobile", "contact-desktop", "contact-footer"].forEach(function (id) {
  var el = document.getElementById(id);
  if (el) el.setAttribute("href", mailtoLink);
});


// GRADIENT PLAY/PAUSE
// Only runs on pages with the #gradient-toggle button (currently index.html).
var gradientToggle = document.getElementById("gradient-toggle");
var gradientEl = document.querySelector(".index-gradient");
var gradientToggleIcon = document.getElementById("gradient-toggle-icon");
var gradientToggleLabel = document.getElementById("gradient-toggle-label");

if (gradientToggle && gradientEl) {
  var isPaused = false;

  var setPauseIcon = function () {
    gradientToggle.setAttribute("aria-pressed", isPaused ? "true" : "false");
    gradientToggle.setAttribute("aria-label", isPaused ? "Play background animation" : "Pause background animation");
    if (gradientToggleIcon) gradientToggleIcon.src = isPaused ? "images/icons/play-circle.svg" : "images/icons/pause-circle.svg";
    if (gradientToggleLabel) gradientToggleLabel.textContent = isPaused ? "Play animation" : "Pause animation";
  };

  // Freezes exactly wherever the animation currently is — no snapping to a
  // stop point, matching native pause/resume behavior.
  gradientToggle.addEventListener("click", function () {
    isPaused = !isPaused;
    gradientEl.style.animationPlayState = isPaused ? "paused" : "running";
    setPauseIcon();
  });
}


// LATEST NEWS BAR — cycles through supporting text items via the right arrow.
// Only runs on pages with the #latest-news-text element (currently index.html).
var latestNewsText = document.getElementById("latest-news-text");
var latestNewsNext = document.getElementById("latest-news-next");

if (latestNewsText && latestNewsNext) {
  var newsItems = [
    "Seeking new opportunities: Lead UX or Principal Product Design roles",
    "New chat feature — Ask about my skills and see if I match up for the role",
    "Portfolio refreshed — New case study designs and a cleaner site experience"
  ];
  var newsIndex = 0;

  latestNewsNext.addEventListener("click", function () {
    newsIndex = (newsIndex + 1) % newsItems.length; // wraps back to the first item after the last
    latestNewsText.textContent = newsItems[newsIndex];
  });
}


// LOGO MARQUEE — pause the scrolling animation while it's off-screen, so it
// isn't continuously consuming CPU/GPU cycles on a section nobody is looking
// at (e.g. before the user scrolls down, or after they scroll past it).
var logoRow = document.querySelector(".logo-row");

if (logoRow && "IntersectionObserver" in window) {
  var logoObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      logoRow.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
    });
  });
  logoObserver.observe(logoRow);
}