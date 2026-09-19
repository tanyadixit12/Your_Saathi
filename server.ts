import express, { Request, Response } from 'express';
import path from 'path';
import { z } from 'zod';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  getDb,
  saveDb,
  getFullUserData,
  resetDemoData,
} from './server/db';
import {
  generateDailyBriefing,
  simplifyDocument,
  simplifyDocumentMore,
  analyzeSuspiciousMessage,
  generateTaskPreparation,
  answerCompanionQuestion,
  invalidateAiCache,
} from './server/ai';

dotenv.config();

const app = express();
const PORT = 3000;

// Security & Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Simple in-memory rate limiter for AI endpoints (Max 60 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const aiRateLimiter = (req: Request, res: Response, next: any) => {
  const ip = req.ip || req.socket.remoteAddress || 'client';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const current = rateLimitMap.get(ip);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (current.count >= 60) {
    return res.status(429).json({
      error: 'Please wait a moment before asking Aasra again. We are taking care of your requests.',
    });
  }

  current.count++;
  next();
};

// Request logging without leaking sensitive personal payload content
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[Aasra API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Full state endpoint
app.get('/api/user/data', async (req: Request, res: Response) => {
  try {
    const data = await getFullUserData('user_demo');
    res.json(data);
  } catch (err) {
    console.error('Failed to get user data:', err);
    res.status(500).json({ error: 'Failed to retrieve application data.' });
  }
});

// Reset Demo Data
app.post('/api/user/reset', async (req: Request, res: Response) => {
  try {
    invalidateAiCache();
    const data = await resetDemoData();
    res.json({ message: 'Demo data reset successfully.', data });
  } catch (err) {
    console.error('Failed to reset demo data:', err);
    res.status(500).json({ error: 'Failed to reset demo data.' });
  }
});

// -------------------------------------------------------------
// MEDICINES API
// -------------------------------------------------------------
const CreateMedicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required').max(100),
  dosage: z.string().min(1, 'Dosage is required').max(50),
  time: z.string().min(1, 'Time is required').max(20),
  frequency: z.string().min(1, 'Frequency is required').max(100),
  instructions: z.string().max(300).optional(),
});

app.post('/api/medicines', async (req: Request, res: Response) => {
  try {
    const parsed = CreateMedicineSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const { name, dosage, time, frequency, instructions } = parsed.data;
    const db = await getDb();
    const id = `med_${Date.now()}`;
    const aiExplanation = `Take ${name} ${dosage} at ${time}. ${instructions || ''}`.trim();

    db.run(
      `INSERT INTO medicines (id, userId, name, dosage, time, frequency, instructions, status, aiExplanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, 'user_demo', name, dosage, time, frequency, instructions || '', 'pending', aiExplanation]
    );
    saveDb();

    res.status(201).json({
      id,
      userId: 'user_demo',
      name,
      dosage,
      time,
      frequency,
      instructions: instructions || '',
      status: 'pending',
      aiExplanation,
    });
  } catch (err) {
    console.error('Error creating medicine:', err);
    res.status(500).json({ error: 'Unable to save medicine right now.' });
  }
});

app.patch('/api/medicines/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'taken', 'skipped'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const db = await getDb();
    db.run('UPDATE medicines SET status = ? WHERE id = ?', [status, id]);
    saveDb();
    invalidateAiCache('briefing');

    res.json({ id, status });
  } catch (err) {
    console.error('Error updating medicine status:', err);
    res.status(500).json({ error: 'Unable to update status.' });
  }
});

app.delete('/api/medicines/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    db.run('DELETE FROM medicines WHERE id = ?', [id]);
    saveDb();
    invalidateAiCache('briefing');
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting medicine:', err);
    res.status(500).json({ error: 'Unable to delete medicine.' });
  }
});

// -------------------------------------------------------------
// APPOINTMENTS API
// -------------------------------------------------------------
const CreateAppointmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  dateTime: z.string().min(1, 'Date and time is required').max(100),
  location: z.string().min(1, 'Location is required').max(150),
  notes: z.string().max(500).optional(),
});

app.post('/api/appointments', async (req: Request, res: Response) => {
  try {
    const parsed = CreateAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const { title, dateTime, location, notes } = parsed.data;
    const db = await getDb();
    const id = `apt_${Date.now()}`;

    // Generate practical senior preparation checklist using Gemini
    const prepList = await generateTaskPreparation({ title, location, notes });

    db.run(
      `INSERT INTO appointments (id, userId, title, dateTime, location, notes, completed, preparationChecklist)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, 'user_demo', title, dateTime, location, notes || '', 0, JSON.stringify(prepList)]
    );
    saveDb();

    res.status(201).json({
      id,
      userId: 'user_demo',
      title,
      dateTime,
      location,
      notes: notes || '',
      completed: false,
      preparationChecklist: prepList,
    });
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ error: 'Unable to save appointment.' });
  }
});

