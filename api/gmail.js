// API route for Gmail data
// Note: This needs to run on the OpenClaw server to access gcloud credentials

export default async function handler(req, res) {
  // In production, this would call the actual OpenClaw gmail.py script
  // For now, returning demo data that matches the expected structure
  
  const demoEmails = [
    {
      id: '1',
      from: 'cliente@empresa.com',
      fromName: 'María González',
      subject: 'Proposal para proyecto Q2',
      time: '10 min',
      unread: true,
      label: 'cliente'
    },
    {
      id: '2',
      from: 'jira@atlassian.com',
      fromName: 'Jira Notifications',
      subject: '[ODP] Tarea asignada: Fix login bug',
      time: '25 min',
      unread: true,
      label: 'interno'
    },
    {
      id: '3',
      from: 'propuesta@vendor.com',
      fromName: 'RFP - Nuevo sistema de pagos',
      subject: 'RFP Servicios de Desarrollo 2026',
      time: '1 hora',
      unread: true,
      label: 'RFP'
    },
    {
      id: '4',
      from: 'equipo@da.codes',
      fromName: 'Team DaCodes',
      subject: 'Resumen semanal de ingeniería',
      time: '2 horas',
      unread: false,
      label: 'interno'
    },
    {
      id: '5',
      from: 'newsletter@tech.com',
      fromName: 'Tech Weekly',
      subject: 'Las mejores herramientas de desarrollo',
      time: '5 horas',
      unread: false,
      label: 'ruido'
    }
  ];

  res.status(200).json({
    success: true,
    unreadCount: 3,
    emails: demoEmails
  });
}