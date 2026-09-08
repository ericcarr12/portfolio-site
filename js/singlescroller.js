// USER JOURNEY SCROLLERS
// Runs independently for every .userjourney block on the page, so pages with
// multiple personas (Profit Prophet, Risk Manager) each get their own working
// slider instead of all sharing whichever one loads first.
document.querySelectorAll('.userjourney').forEach(function (journey) {
	var map = journey.querySelector('.map');
	var sliderLeft = journey.querySelector('.sliderLeft');
	var sliderRight = journey.querySelector('.sliderRight');

	if (!map || !sliderLeft || !sliderRight) return;

	function maxScrollLeft() {
		return map.scrollWidth - map.clientWidth;
	}

	function moveLeft() {
		if (map.scrollLeft === 0) {
			sliderLeft.style.display = "none";
		} else {
			sliderLeft.style.display = "flex";
			map.scrollLeft -= 50;
		}
	}

	function moveRight() {
		if (map.scrollLeft === maxScrollLeft()) {
			sliderRight.style.display = "none";
		} else {
			sliderRight.style.display = "flex";
			map.scrollLeft += 50;
		}
	}

	function scrollin() {
		if (map.scrollLeft === maxScrollLeft()) {
			sliderRight.style.display = "none";
		} else if (map.scrollLeft === 0) {
			sliderLeft.style.display = "none";
		} else {
			sliderLeft.style.display = "flex";
			sliderRight.style.display = "flex";
		}
	}

	sliderLeft.addEventListener("mouseup", moveLeft);
	sliderRight.addEventListener("mouseup", moveRight);
	map.addEventListener("scroll", scrollin);
});
