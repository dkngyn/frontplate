# frontplate
A simple and custom frontend boilerplate with Gulp build systems


### Installation & Usage
```
$ npm install	// install packages
$ gulp build	// build development distribution
$ gulp serve	// run distribution with static server
$ gulp watch	// watch for changes
```

#### Gulp tasks
- `$ gulp scripts` to build javascript from typescript
- `$ gulp styles` to build styles from sass
- `$ gulp images` to build images
- `$ gulp pages` to build static pages from nunjucks
- `$ gulp lint` to lint typescript
- `$ gulp del` to clean up distribution and temporary files
- `$ gulp [task] --env production` to build production distribution
