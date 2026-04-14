const pug = require('pug');
const path = require('path');

const filePath = path.resolve('src/pug/blog/opioid-crisis-spokane-resources.pug');
const srcPath = path.resolve('src');

try {
    const html = pug.renderFile(filePath, {
        doctype: 'html',
        filename: filePath,
        basedir: srcPath,
        timestamp: Date.now().toString()
    });
    console.log('Successfully rendered!');
} catch (error) {
    console.error('Pug Rendering Error:');
    console.error(error.message);
    process.exit(1);
}
