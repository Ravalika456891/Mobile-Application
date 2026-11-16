const { toQR } = require('../node_modules/toqr/dist/toqr.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Detect local Wi-Fi IP
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '192.168.1.9';
}

const localIP = getLocalIP();
const url = `exp://${localIP}:8081`;
const matrix = toQR(url);
const size = Math.sqrt(matrix.length);
const quietZone = 4;
const totalSize = size + quietZone * 2;
const scale = 12;
const svgSize = totalSize * scale;

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="300" height="300">
  <rect width="${svgSize}" height="${svgSize}" fill="#FFFFFF"/>
`;

for (let r = 0; r < size; r++) {
  for (let c = 0; c < size; c++) {
    if (matrix[r * size + c]) {
      const x = (c + quietZone) * scale;
      const y = (r + quietZone) * scale;
      svg += `  <rect x="${x}" y="${y}" width="${scale}" height="${scale}" fill="#111827"/>\n`;
    }
  }
}
svg += `</svg>`;

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Scan MyGroceries in Expo Go</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
    background: #0f172a;
    color: #f8fafc;
    padding: 24px;
  }
  .card {
    background: #1e293b;
    border: 1px solid #334155;
    padding: 36px 32px;
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    text-align: center;
    max-width: 460px;
    width: 100%;
  }
  .brand-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 6px;
  }
  h1 {
    color: #10b981;
    font-size: 28px;
    margin: 0;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
  .sdk-badge {
    background: #0284c7;
    color: white;
    padding: 3px 9px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
  }
  .subtitle {
    color: #94a3b8;
    font-size: 15px;
    margin: 0 0 24px 0;
  }
  .qr-wrapper {
    background: white;
    padding: 16px;
    border-radius: 20px;
    display: inline-block;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    margin-bottom: 24px;
    line-height: 0;
  }
  .url-label {
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 700;
  }
  .url-container {
    background: #064e3b;
    border: 1px solid #059669;
    padding: 12px 18px;
    border-radius: 12px;
    display: inline-block;
    margin-bottom: 24px;
    width: 100%;
  }
  .url-text {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    color: #34d399;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  .instructions {
    text-align: left;
    background: #0f172a;
    border-radius: 16px;
    padding: 20px 22px;
    border: 1px solid #334155;
  }
  .instructions h3 {
    margin: 0 0 14px 0;
    font-size: 14px;
    color: #38bdf8;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .instructions ol {
    margin: 0;
    padding-left: 20px;
    color: #cbd5e1;
    font-size: 14px;
    line-height: 1.7;
  }
  .instructions li {
    margin-bottom: 8px;
  }
  .instructions li:last-child {
    margin-bottom: 0;
  }
  .instructions code {
    background: #1e293b;
    color: #38bdf8;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
  }
  .demo-creds {
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px dashed #334155;
    font-size: 13px;
    color: #94a3b8;
  }
  .demo-creds span {
    color: #f1f5f9;
    font-weight: 600;
  }
</style>
</head>
<body>
<div class="card">
  <div class="brand-header">
    <h1>🛒 MyGroceries</h1>
    <span class="sdk-badge">Expo SDK 58</span>
  </div>
  <p class="subtitle">Scan directly with <b>Expo Go</b> on Android</p>
  
  <div class="qr-wrapper">
    ${svg}
  </div>

  <div class="url-label">Direct Expo Go URL:</div>
  <div class="url-container">
    <span class="url-text">${url}</span>
  </div>

  <div class="instructions">
    <h3>📲 How to Open On Your Phone:</h3>
    <ol>
      <li>Connect your phone to the same Wi-Fi (<code>${localIP}</code>).</li>
      <li>Open <b>Expo Go</b> app on your phone.</li>
      <li>Tap <b>Scan QR code</b> and point your camera here.</li>
      <li><i>Or tap <b>Enter URL manually</b> and enter: <code>${url}</code></i></li>
    </ol>
    <div class="demo-creds">
      Test Login: <span>9876543210</span> | Password: <span>Password123</span><br>
      <i>(Or tap "1-Tap Demo Login" on the login screen)</i>
    </div>
  </div>
</div>
</body>
</html>`;

const assetsDir = path.join(__dirname, '..', 'assets');
fs.writeFileSync(path.join(assetsDir, 'expo_qr.html'), html, 'utf8');
fs.writeFileSync(path.join(assetsDir, 'expo_qr.svg'), svg, 'utf8');
console.log(`[SUCCESS] QR Code generated for ${url}`);
console.log(`Saved to ${path.join(assetsDir, 'expo_qr.html')}`);
