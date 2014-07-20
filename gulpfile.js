var gulp =require('gulp')
var wiredep = require('wiredep').stream;
var debug = require('gulp-debug');
var clean = require('gulp-clean');
var sass = require('gulp-sass')


var paths = {
	scripts: ['./app/js/*.js'],
	css: ['./app/css/*.css'],
	index: './app/index.html',
	dist: './dist/',
	bower : './app/bower_components/',
	images: './app/img/*.png', css: './app/css/*.css'
};

gulp.task('bower', function () {

	// copy and flatten JS deps
	gulp.src(['./app/bower_components/**/*.js','!./app/bower_components/**/*.min.js'])
		.pipe(gulp.dest('./dist/bower_components'));

	gulp.src(paths.index)
		.pipe(debug({verbose: true}))
		.pipe(wiredep({
			directory: paths.bower,
		}))
		.pipe(gulp.dest(paths.dist));


})

gulp.task('copy', function(){
	 gulp.src(paths.scripts)
		.pipe(gulp.dest('./dist/js'))

	gulp.src(paths.images)
		.pipe(gulp.dest('./dist/img'))

	gulp.src(paths.styles)
		.pipe(gulp.dest('./dist/css'))

})

gulp.task('connect', function () {
	var connect = require('connect');

	var app = connect()
		.use(require('connect-livereload')({ port: 35729 }))
		.use(connect.static('dist'))
		.use(connect.directory('app'));

	require('http').createServer(app)
		.listen(9000)
		.on('listening', function () {
			console.log('Started connect web server on http://localhost:9000');
		});
});

gulp.task('clean', function () {
	return gulp.src(['dist'], { read: false }).pipe(clean());
});

gulp.task('sass', function(){
	gulp.src('./app/styles/**.scss')
		.pipe(sass())
		.pipe(gulp.dest('./dist/css'));
})

// required default task
gulp.task('default', ['bower'])

gulp.task('build', ['bower','sass','copy'])