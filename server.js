const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const PORT = 18989;

// Script paths
const SCRIPTS = {
  gmail: '/home/ubuntu/.openclaw/scripts/gmail.py',
  jira: '/home/ubuntu/.openclaw/scripts/jira.py',
  calendar: '/home/ubuntu/.openclaw/scripts/calendar.py',
  deploys: '/home/ubuntu/.openclaw/scripts/vercel.py'
};

async function runScript(name, args = '') {
  const script = SCRIPTS[name];
  if (!script) return { error: 'Unknown script' };
  
  try {
    let cmd = `python3 ${script} ${args}`;
    const { stdout } = await execAsync(cmd, { timeout: 30000 });
    return JSON.parse(stdout);
  } catch (err) {
    return { error: err.message };
  }
}

// Parse URL and query
function parseUrl(url) {
  const [pathname, query] = url.split('?');
  const params = new URLSearchParams(query);
  return { pathname, params };
}

// Handle API requests
async function handleApi(req, res) {
  const { pathname, params } = parseUrl(req.url);
  const endpoint = pathname.replace('/api/', '');
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.writeHead(204);
    res.end();
    return;
  }
  
  let data;
  
  try {
    switch (endpoint) {
      case 'gmail':
        data = await runScript('gmail', 'unread');
        break;
      case 'gmail/list':
        data = await runScript('gmail', 'list 10');
        break;
      case 'jira':
        data = await runScript('jira', 'mine');
        break;
      case 'calendar':
        data = await runScript('calendar', 'today');
        break;
      case 'calendar/week':
        data = await runScript('calendar', 'upcoming 7');
        break;
      case 'deploys':
        data = await runScript('deploys', 'list');
        break;
      default:
        data = { error: 'Not found' };
    }
  } catch (err) {
    data = { error: err.message };
  }
  
  res.writeHead(200);
  res.end(JSON.stringify(data));
}

// Handle static files
function handleStatic(req, res) {
  const { pathname } = parseUrl(req.url);
  
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);
  
  const ext = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  };
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    
    res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
    res.writeHead(200);
    res.end(content);
  });
}

// Main server
const server = http.createServer(async (req, res) => {
  const { pathname } = parseUrl(req.url);
  
  if (pathname.startsWith('/api/')) {
    await handleApi(req, res);
  } else {
    handleStatic(req, res);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mission Control server running on http://0.0.0.0:${PORT}`);
});