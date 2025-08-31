'use strict';
const autoprefixer = require('autoprefixer')
const fs = require('fs');
const packageJSON = require('../package.json');
const upath = require('upath');
const postcss = require('postcss')
const sass = require('sass');
const sh = require('shelljs');

const stylesPath = upath.resolve(upath.dirname(__filename), '../src/scss/styles.scss');
const destPath = upath.resolve(upath.dirname(__filename), '../docs/css/styles.css');

module.exports = function renderSCSS() {
    try {
        // Read the main SCSS file
        const scssContent = fs.readFileSync(stylesPath, 'utf8');
        
        // Add header comment
        const entryPoint = `/*!
* Start Bootstrap - ${packageJSON.title} v${packageJSON.version} (${packageJSON.homepage})
* Copyright 2013-${new Date().getFullYear()} ${packageJSON.author}
* Licensed under ${packageJSON.license} (https://github.com/StartBootstrap/${packageJSON.name}/blob/master/LICENSE)
* Generated: ${new Date().toISOString()}
*/
${scssContent}`;

        const results = sass.renderSync({
            data: entryPoint,
            includePaths: [
                upath.resolve(upath.dirname(__filename), '../src/scss'),
                upath.resolve(upath.dirname(__filename), '../node_modules')
            ],
            outputStyle: 'expanded'
        });

        const destPathDirname = upath.dirname(destPath);
        if (!sh.test('-e', destPathDirname)) {
            sh.mkdir('-p', destPathDirname);
        }

        postcss([ autoprefixer ]).process(results.css, {from: 'styles.css', to: 'styles.css'}).then(result => {
            result.warnings().forEach(warn => {
                console.warn(warn.toString())
            })
            fs.writeFileSync(destPath, result.css.toString());
            console.log(`✅ SCSS compiled successfully to: ${destPath}`);
        }).catch(error => {
            console.error('❌ PostCSS processing failed:', error);
        });

    } catch (error) {
        console.error('❌ SCSS compilation failed:', error);
        process.exit(1);
    }
};