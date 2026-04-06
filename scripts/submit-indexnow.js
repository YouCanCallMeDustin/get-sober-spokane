const https = require('https');
const fs = require('fs');
const path = require('path');

const HOST = 'www.getsoberspokane.com';
const API_KEY = 'abfda58abd0480aa668dd43578e1700';

function getUrlsFromSitemap() {
    const sitemapPath = path.join(__dirname, '../docs/sitemap.xml');
    try {
        const content = fs.readFileSync(sitemapPath, 'utf8');
        const urls = [];
        const regex = /<loc>(http.*?)<\/loc>/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            urls.push(match[1]);
        }
        return urls;
    } catch (error) {
        console.error('Error reading sitemap:', error);
        return [];
    }
}

async function submitToIndexNow() {
    const urlList = getUrlsFromSitemap();
    
    if (urlList.length === 0) {
        console.error('No URLs found to submit.');
        return;
    }

    const payload = JSON.stringify({
        host: HOST,
        key: API_KEY,
        keyLocation: `https://${HOST}/${API_KEY}.txt`,
        urlList: urlList
    });

    const options = {
        hostname: 'api.indexnow.org',
        port: 443,
        path: '/indexnow',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    console.log(`Submitting ${urlList.length} URLs to IndexNow...`);

    const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
            responseBody += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log('✅ IndexNow submission successful!');
            } else if (res.statusCode === 202) {
                console.log('✅ IndexNow submission accepted (Processing).');
            } else {
                console.error(`❌ IndexNow submission failed. Status Code: ${res.statusCode}`);
                console.error('Response:', responseBody);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Error submitting to IndexNow:', error.message);
    });

    req.write(payload);
    req.end();
}

submitToIndexNow();
