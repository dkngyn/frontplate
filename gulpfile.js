// build core
var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// scripts
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var buffer = require('vinyl-buffer');
var uglifyjs = require('uglify-es');
var uglifycomp = require('gulp-uglify/composer');
var uglify = uglifycomp(uglifyjs, console);
var concat = require('gulp-concat');
var tslint = require('gulp-tslint');

// styles
var sass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps');
var cleanCSS = require('gulp-clean-css');

// pages & templates
var nunjucksRender = require('gulp-nunjucks-render');

// utils
var del = require('del');
var gulpif = require('gulp-if');
var minimist = require('minimist');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');

// environments & options & paths
var environments = {
	dev: 'development',
	pro: 'production'
}

var defaultOptions = {
	string: 'env',
	default: { env: process.env.NODE_ENV || environments.dev }
}

var options = minimist(process.argv.slice(2), defaultOptions);

var paths = {
	styles: {
		src: 'src/sass/*.scss',
		app: 'src/sass/styles.scss',
		framework: 'src/sass/framework.scss'
	},
	scripts: {
		src: 'src/ts/*.ts',
		app: 'src/ts/scripts.ts'
	},
	images: {
		src: 'src/images/**/*'
	},
	pages: {
		src: 'src/pages/*.html',
		templates: 'src/templates/'
	},
	dest: {
		base: 'dist/',
		assets: 'dist/assets/',
		images: 'dist/images/'
	}
}

// lint task
function lint() {
	return gulp.src('src/ts/*.ts')
	.pipe(tslint({
		formatter: "prose"
	}))
	.pipe(tslint.report());
}

// scripts task
var scripts = gulp.series(scriptFramework,scriptApp);

function scriptFramework() {
	return gulp.src([
		'node_modules/jquery/dist/jquery.js',
		'node_modules/popper.js/dist/umd/popper.js',
		'node_modules/bootstrap/js/dist/util.js'])
	.pipe(concat('framework.js'))
	.pipe(gulpif(options.env == environments.pro, uglify()))
	.pipe(gulp.dest('dist/assets/'));
}

function scriptApp() {
	return browserify({basedir: './', debug: true})
	.add(paths.scripts.app)
	.plugin(tsify, {
		noImplicitAny: true, target: 'es5',
		"types": ["node"],
		"typeRoots": ["node_modules/@types"]
	})
	.bundle()
	.on('error', function(error) {console.error(error.toString());})
	.pipe(source('app.js'))
	.pipe(buffer())
	.pipe(gulpif(options.env == environments.pro, uglify()))
	.pipe(gulp.dest(paths.dest.assets));
}

// styles task
var styles = styleAll;

function styleAll() {
	return sass(paths.styles.framework, {sourcemap: true, loadPath: ['node_modules/bootstrap/scss']})
	.on('error', sass.logError)
	.pipe(sourcemaps.write())
	.pipe(autoprefixer({
		browsers: ['last 2 versions'],
		cascade: false
	}))
	.pipe(rename('framework.css'))
	.pipe(gulpif(options.env == environments.pro, cleanCSS({compatibility: 'ie8'})))
	.pipe(gulp.dest(paths.dest.assets))
	.pipe(reload({stream: true}));
}

// images task
function images() {
	return gulp.src(paths.images.src)
	.pipe(gulp.dest(paths.dest.images))
	.pipe(reload({stream: true}));
};

// html task
function pages() {
	return gulp.src(paths.pages.src)
	.pipe(nunjucksRender({
		path:[paths.pages.templates]
	}))
	.pipe(gulp.dest(paths.dest.base))
	.pipe(reload({stream: true}));
}

function clean() {
	return del([paths.dest.base, 'tmp/']);
}

function watch() {
	gulp.watch(paths.scripts.src, scripts);
	gulp.watch(paths.styles.src, styles);
	gulp.watch(paths.images.src, images);
	gulp.watch(paths.pages.src, pages);
}

function serve() {
	browserSync.init(null, {
		server: {
			baseDir: paths.dest.base
		}
	});
}

exports.lint = lint;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.pages = pages;
exports.clean = clean;
exports.watch = watch;

// build dist
var build = gulp.series(clean, styles, scripts, images, pages);
gulp.task('build', build);

// server the distribution
gulp.task('serve', serve);

gulp.task('default', gulp.series(build, serve, watch));