const managePP = (pp = parseInt(localStorage.getItem('pp'), 10)) => {
	if (pp) {
		document.documentElement.classList.add('pixelperfect-ready');
	} else {
		document.documentElement.classList.remove('pixelperfect-ready');
	}
};

managePP();

document.addEventListener('keydown', (evt) => {
	if (document.activeElement === document.body && evt.code === 'KeyP') {
		const isPP = Boolean(Number(localStorage.getItem('pp')));
		const pp = Number(!isPP);

		localStorage.setItem('pp', pp);
		managePP(pp);
	}
});
