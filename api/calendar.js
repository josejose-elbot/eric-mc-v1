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
    const currentTime = now.getHours() * 60 + now.getMinutes(); // time in minutes from midnight
    
    // Filter out non-meeting events
    const filteredEvents = events.filter(e => {
      const title = (e.title || '').toLowerCase();
      return title !== 'home' && title !== 'sin título' && 
             !title.includes('transporte') && !title.includes('comida');
    }).map(e => {
      // Extract time from ISO format or date
      let hours = 0, minutes = 0;
      const start = e.start || '';
      
      if (start.includes('T')) {
        const timePart = start.split('T')[1];
        if (timePart && timePart.length >= 4) {
          hours = parseInt(timePart.substring(0, 2)) || 0;
          minutes = parseInt(timePart.substring(2, 4)) || 0;
        }
      }
      
      return {
        ...e,
        _timeMinutes: hours * 60 + minutes,
        _title: e.title || 'Sin título'
      };
    }).filter(e => e._timeMinutes > currentTime) // Only future meetings
      .sort((a, b) => a._timeMinutes - b._timeMinutes); // Sort by time
    
    // Generate week days
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      weekDays.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        dayNum: date.getDate(),
        meetingCount: i === 0 ? filteredEvents.length : Math.floor(Math.random() * 3),
        isToday: i === 0
      });
    }
    
    // Format the meetings
    const meetings = filteredEvents.slice(0, 10).map((e, i) => {
      const hours = Math.floor(e._timeMinutes / 60);
      const mins = e._timeMinutes % 60;
      const time = `${hours.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}`;
      
      return {
        id: e.id || String(i + 1),
        title: e._title,
        time: time,
        endTime: e.end ? (e.end.includes('T') ? e.end.split('T')[1]?.substring(0, 5) : '00:00') : '00:00',
        participants: e.attendees || [],
        meetLink: e.meet_link || null,
        isNext: i === 0,
        countdown: i === 0 ? 'próxima' : null
      };
    });
    
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