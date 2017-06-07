// build core
var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// scripts
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var tslint = require('gulp-tslint');

// styles
var sass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps');
var cleanCSS = require('gulp-clean-css');

// images
var imageMin = require('gulp-imagemin');

// pages & templates
var nunjucksRender = require('gulp-nunjucks-render');

// utils
var del = require('del');
var gulpif = require('gulp-if');
var minimist = require('minimist');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');

// environments and options
var environments = {
	dev: 'development',
	pro: 'production'
}
var defaultOptions = {
	string: 'env',
	default: { env: process.env.NODE_ENV || environments.dev }
}
var options = minimist(process.argv.slice(2), defaultOptions);



// lint task
gulp.task('lint', function() {
	gulp.src('src/ts/*.ts')
	.pipe(tslint({
		formatter: "prose"
	}))
	.pipe(tslint.report());
});

// scripts task
gulp.task('scripts', function() {
	gulp.src(['node_modules/jquery/dist/jquery.js',
	'node_modules/bootstrap/js/dist/util.js'])
	.pipe(concat('framework.js'))
	.pipe(rename('framework.js'))
	.pipe(gulpif(options.env == environments.pro, uglify()))
	.pipe(gulp.dest('dist/assets/'));

	browserify({basedir: './', debug: true})
	.add('src/ts/scripts.ts')
	.plugin(tsify, {noImplicitAny: true, target: 'es5', "types": ["node"], "typeRoots": ["node_modules/@types"]})
	.bundle()
	.on('error', function(error) {console.error(error.toString());})
	.pipe(source('app.js'))
	.pipe(buffer())
	.pipe(gulpif(options.env == environments.pro, uglify()))
	.pipe(gulp.dest('dist/assets/'));
});

// styles task
gulp.task('styles', function() {
	sass('src/sass/framework.scss', {sourcemap: true, loadPath: ['node_modules/bootstrap/scss']})
	.on('error', sass.logError)
	.pipe(sourcemaps.write())
	.pipe(rename('framework.css'))
	.pipe(gulpif(options.env == environments.pro, cleanCSS({compatibility: 'ie8'})))
	.pipe(gulp.dest('dist/assets/'))
	.pipe(reload({stream: true}));

	sass('src/sass/styles.scss', {sourcemap: true})
	.on('error', sass.logError)
	.pipe(sourcemaps.write())
	.pipe(rename('app.css'))
	.pipe(gulpif(options.env == environments.pro, cleanCSS({compatibility: 'ie8'})))
	.pipe(gulp.dest('dist/assets/'))
	.pipe(reload({stream: true}));
});

// images task
gulp.task('images', function() {
	gulp.src('src/images/**/*')
	.pipe(imageMin())
	.pipe(gulp.dest('dist/images/'))
	.pipe(reload({stream: true}));
});

// html task
gulp.task('pages', function() {
	gulp.src('src/pages/*.html')
	.pipe(nunjucksRender({
		path:['src/templates/']
	}))
	.pipe(gulp.dest('dist/'))
	.pipe(reload({stream: true}));
});

// build dist
gulp.task('build', function(cb) {
	runSequence(['styles', 'scripts', 'images', 'pages'], cb);
});

// server the distribution
gulp.task('serve', function() {
	browserSync.init(null, {
		server: {
			baseDir: "dist/"
		}
	});
});

// watch task
gulp.task('watch', function() {
	gulp.watch('src/ts/*.ts', ['scripts']);
	gulp.watch('src/sass/*.scss', ['styles']);
	gulp.watch('src/images/**/*', ['images']);
	gulp.watch('src/**/*.html', ['pages']);
});

// clean up
gulp.task('clean', function() {
	del(['dist/', 'tmp/']);
});

// default task
gulp.task('default', ['lint', 'scripts', 'styles', 'images', 'pages', 'serve' ,'watch']);
