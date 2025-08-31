const concurrently = require('concurrently');
const upath = require('upath');

const browserSyncPath = upath.resolve(upath.dirname(__filename), '../node_modules/.bin/browser-sync');

concurrently([
    { command: 'node --inspect src/server.js', name: 'EXPRESS_SERVER_DEBUG', prefixColor: 'bgBlue.bold' },
    { 
        command: `${browserSyncPath} docs -w --no-online`,
        name: 'BROWSER_SYNC', 
        prefixColor: 'bgBlue.bold',
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