app.patch('/api/appointments/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const cur = db.exec('SELECT completed FROM appointments WHERE id = ?', [id]);
    if (!cur.length || !cur[0].values.length) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    const currentCompleted = Boolean(cur[0].values[0][0]);
    const newCompleted = !currentCompleted;

    db.run('UPDATE appointments SET completed = ? WHERE id = ?', [newCompleted ? 1 : 0, id]);
    saveDb();
    invalidateAiCache('briefing');

    res.json({ id, completed: newCompleted });
  } catch (err) {
    console.error('Error toggling appointment:', err);
    res.status(500).json({ error: 'Unable to update appointment.' });
  }
});

app.delete('/api/appointments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    db.run('DELETE FROM appointments WHERE id = ?', [id]);
    saveDb();
    invalidateAiCache('briefing');
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ error: 'Unable to delete appointment.' });
  }
});

// -------------------------------------------------------------
// TASKS API
// -------------------------------------------------------------
const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(150),
  dueDate: z.string().min(1, 'Due date is required').max(100),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

app.post('/api/tasks', async (req: Request, res: Response) => {
  try {
    const parsed = CreateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const { title, dueDate, priority } = parsed.data;
    const db = await getDb();
    const id = `task_${Date.now()}`;

    db.run(
      `INSERT INTO tasks (id, userId, title, dueDate, priority, completed)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, 'user_demo', title, dueDate, priority, 0]
    );
    saveDb();
    invalidateAiCache('briefing');

    res.status(201).json({
      id,
      userId: 'user_demo',
      title,
      dueDate,
      priority,
      completed: false,
    });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Unable to save task.' });
  }
});

app.patch('/api/tasks/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const cur = db.exec('SELECT completed FROM tasks WHERE id = ?', [id]);
    if (!cur.length || !cur[0].values.length) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const currentCompleted = Boolean(cur[0].values[0][0]);
    const newCompleted = !currentCompleted;

    db.run('UPDATE tasks SET completed = ? WHERE id = ?', [newCompleted ? 1 : 0, id]);
    saveDb();
    invalidateAiCache('briefing');

    res.json({ id, completed: newCompleted });
  } catch (err) {
    console.error('Error toggling task:', err);
    res.status(500).json({ error: 'Unable to update task.' });
  }
});

app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    db.run('DELETE FROM tasks WHERE id = ?', [id]);
    saveDb();
    invalidateAiCache('briefing');
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Unable to delete task.' });
  }
});

// -------------------------------------------------------------
// PREFERENCES & CONTACTS
// -------------------------------------------------------------
app.put('/api/preferences', async (req: Request, res: Response) => {
  try {
    const { fontSize, highContrast, reducedMotion } = req.body;
    const db = await getDb();
    db.run(
      `INSERT OR REPLACE INTO user_preferences (id, userId, fontSize, highContrast, reducedMotion)
       VALUES (?, ?, ?, ?, ?)`,
      ['pref_1', 'user_demo', fontSize || 'large', highContrast || 'standard', reducedMotion || 'normal']
    );
    saveDb();
    res.json({ success: true, preferences: { fontSize, highContrast, reducedMotion } });
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).json({ error: 'Unable to save preferences.' });
  }
});

app.put('/api/contacts', async (req: Request, res: Response) => {
  try {
    const { name, relationship, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required.' });
    }
    const db = await getDb();
    db.run(
      `INSERT OR REPLACE INTO trusted_contacts (id, userId, name, relationship, phone)
       VALUES (?, ?, ?, ?, ?)`,
      ['tc_1', 'user_demo', name, relationship || 'Family', phone]
    );
    saveDb();
    res.json({ success: true, contact: { id: 'tc_1', userId: 'user_demo', name, relationship, phone } });
  } catch (err) {
    console.error('Error updating contact:', err);
    res.status(500).json({ error: 'Unable to save contact.' });
  }
});

// -------------------------------------------------------------
// GENAI ENDPOINTS
// -------------------------------------------------------------
app.post('/api/ai/briefing', aiRateLimiter, async (req: Request, res: Response) => {
  try {
    const language = (req.body.language || req.query.language || 'en') as any;
    const data = await getFullUserData('user_demo');
    const briefing = await generateDailyBriefing({
      userName: data.user.name,
      medicines: data.medicines,
      appointments: data.appointments,
      tasks: data.tasks,
      language,
    });
    res.json(briefing);
  } catch (err) {
    console.error('Error in daily briefing API:', err);
    res.json({
      greeting: 'Good morning, Anita.',
      summary: 'You have your scheduled medicines and appointments ready for today.',
      highlights: ['Check your medicine reminders', 'Review today’s appointments'],
      closingMessage: 'We are here to help you throughout your day.',
    });
  }
});

app.post('/api/ai/simplify', aiRateLimiter, async (req: Request, res: Response) => {
  try {
    const text = req.body.text || req.body.documentText || req.body.content;
    const language = (req.body.language || 'en') as any;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Please provide text or document content to simplify.' });
    }
    if (text.length > 20000) {
      return res.status(400).json({ error: 'Document is too long. Please provide up to 20,000 characters.' });
    }
    const result = await simplifyDocument(text, language);
    res.json(result);
  } catch (err) {
    console.error('Error in document simplify API:', err);
    res.status(500).json({ error: 'Unable to simplify this document right now. Please try again.' });
  }
});

app.post('/api/ai/simplify-more', aiRateLimiter, async (req: Request, res: Response) => {
  try {
    const text = req.body.text || req.body.explanation;
    const language = (req.body.language || 'en') as any;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Please provide explanation text to simplify further.' });
    }
    const result = await simplifyDocumentMore(text, language);
    res.json(result);
  } catch (err) {
    console.error('Error in simplify-more API:', err);
    res.status(500).json({ error: 'Unable to simplify further right now.' });
  }
});

app.post('/api/ai/safety-check', aiRateLimiter, async (req: Request, res: Response) => {
  try {
    const message = req.body.message || req.body.messageText || req.body.text;
    const language = (req.body.language || 'en') as any;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Please provide a message to check.' });
    }
    if (message.length > 5000) {
      return res.status(400).json({ error: 'Message is too long. Please provide up to 5,000 characters.' });
    }
    const result = await analyzeSuspiciousMessage(message, language);
    res.json(result);
  } catch (err) {
    console.error('Error in safety check API:', err);
    res.status(500).json({ error: 'Unable to analyze message right now. Please try again.' });
  }
});

app.post('/api/ai/ask', aiRateLimiter, async (req: Request, res: Response) => {
  try {
    const { question, language = 'en' } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Please ask a question.' });
    }
    if (question.length > 500) {
      return res.status(400).json({ error: 'Question is too long. Please keep under 500 characters.' });
    }
    const data = await getFullUserData('user_demo');
    const answer = await answerCompanionQuestion({
      question,
      userName: data.user.name,
      medicines: data.medicines,
      appointments: data.appointments,
      tasks: data.tasks,
      trustedContact: data.trustedContacts[0],
      language,
    });
    res.json({ answer });
  } catch (err) {
    console.error('Error in companion ask API:', err);
    res.json({ answer: 'I am here with you. You can check your medicines, appointments or talk to me anytime.' });
  }
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// -------------------------------------------------------------
async function startServer() {
  // Initialize Database
  await getDb();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aasra Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting Aasra server:', err);
  process.exit(1);
});
export default app;
