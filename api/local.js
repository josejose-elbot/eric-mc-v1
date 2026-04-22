const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const scripts = {
  gmail: '/home/ubuntu/.openclaw/scripts/gmail.py',
  jira: '/home/ubuntu/.openclaw/scripts/jira.py',
  calendar: '/home/ubuntu/.openclaw/scripts/calendar.py',
  actions: '/home/ubuntu/.openclaw/scripts/circleback.py',
  deploys: '/home/ubuntu/.openclaw/scripts/vercel.py'
};

async function runScript(name) {
  const script = scripts[name];
  if (!script) return { error: 'Unknown script' };
  
  try {
    let cmd = `python3 ${script}`;
    if (name === 'gmail') cmd += ' list 10';
    if (name === 'jira') cmd += ' mine';
    if (name === 'calendar') cmd += ' today';
    if (name === 'actions') cmd += ' action-items --last 7';
    if (name === 'deploys') cmd += ' list';
    
    const { stdout } = await execAsync(cmd, { timeout: 30000 });
    return JSON.parse(stdout);
  } catch (err) {
    return { error: err.message };
  }
}

module.exports = { runScript };