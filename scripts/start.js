const concurrently = require('concurrently');
const upath = require('upath');

const browserSyncPath = upath.resolve(upath.dirname(__filename), '../node_modules/.bin/browser-sync');

concurrently([
    { command: 'node src/server.js', name: 'EXPRESS_SERVER', prefixColor: 'bgBlue.bold' },
    { 
        command: `"${browserSyncPath}" --reload-delay 2000 --reload-debounce 2000 docs -w --no-online`,
        name: 'BROWSER_SYNC', 
        prefixColor: 'bgGreen.bold',
    }
], {
    prefix: 'name',
    killOthers: ['failure', 'success'],
}).then(success, failure);

function success() {
    console.log('Success');    
}

function failure() {
    console.log('Failure');
}