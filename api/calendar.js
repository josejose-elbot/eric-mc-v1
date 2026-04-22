// API route for Calendar data

export default async function handler(req, res) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const demoMeetings = [
    {
      id: '1',
      title: 'Daily Standup',
      time: '09:00',
      endTime: '09:15',
      participants: ['Ana', 'Carlos', 'Eric', 'Sofia'],
      meetLink: null,
      isNext: false
    },
    {
      id: '2',
      title: 'Review de Sprint con Cliente',
      time: '11:00',
      endTime: '12:00',
      participants: ['Cliente TechCo', 'Maria', 'Eric'],
      meetLink: 'https://meet.google.com/abc-defg-hij',
      isNext: true,
      countdown: '1h 50m'
    },
    {
      id: '3',
      title: 'Planning Poker',
      time: '14:00',
      endTime: '14:30',
      participants: ['Equipo Backend'],
      meetLink: null,
      isNext: false
    },
    {
      id: '4',
      title: '1:1 con Manager',
      time: '16:00',
      endTime: '16:30',
      participants: ['Director'],
      meetLink: 'https://meet.google.com/xyz-uvwx-yz',
      isNext: false
    }
  ];

  // Generate week calendar
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayMeetings = Math.floor(Math.random() * 4);
    weekDays.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
      dayNum: date.getDate(),
      meetingCount: i === 0 ? demoMeetings.length : dayMeetings,
      isToday: i === 0
    });
  }

  res.status(200).json({
    success: true,
    meetings: demoMeetings,
    nextMeeting: demoMeetings.find(m => m.isNext) || null,
    weekDays: weekDays,
    todayTotal: demoMeetings.length
  });
}