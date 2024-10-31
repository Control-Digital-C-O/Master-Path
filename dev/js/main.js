import {setupNavbarMenuAnimation} from './barsMenu.js';
import {toggleHeaderOnScroll} from './header.js';

document.querySelector('.part1').onclick = function() {
	setupNavbarMenuAnimation();
}

toggleHeaderOnScroll();