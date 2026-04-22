// API route for Jira data - fetches from GitHub raw

const GITHUB_RAW = 'https://raw.githubusercontent.com/josejose-elbot/eric-mc-v1/main/data';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const response = await fetch(`${GITHUB_RAW}/jira.json`);
    const data = await response.json();
    
    const issues = data.issues || [];
    const blocked = issues.filter(i => i.status === 'BLOCKED' || i.status === 'Bloqueado');
    const inProgress = issues.filter(i => i.status === 'In Progress' || i.status === 'En Progreso');
    const todo = issues.filter(i => i.status === 'To Do' || i.status === 'Pendiente' || i.status === 'Pausada');
    
    res.status(200).json({
      success: true,
      blocked: blocked.slice(0, 10).map(i => ({
        key: i.key,
        title: i.summary,
        status: 'blocked',
        priority: i.priority?.toLowerCase() || 'medium'
      })),
      inProgress: inProgress.slice(0, 10).map(i => ({
        key: i.key,
        title: i.summary,
        status: 'in-progress',
        priority: i.priority?.toLowerCase() || 'medium'
      })),
      todo: todo.slice(0, 10).map(i => ({
        key: i.key,
        title: i.summary,
        status: 'todo',
        priority: i.priority?.toLowerCase() || 'medium'
      })),
      sprint: {
        name: 'Sprint Activo',
        progress: 65,
        total: 8,
        completed: 5
      }
    });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message });
  }
}