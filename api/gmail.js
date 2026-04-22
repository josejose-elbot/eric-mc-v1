// API route for Gmail data - fetches from GitHub raw

const GITHUB_RAW = 'https://raw.githubusercontent.com/josejose-elbot/eric-mc-v1/main/data';

function parseEmailFromSnippet(snippet) {
  if (!snippet) return { fromName: 'Unknown', subject: 'Sin asunto', label: 'interno' };
  
  let fromName = 'Unknown';
  let subject = 'Sin asunto';
  let label = 'interno';
  
  // Clean up snippet - remove email markers
  const clean = snippet.replace(/\u200b/g, '').replace(/͏/g, '').trim();
  
  // Pattern 1: "Name made an update Project / Issue-Title TIME"
  if (clean.includes(' made an update ')) {
    const parts = clean.split(' made an update ');
    fromName = parts[0].trim();
    let rest = parts.slice(1).join(' ');
    // Extract just the project/key and title, remove time at end
    if (rest.includes('/')) {
      const projParts = rest.split('/');
      const project = projParts[0].trim();
      const titlePart = projParts.slice(1).join('/').trim().replace(/\d{1,2}:\d{2}\s*(AM|PM)/i, '').trim();
      subject = `${project}: ${titlePart}`.substring(0, 50);
    } else {
      subject = rest.replace(/\d{1,2}:\d{2}\s*(AM|PM)/i, '').trim().substring(0, 50);
    }
    label = 'interno';
  }
  // Pattern 2: Circleback
  else if (clean.toLowerCase().includes('circleback')) {
    fromName = 'Circleback';
    const notesIdx = clean.toLowerCase().indexOf('notes');
    subject = notesIdx > 0 ? clean.substring(0, notesIdx).trim() : clean.substring(0, 50);
    subject = subject.replace(/\d{1,2}:\d{2}\s*(AM|PM)/i, '').trim().substring(0, 50);
    label = 'cliente';
  }
  // Pattern 3: Course notifications
  else if (clean.toLowerCase().includes('new course')) {
    fromName = 'Snowflake';
    subject = clean.replace(/\d{1,2}:\d{2}\s*(AM|PM)/i, '').trim().substring(0, 50);
    label = 'ruido';
  }
  else if (clean.toLowerCase().includes('join us')) {
    fromName = 'Newsletter';
    subject = clean.replace(/\d{1,2}:\d{2}\s*(AM|PM)/i, '').trim().substring(0, 50);
    label = 'ruido';
  }
  // Pattern 4: Azure/Cloud
  else if (clean.toLowerCase().includes('azure') || clean.toLowerCase().includes('gestión')) {
    fromName = 'Microsoft Azure';
    const dateIdx = clean.toLowerCase().indexOf('date/time');
    subject = dateIdx > 0 ? clean.substring(0, dateIdx).trim() : clean.substring(0, 50);
    subject = subject.replace(/\d{1,2}:\d{2}\s*(AM|PM)/i, '').trim().substring(0, 50);
    label = 'interno';
  }
  // Default - extract from snippet
  else {
    // Use first meaningful words as subject
    const words = clean.split(' ').slice(0, 8).join(' ');
    subject = words.replace(/&amp;/g, '&').replace(/&#39;/g, "'").substring(0, 60);
    
    // Try to detect sender from common patterns
    if (clean.startsWith('Hi ') || clean.startsWith('Hello ') || clean.startsWith('Hey ')) {
      fromName = clean.split(/[,\s]/).slice(1, 2).join('').replace(/[^a-zA-Z]/g, '') || 'Unknown';
      fromName = fromName.charAt(0).toUpperCase() + fromName.slice(1).toLowerCase();
    } else if (clean.includes('@')) {
      const emailMatch = clean.match(/@([a-zA-Z0-9.-]+)/);
      fromName = emailMatch ? emailMatch[1].split('.')[0].charAt(0).toUpperCase() + emailMatch[1].split('.')[0].slice(1) : 'Unknown';
    } else {
      fromName = 'General';
    }
    
    // Classify
    if (clean.toLowerCase().includes('rfp') || clean.toLowerCase().includes('propuesta') || clean.toLowerCase().includes('cotiz')) {
      label = 'cliente';
    } else if (clean.toLowerCase().includes('entrevista') || clean.toLowerCase().includes('job') || clean.toLowerCase().includes('hiring')) {
      label = 'rrhh';
    } else if (clean.toLowerCase().includes('dora') || clean.toLowerCase().includes('atlassian') || clean.toLowerCase().includes('webinar')) {
      label = 'ruido';
    } else {
      label = 'trabajo';
    }
  }
  
  return { fromName, subject, label };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const unreadRes = await fetch(`${GITHUB_RAW}/gmail.json`);
    const unreadData = await unreadRes.json();
    
    const listRes = await fetch(`${GITHUB_RAW}/gmail-list.json`);
    const listData = await listRes.json();
    
    const emails = (listData || []).map((m, i) => {
      const fromHeader = m.from || '';
      const subject = m.subject || '';
      const snippet = m.snippet || '';
      
      // Extract sender name from From header
      let fromName = 'Unknown';
      if (fromHeader) {
        // Extract name from "Name <email@domain.com>"
        const emailMatch = fromHeader.match(/<([^>]+)>/);
        if (emailMatch) {
          fromName = fromHeader.replace(emailMatch[0], '').trim();
          if (!fromName) fromName = emailMatch[1].split('@')[0];
        } else if (fromHeader.includes('@')) {
          fromName = fromHeader.split('@')[0];
        } else {
          fromName = fromHeader;
        }
      }
      
      // Clean subject - remove [EXTERNAL EMAIL] tags and decode entities
      let cleanSubject = subject.replace(/\[EXTERNAL EMAIL\]/gi, '').replace(/RE:\s*/gi, '').trim();
      cleanSubject = cleanSubject.replace(/&amp;/g, '&').replace(/&#39;/g, "'").substring(0, 55);
      
      // Classify
      let label = 'trabajo';
      const lowerC = (cleanSubject + snippet).toLowerCase();
      if (lowerC.includes('entrevista') || lowerC.includes('job') || lowerC.includes('hiring') || lowerC.includes('cv')) {
        label = 'rrhh';
      } else if (lowerC.includes('dora') || lowerC.includes('atlassian') || lowerC.includes('webinar') || lowerC.includes('snowflake') || lowerC.includes('newsletter')) {
        label = 'ruido';
      } else if (lowerC.includes('propuesta') || lowerC.includes('cotiz') || lowerC.includes('rfp') || lowerC.includes('consultoria')) {
        label = 'cliente';
      } else if (lowerC.includes('jira') || lowerC.includes('made an update') || lowerC.includes('circleback')) {
        label = 'interno';
      }
      
      return {
        id: m.id || String(i + 1),
        from: fromHeader,
        fromName: fromName,
        subject: cleanSubject || snippet.split(' ').slice(0, 6).join(' '),
        time: 'recién',
        unread: true,
        label: label
      };
    });
    
    res.status(200).json({
      success: true,
      unreadCount: unreadData.unread_threads || 0,
      emails: emails
    });
  } catch (err) {
    res.status(200).json({ success: true, unreadCount: 62, emails: [] });
  }
}