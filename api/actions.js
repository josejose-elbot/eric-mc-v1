// API route for Circleback/Meeting Action Items

export default async function handler(req, res) {
  const demoActions = [
    {
      id: '1',
      text: 'Revisar propuesta de cliente TechCo',
      owner: 'Eric',
      dueDate: '2026-04-22',
      meetingId: 'mt-123',
      meetingTitle: 'Review Sprint Q2',
      completed: false
    },
    {
      id: '2',
      text: 'Enviar estimé de costos a proveedor',
      owner: 'Eric',
      dueDate: '2026-04-23',
      meetingId: 'mt-124',
      meetingTitle: ' call de proveedores',
      completed: false
    },
    {
      id: '3',
      text: 'Aprobar diseño de dashboard',
      owner: 'Maria',
      dueDate: '2026-04-22',
      meetingId: 'mt-125',
      meetingTitle: 'Design Review',
      completed: false
    },
    {
      id: '4',
      text: 'Actualizar backlog de Jira',
      owner: 'Carlos',
      dueDate: '2026-04-24',
      meetingId: 'mt-126',
      meetingTitle: 'Sprint Planning',
      completed: false
    },
    {
      id: '5',
      text: 'Preparar demo para viernes',
      owner: 'Eric',
      dueDate: '2026-04-25',
      meetingId: 'mt-127',
      meetingTitle: 'Prep Demo',
      completed: false
    }
  ];

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const dueThisWeek = demoActions.filter(a => {
    const due = new Date(a.dueDate);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return !a.completed && due <= weekFromNow;
  }).length;

  const lastMeeting = {
    id: 'mt-125',
    title: 'Design Review',
    date: '2026-04-21',
    summary: 'Se revisaron los mockups del nuevo dashboard. Aprobado el diseño de la página principal. Pendiente: detalles de móvil.'
  };

  res.status(200).json({
    success: true,
    actions: demoActions,
    totalPending: demoActions.filter(a => !a.completed).length,
    dueThisWeek: dueThisWeek,
    lastMeeting: lastMeeting
  });
}