// API route for Calendar data - fetches from GitHub raw

const GITHUB_RAW = 'https://raw.githubusercontent.com/josejose-elbot/eric-mc-v1/main/data';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const response = await fetch(`${GITHUB_RAW}/calendar.json`);
    const data = await response.json();
    
    const events = data.events || [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Filter for today's events (that aren't "Home", transporte, comida)
    const todaysEvents = events.filter(e => {
      const title = (e.title || '').toLowerCase();
      const start = String(e.start || '');
      
      // Skip all-day events and non-meetings
      if (title === 'home' || title === 'sin título' || 
          title.includes('transporte') || title.includes('comida')) {
        return false;
      }
      
      // Include events that start with today's date
      return start.startsWith(todayStr);
    }).map(e => {
      // Extract time from ISO format with timezone
      let time = '00:00';
      const start = e.start || '';
      if (start.includes('T')) {
        // Format: 2026-04-22T14:00:00-06:00
        const timePart = start.split('T')[1];
        if (timePart) {
          time = timePart.substring(0, 5);
        }
      }
      
      return {
        id: e.id || '1',
        title: e.title || 'Sin título',
        time: time,
        endTime: e.end ? (e.end.includes('T') ? e.end.split('T')[1]?.substring(0, 5) : '00:00') : '00:00',
        participants: e.attendees || [],
        meetLink: e.meet_link || null,
        isNext: false,
        countdown: null
      };
    }).sort((a, b) => a.time.localeCompare(b.time));
    
    // Set first meeting as next
    if (todaysEvents.length > 0) {
      todaysEvents[0].isNext = true;
      todaysEvents[0].countdown = 'próxima';
    }
    
    // Generate week calendar
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = events.filter(e => {
        const start = String(e.start || '');
        const title = (e.title || '').toLowerCase();
        return start.startsWith(dateStr) && title !== 'home' && !title.includes('transporte') && !title.includes('comida');
      });
      
      weekDays.push({
        date: dateStr,
        dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        dayNum: date.getDate(),
        meetingCount: dayEvents.length,
        isToday: i === 0
      });
    }
    
    res.status(200).json({
      success: true,
      meetings: todaysEvents,
      nextMeeting: todaysEvents[0] || null,
      weekDays: weekDays,
      todayTotal: todaysEvents.length
    });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message, meetings: [], todayTotal: 0 });
  }
}