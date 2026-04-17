'use strict';
const fs = require('fs');
const upath = require('upath');
const sh = require('shelljs');

const sharp = require('sharp');

module.exports = async function renderAssets() {
    const sourcePath = upath.resolve(upath.dirname(__filename), '../src/assets');
    const destPath = upath.resolve(upath.dirname(__filename), '../docs/.');
    
    sh.cp('-R', sourcePath, destPath);

    const imgDestPath = upath.resolve(destPath, 'assets/img');
    const files = sh.find(imgDestPath).filter(f => f.match(/\.(jpg|png|jpeg)$/i));

    for (const file of files) {
        try {
            const webpPath = file.replace(/\.(jpg|png|jpeg)$/i, '.webp');
            await sharp(file)
                .webp({ quality: 80, effort: 6 })
                .toFile(webpPath);
        } catch (err) {
            console.error('Error optimizing image:', file, err);
        }
    }
};