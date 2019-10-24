const mix = require('laravel-mix');

mix.js('src/js/app.js', 'dist/js')
	.sass('src/sass/app.scss', 'dist/css')
	.options({
       	processCssUrls: false
	});