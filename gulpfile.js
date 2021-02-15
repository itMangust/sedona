// Модули
const { src, dest, watch, series, parallel } = require('gulp');
const {
	htmlhint,
	lintspaces,
	data,
	twig,
	htmlmin,
	w3cHtmlValidator,
	stylelint,
	less,
	postcss,
	eslint,
	imagemin,
	webp,
	svgstore
} = require('gulp-load-plugins')();
const browserSync = require('browser-sync').create();

// Настройки
const {
	DEST,
	ESLINT,
	HTMLHINT,
	HTMLMIN,
	JPEGOPTIM,
	LINTSPACES,
	SERVER,
	STYLELINT,
	SVGO,
	SVGSTORE,
	WEBP,
	WEBPACK
} = require('pineglade-config').gulp;

const { IS_DEV = 0 } = process.env;

const LESS_SRC = ['src/less/style.less'];
if (IS_DEV) {
	LESS_SRC.push('src/less/dev.less');
}

const JS_SRC = ['src/js/script.js'];
if (IS_DEV) {
	JS_SRC.push('src/js/dev.js');
}

// Сборка HTML
const html = () => src('src/twig/pages/**/*.twig')
	.pipe(data((file) => {
		return {
			IS_DEV,
			page: file.path.replace(/\\/g, '/').replace(/^.*?twig\/pages\/(.*)\.twig$/, '$1')
		};
	}))
	.pipe(twig())
	.pipe(htmlmin(HTMLMIN))
	.pipe(dest(DEST))
	.pipe(w3cHtmlValidator())
	.pipe(w3cHtmlValidator.reporter());

// Тестирование HTML
const htmlTest = () => src('src/twig/**/*.twig')
	.pipe(htmlhint(HTMLHINT))
	.pipe(htmlhint.reporter())
	.pipe(lintspaces(LINTSPACES))
	.pipe(lintspaces.reporter());

// Сборка CSS
const css = () => src(LESS_SRC)
	.pipe(less())
	.pipe(postcss([
		require('mqpacker'),
		require('autoprefixer'),
		require('cssnano')
	]))
	.pipe(dest(`${DEST}/css`));

// Тестирование CSS
const cssTest = () => src('src/less/**/*.less')
	.pipe(stylelint(STYLELINT))
	.pipe(lintspaces(LINTSPACES))
	.pipe(lintspaces.reporter());

// Сборка JS
const js = () => src(JS_SRC)
	.pipe(require('vinyl-named')())
	.pipe(require('webpack-stream')(WEBPACK, require('webpack')))
	.pipe(dest(`${DEST}/js`));

// Тестирование JS
const jsTest = () => src(['gulpfile.js', 'src/js/**/*.js'])
	.pipe(eslint(ESLINT))
	.pipe(eslint.format())
	.pipe(lintspaces(LINTSPACES))
	.pipe(lintspaces.reporter());

// Оптимизация изображений
const img = () => src('src/img/**/*.{svg,png,jpg}')
	.pipe(imagemin([
		imagemin.svgo(SVGO),
		imagemin.optipng(),
		require('imagemin-jpegoptim')(JPEGOPTIM)
	]))
	.pipe(dest(`${DEST}/img`))
	.pipe(webp(WEBP))
	.pipe(dest(`${DEST}/img`));

// Сборка спрайта
const sprite = () => src('src/sprite/**/*.svg')
	.pipe(imagemin([imagemin.svgo(SVGO)]))
	.pipe(svgstore(SVGSTORE))
	.pipe(dest(`${DEST}/img`));

// Копирование не нуждающихся в обработке исходников в билд
const copy = () => src('src/as-is/**/*.*')
	.pipe(dest(DEST));

// Перезагрузка страницы в браузере
const reload = (done) => {
	browserSync.reload();
	done();
};

// Запуск сервера со слежением
const server = () => {
	browserSync.init(SERVER);

	watch('src/twig/**/*.twig', series(htmlTest, html, reload));
	watch('src/less/**/*.less', series(cssTest, css, reload));
	watch(['gulpfile.js', 'src/js/**/*.js'], series(jsTest, js, reload));
	watch('src/img/**/*.{svg,png,jpg}', series(img, reload));
	watch('src/sprite/**/*.svg', series(sprite, reload));
	watch('src/as-is/**/*.*', series(copy, reload));
};

// Очистка каталога билда перед сборкой
const clean = () => require('del')(DEST);

const test = parallel(htmlTest, cssTest, jsTest);
const build = series(parallel(test, clean), parallel(html, css, js, img, sprite, copy));
exports.test = test;
exports.build = build;
exports.default = series(build, server);
