// API route for Vercel Deploys

export default async function handler(req, res) {
  const demoDeploys = [
    {
      id: '1',
      name: 'payflow-landing',
      url: 'https://payflow-landing.vercel.app',
      status: 'ready',
      lastDeploy: '2026-04-22T06:50:00Z',
      branch: 'main'
    },
    {
      id: '2',
      name: 'openclaw-pacman',
      url: 'https://openclaw-pacman.vercel.app',
      status: 'ready',
      lastDeploy: '2026-04-22T07:20:00Z',
      branch: 'main'
    },
    {
      id: '3',
      name: 'mc-dashboard',
      url: 'https://mc-dashboard.vercel.app',
      status: 'building',
      lastDeploy: '2026-04-22T16:08:00Z',
      branch: 'main'
    },
    {
      id: '4',
      name: 'landing-v2',
      url: 'https://landing-v2.vercel.app',
      status: 'error',
      lastDeploy: '2026-04-21T14:30:00Z',
      branch: 'develop'
    }
  ];

  const stats = {
    total: demoDeploys.length,
    ready: demoDeploys.filter(d => d.status === 'ready').length,
    building: demoDeploys.filter(d => d.status === 'building').length,
    error: demoDeploys.filter(d => d.status === 'error').length
  };

  res.status(200).json({
    success: true,
    deploys: demoDeploys,
    stats: stats
  });
}