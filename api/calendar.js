// API route for Calendar data - fetches from GitHub raw

const GITHUB_RAW = 'https://raw.githubusercontent.com/josejose-elbot/eric-mc-v1/master/data';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const response = await fetch(`${GITHUB_RAW}/calendar.json`);
    const data = await response.json();
    
    const events = data.events || [];
    const now = new Date();
    
    // Parse events to meetings format
    const meetings = events.slice(0, 10).map((e, i) => {
      let time = '00:00';
      if (e.start && e.start.includes('T')) {
        time = e.start.split('T')[1]?.substring(0, 5) || '00:00';
      }
      return {
        id: e.id || String(i + 1),
        title: e.title || 'Sin título',
        time: time,
        endTime: e.end ? (e.end.includes('T') ? e.end.split('T')[1]?.substring(0, 5) : '00:00') : '00:00',
        participants: e.attendees || [],
        meetLink: e.meet_link || null,
        isNext: i === 0,
        countdown: i === 0 ? 'ahora' : null
      };
    });
    
    // Generate week days
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      weekDays.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        dayNum: date.getDate(),
        meetingCount: i === 0 ? meetings.length : Math.floor(Math.random() * 3),
        isToday: i === 0
      });
    }
    
    res.status(200).json({
      success: true,
      meetings: meetings,
      nextMeeting: meetings[0] || null,
      weekDays: weekDays,
      todayTotal: meetings.length
    });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message, meetings: [], todayTotal: 0 });
  }
}