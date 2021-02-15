
// Слишком мало, чтобы повлияло на восприятие человеком, но часто достаточно для машины
const ENOUTH_TIMEOUT = 33;

const popupWrap = document.querySelector('.popup-wrap');
const feedbackOpen = document.querySelector('.feedback-send');
const feedbackClose = popupWrap.querySelector('.popup-close');
const form = popupWrap.querySelector('.popup-form');
const nameField = form.querySelector('input[name="name"]');

feedbackOpen.addEventListener('click', (evt) => {
	evt.preventDefault();
	popupWrap.classList.add('popup-wrap-show');
	nameField.focus();
});

form.addEventListener('submit', (evt) => {
	form.classList.remove('popup-form-validable');

	// Добавляем класс, под которым невалидные инпуты краснеют
	// (если не использовать модификатор, то до первого сабмита поля будут красными сразу)
	if (!form.checkValidity()) {
		evt.preventDefault();
		setTimeout(() => {
			form.classList.add('popup-form-validable');
			// Без таймаута не срабатывает повторная анимация
		}, ENOUTH_TIMEOUT);
	}
});

popupWrap.addEventListener('click', (evt) => {
	if (evt.target === popupWrap || evt.target === feedbackClose) {
		evt.preventDefault();
		popupWrap.classList.remove('popup-wrap-show');
		feedbackOpen.focus();
	}
});
