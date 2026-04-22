// API route for Action Items (Circleback) - demo for now

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  // Circleback integration would go here
  // For now, returning structured response
  const demoActions = [
    { id: '1', text: 'Revisar emails pendientes', owner: 'Eric', dueDate: '2026-04-22', completed: false },
    { id: '2', text: 'Actualizar Jira tickets', owner: 'Eric', dueDate: '2026-04-23', completed: false }
  ];
  
  res.status(200).json({
    success: true,
    actions: demoActions,
    totalPending: demoActions.filter(a => !a.completed).length,
    dueThisWeek: 2,
    lastMeeting: {
      id: 'mt-1',
      title: 'Daily Standup',
      date: '2026-04-22',
      summary: 'Se revisaron los avances del día. No hay bloqueos.'
    }
  });
}