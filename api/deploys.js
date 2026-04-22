// API route for Deploys data - fetches from GitHub raw

const GITHUB_RAW = 'https://raw.githubusercontent.com/josejose-elbot/eric-mc-v1/master/data';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const response = await fetch(`${GITHUB_RAW}/deploys.json`);
    const data = await response.json();
    
    const projects = data.projects || [];
    const deploys = projects.map((p, i) => ({
      id: String(i + 1),
      name: p.name || `project-${i}`,
      url: p.url || 'https://example.vercel.app',
      status: p.state === 'READY' ? 'ready' : p.state === 'BUILDING' ? 'building' : 'error',
      lastDeploy: p.created || new Date().toISOString(),
      branch: p.branch || 'main'
    }));
    
    res.status(200).json({
      success: true,
      deploys: deploys,
      stats: {
        total: deploys.length,
        ready: deploys.filter(d => d.status === 'ready').length,
        building: deploys.filter(d => d.status === 'building').length,
        error: deploys.filter(d => d.status === 'error').length
      }
    });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message, deploys: [] });
  }
}