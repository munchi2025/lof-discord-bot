/**
 * GIF Downloader Script for Discord Bot
 * Downloads anime GIFs from waifu.pics API for affection actions
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..', 'src', 'assets', 'gifs', 'affection');

// All affection actions mapped to waifu.pics endpoints
const ACTIONS = {
    hug: 'hug',
    pat: 'pat',
    cuddle: 'cuddle',
    poke: 'poke',
    wave: 'wave',
    highfive: 'highfive',
    handhold: 'handhold',
    boop: 'poke',      // Use poke as substitute for boop
    snuggle: 'cuddle', // Use cuddle as substitute for snuggle
    glomp: 'glomp'     // waifu.pics has glomp!
};

const GIFS_PER_ACTION = 20;

function postJson(url, data) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const postData = JSON.stringify(data);

        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(responseData));
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${responseData.substring(0, 200)}`));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

function getJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse: ${data.substring(0, 200)}`));
                }
            });
        }).on('error', reject);
    });
}

function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                file.close();
                fs.unlinkSync(filepath);
                downloadFile(response.headers.location, filepath)
                    .then(resolve)
                    .catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                file.close();
                fs.unlinkSync(filepath);
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(filepath);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

async function downloadGifsForAction(action, endpoint) {
    const actionDir = path.join(BASE_DIR, action);

    if (!fs.existsSync(actionDir)) {
        fs.mkdirSync(actionDir, { recursive: true });
    }

    console.log(`\nDownloading GIFs for: ${action}`);

    try {
        // waifu.pics /many endpoint to get multiple images at once
        const apiUrl = `https://api.waifu.pics/many/sfw/${endpoint}`;
        console.log(`  Fetching from: ${apiUrl}`);

        // POST request with empty exclude array to get many images
        const response = await postJson(apiUrl, { exclude: [] });

        if (!response.files || response.files.length === 0) {
            console.log(`  No results found for ${action}`);
            return 0;
        }

        // Limit to GIFS_PER_ACTION
        const urls = response.files.slice(0, GIFS_PER_ACTION);
        console.log(`  Found ${urls.length} GIFs`);

        let downloaded = 0;
        for (let i = 0; i < urls.length; i++) {
            const gifUrl = urls[i];
            const ext = gifUrl.toLowerCase().endsWith('.gif') ? '.gif' : '.gif';
            const filename = `${action}_${String(i + 1).padStart(2, '0')}${ext}`;
            const filepath = path.join(actionDir, filename);

            try {
                await downloadFile(gifUrl, filepath);
                console.log(`  Downloaded: ${filename}`);
                downloaded++;
            } catch (err) {
                console.error(`  Failed to download ${filename}: ${err.message}`);
            }
        }

        console.log(`  Completed ${action}: ${downloaded}/${urls.length} GIFs downloaded`);
        return downloaded;

    } catch (err) {
        console.error(`  Error fetching ${action}: ${err.message}`);

        // Fallback: try single requests
        console.log(`  Trying single request fallback...`);
        return await downloadSingleGifs(action, endpoint);
    }
}

async function downloadSingleGifs(action, endpoint) {
    const actionDir = path.join(BASE_DIR, action);
    let downloaded = 0;

    for (let i = 0; i < GIFS_PER_ACTION; i++) {
        try {
            const response = await getJson(`https://api.waifu.pics/sfw/${endpoint}`);

            if (response.url) {
                const gifUrl = response.url;
                const filename = `${action}_${String(i + 1).padStart(2, '0')}.gif`;
                const filepath = path.join(actionDir, filename);

                await downloadFile(gifUrl, filepath);
                console.log(`  Downloaded: ${filename}`);
                downloaded++;
            }

            // Small delay to be nice to the API
            await new Promise(r => setTimeout(r, 200));
        } catch (err) {
            console.error(`  Error on single request ${i + 1}: ${err.message}`);
        }
    }

    console.log(`  Completed ${action}: ${downloaded}/${GIFS_PER_ACTION} GIFs downloaded`);
    return downloaded;
}

async function main() {
    console.log('='.repeat(50));
    console.log('Anime GIF Downloader for Discord Bot');
    console.log('Source: waifu.pics API');
    console.log('='.repeat(50));

    let totalDownloaded = 0;

    for (const [action, endpoint] of Object.entries(ACTIONS)) {
        const count = await downloadGifsForAction(action, endpoint);
        totalDownloaded += count;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Download complete! Total: ${totalDownloaded} GIFs`);
    console.log('='.repeat(50));
}

main().catch(console.error);
