// API route for Jira data

export default async function handler(req, res) {
  const demoTickets = {
    blocked: [
      { key: 'ODP-142', title: 'API de pagos no responde', status: 'blocked', priority: 'high' },
      { key: 'ODP-138', title: 'Error en dashboard de métricas', status: 'blocked', priority: 'medium' }
    ],
    inProgress: [
      { key: 'ODP-145', title: 'Implementar autenticación OAuth', status: 'in-progress', priority: 'high' },
      { key: 'ODP-150', title: 'Refactorizar módulo de usuarios', status: 'in-progress', priority: 'medium' },
      { key: 'ODP-152', title: 'Optimizar queries de reportes', status: 'in-progress', priority: 'low' }
    ],
    todo: [
      { key: 'ODP-155', title: 'Agregar filtros avanzados', status: 'todo', priority: 'medium' },
      { key: 'ODP-158', title: 'Actualizar documentación de API', status: 'todo', priority: 'low' }
    ],
    sprint: {
      name: 'Sprint 23',
      progress: 65,
      total: 8,
      completed: 5
    }
  };

  res.status(200).json({
    success: true,
    ...demoTickets
  });
}