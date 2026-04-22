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
    
    const meetings = events.map((e, i) => ({
      id: String(i + 1),
      title: e.summary || 'Reunión',
      time: e.start?.time || '09:00',
      endTime: e.end?.time || '10:00',
      participants: e.attendees?.map(a => a.email.split('@')[0]) || [],
      meetLink: e.conferenceData?.entryPoints?.[0]?.uri || null,
      isNext: i === 0,
      countdown: i === 0 ? 'ahora' : null
    }));
    
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