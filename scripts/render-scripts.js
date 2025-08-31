'use strict';
const fs = require('fs');
const packageJSON = require('../package.json');
const upath = require('upath');
const sh = require('shelljs');

module.exports = function renderScripts() {

    const sourcePath = upath.resolve(upath.dirname(__filename), '../src/js');
    const destPath = upath.resolve(upath.dirname(__filename), '../docs/.');
    
    sh.cp('-R', sourcePath, destPath)

    // Add cache-busting timestamp to all JS files
    const jsFiles = [
        'scripts.js',
        'user-profile.js',
        'community-forum.js',
        'auth.js',
        'config.js'
    ];

    const copyright = `/*!
* Start Bootstrap - ${packageJSON.title} v${packageJSON.version} (${packageJSON.homepage})
* Copyright 2013-${new Date().getFullYear()} ${packageJSON.author}
* Licensed under ${packageJSON.license} (https://github.com/StartBootstrap/${packageJSON.name}/blob/master/LICENSE)
* Built: ${new Date().toISOString()}
*/
`

    jsFiles.forEach(filename => {
        const sourcePathJS = upath.resolve(upath.dirname(__filename), `../src/js/${filename}`);
        const destPathJS = upath.resolve(upath.dirname(__filename), `../docs/js/${filename}`);
        
        if (fs.existsSync(sourcePathJS)) {
            const jsContent = fs.readFileSync(sourcePathJS);
            fs.writeFileSync(destPathJS, copyright + jsContent);
        }
    });
};