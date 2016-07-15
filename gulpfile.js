var gulp = require('gulp');

var jshint = require('gulp-jshint');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglifyJS = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var imageMin = require('gulp-imagemin');

var sass = require('gulp-ruby-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var runSequence = require('run-sequence');
var nunjucksRender = require('gulp-nunjucks-render');
var del = require('del');

// lint task
gulp.task('lint', function() {
	gulp.src('src/js/*.js').pipe(jshint()).pipe(jshint.reporter('default'));
});

// scripts task
gulp.task('scripts', function() {
	gulp.src(['bower_components/jquery/dist/jquery.js','bower_components/bootstrap/dist/js/bootstrap.js'])
		.pipe(concat('framework.js'))
		.pipe(rename('framework.js'))
		.pipe(uglifyJS())
		.pipe(gulp.dest('dist/js'));

	gulp.src('src/js/*.js')
		.pipe(plumber())
		.pipe(rename('app.js'))
		.pipe(uglifyJS())
		.pipe(gulp.dest('dist/js'))
		.pipe(reload({stream: true}));
});

// styles task
gulp.task('styles', function() {
	sass('src/sass/framework.scss')
		.on('error', sass.logError)
		.pipe(rename('framework.css'))
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(gulp.dest('dist/css'))
		.pipe(reload({stream: true}));

	sass('src/sass/styles.scss')
		.on('error', sass.logError)
		.pipe(rename('styles.css'))
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(gulp.dest('dist/css'))
		.pipe(reload({stream: true}));
});

// images task
gulp.task('images', function() {
	gulp.src('src/images/**/*')
	.pipe(imageMin())
	.pipe(gulp.dest('dist/images'))
	.pipe(reload({stream: true}));
});

// html task
gulp.task('html', function() {
	gulp.src('src/pages/*.html')
		.pipe(nunjucksRender({
			path:['src/templates']
		}))
		.pipe(gulp.dest('dist'))
		.pipe(reload({stream: true}));
});

// build dist
gulp.task('build', function(cb) {
	runSequence(['styles', 'scripts', 'images', 'html'], cb);
});

// server the distribution
gulp.task('serve', function() {
	browserSync({
		server: {
			baseDir: "dist/"
		}
	});
});

// watch task
gulp.task('watch', function() {
	gulp.watch('src/js/*.js', ['scripts']);
	gulp.watch('src/sass/*.scss', ['styles']);
	gulp.watch('src/images/**/*', ['images']);
	gulp.watch('src/**/*.html', ['html']);
});

// clean up
gulp.task('clean', function() {
	del(['dist', 'tmp']);
});

// default task
gulp.task('default', ['lint', 'scripts', 'styles', 'images', 'html', 'serve' ,'watch']);