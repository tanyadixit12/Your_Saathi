import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import {
  User,
  Medicine,
  Appointment,
  Task,
  TrustedContact,
  UserPreference,
  SafetyAnalysisResult
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'saathi.sqlite');

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
    } catch {
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  initTables(db);
  seedDemoData(db);
  saveDb();

  return db;
}

export function saveDb(): void {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Failed to save SQLite database to disk:', err);
  }
}

function initTables(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      time TEXT NOT NULL,
      frequency TEXT NOT NULL,
      instructions TEXT,
      status TEXT NOT NULL,
      aiExplanation TEXT
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      dateTime TEXT NOT NULL,
      location TEXT NOT NULL,
      notes TEXT,
      completed INTEGER NOT NULL,
      preparationChecklist TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      priority TEXT NOT NULL,
      completed INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trusted_contacts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      phone TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      fontSize TEXT NOT NULL,
      highContrast TEXT NOT NULL,
      reducedMotion TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS safety_checks (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      inputHash TEXT NOT NULL,
      result TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
}

export function seedDemoData(database: Database) {
  const checkUser = database.exec("SELECT id FROM users WHERE id = 'user_demo'");
  if (checkUser.length > 0 && checkUser[0].values.length > 0) {
    return; // Already seeded
  }

  // Clear demo data if partial
  database.run("DELETE FROM users WHERE id = 'user_demo'");
  database.run("DELETE FROM medicines WHERE userId = 'user_demo'");
  database.run("DELETE FROM appointments WHERE userId = 'user_demo'");
  database.run("DELETE FROM tasks WHERE userId = 'user_demo'");
  database.run("DELETE FROM trusted_contacts WHERE userId = 'user_demo'");
  database.run("DELETE FROM user_preferences WHERE userId = 'user_demo'");

  // User: Anita Sharma
  database.run(
    "INSERT INTO users (id, name, createdAt) VALUES (?, ?, ?)",
    ['user_demo', 'Anita Sharma', new Date().toISOString()]
  );

  // Medicines
  database.run(
    `INSERT INTO medicines (id, userId, name, dosage, time, frequency, instructions, status, aiExplanation)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'med_1',
      'user_demo',
      'Metformin',
      '500 mg',
      '09:00 AM',
      'Once daily in the morning',
      'Take with or right after breakfast with a glass of water.',
      'pending',
      'Take Metformin 500 mg after breakfast. It helps keep your morning sugar steady.'
    ]
  );

  database.run(
    `INSERT INTO medicines (id, userId, name, dosage, time, frequency, instructions, status, aiExplanation)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'med_2',
      'user_demo',
      'Amlodipine',
      '5 mg',
      '08:00 PM',
      'Once daily at night',
      'Take after dinner before sleeping.',
      'pending',
      'Take Amlodipine 5 mg after dinner. It helps keep your blood pressure calm overnight.'
    ]
  );

  // Appointments
  const prepList = JSON.stringify([
    'Carry your previous blood test reports',
    'Carry your current medicine list',
    'Reach 15 minutes early at reception counter 2'
  ]);

  database.run(
    `INSERT INTO appointments (id, userId, title, dateTime, location, notes, completed, preparationChecklist)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'apt_1',
      'user_demo',
      'Doctor appointment (Dr. Rao)',
      '4:00 PM Today',
      'City Clinic, Ground Floor Room 4',
      'Routine blood pressure & sugar checkup.',
      0,
      prepList
    ]
  );

  // Tasks
  database.run(
    `INSERT INTO tasks (id, userId, title, dueDate, priority, completed)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      'task_1',
      'user_demo',
      'Pay electricity bill',
      'Friday (2 days left)',
      'high',
      0
    ]
  );

  database.run(
    `INSERT INTO tasks (id, userId, title, dueDate, priority, completed)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      'task_2',
      'user_demo',
      'Call neighborhood chemist for refills',
      'Saturday morning',
      'medium',
      0
    ]
  );

  // Trusted Contact
  database.run(
    `INSERT INTO trusted_contacts (id, userId, name, relationship, phone)
     VALUES (?, ?, ?, ?, ?)`,
    [
      'tc_1',
      'user_demo',
      'Rahul Sharma',
      'Son',
      '+1-555-0199'
    ]
  );

  // Preferences
  database.run(
    `INSERT INTO user_preferences (id, userId, fontSize, highContrast, reducedMotion)
     VALUES (?, ?, ?, ?, ?)`,
    [
      'pref_1',
      'user_demo',
      'large',
      'standard',
      'normal'
    ]
  );
}

// Helper query wrappers
export async function getFullUserData(userId: string = 'user_demo') {
  const database = await getDb();

  const userRes = database.exec("SELECT * FROM users WHERE id = ?", [userId]);
  const user: User = userRes.length && userRes[0].values.length
    ? {
        id: String(userRes[0].values[0][0]),
        name: String(userRes[0].values[0][1]),
        createdAt: String(userRes[0].values[0][2]),
      }
    : { id: userId, name: 'Anita Sharma', createdAt: new Date().toISOString() };

  const medRes = database.exec("SELECT * FROM medicines WHERE userId = ?", [userId]);
  const medicines: Medicine[] = medRes.length
    ? medRes[0].values.map((row) => ({
        id: String(row[0]),
        userId: String(row[1]),
        name: String(row[2]),
        dosage: String(row[3]),
        time: String(row[4]),
        frequency: String(row[5]),
        instructions: row[6] ? String(row[6]) : undefined,
        status: row[7] as any,
        aiExplanation: row[8] ? String(row[8]) : undefined,
      }))
    : [];

  const aptRes = database.exec("SELECT * FROM appointments WHERE userId = ?", [userId]);
  const appointments: Appointment[] = aptRes.length
    ? aptRes[0].values.map((row) => ({
        id: String(row[0]),
        userId: String(row[1]),
        title: String(row[2]),
        dateTime: String(row[3]),
        location: String(row[4]),
        notes: row[5] ? String(row[5]) : undefined,
        completed: Boolean(row[6]),
        preparationChecklist: row[7] ? JSON.parse(String(row[7])) : undefined,
      }))
    : [];

  const taskRes = database.exec("SELECT * FROM tasks WHERE userId = ?", [userId]);
  const tasks: Task[] = taskRes.length
    ? taskRes[0].values.map((row) => ({
        id: String(row[0]),
        userId: String(row[1]),
        title: String(row[2]),
        dueDate: String(row[3]),
        priority: row[4] as any,
        completed: Boolean(row[5]),
      }))
    : [];

  const tcRes = database.exec("SELECT * FROM trusted_contacts WHERE userId = ?", [userId]);
  const trustedContacts: TrustedContact[] = tcRes.length
    ? tcRes[0].values.map((row) => ({
        id: String(row[0]),
        userId: String(row[1]),
        name: String(row[2]),
        relationship: String(row[3]),
        phone: String(row[4]),
      }))
    : [];

  const prefRes = database.exec("SELECT * FROM user_preferences WHERE userId = ?", [userId]);
  const preferences: UserPreference = prefRes.length && prefRes[0].values.length
    ? {
        id: String(prefRes[0].values[0][0]),
        userId: String(prefRes[0].values[0][1]),
        fontSize: prefRes[0].values[0][2] as any,
        highContrast: prefRes[0].values[0][3] as any,
        reducedMotion: prefRes[0].values[0][4] as any,
      }
    : {
        id: 'pref_1',
        userId,
        fontSize: 'large',
        highContrast: 'standard',
        reducedMotion: 'normal',
      };

  return {
    user,
    medicines,
    appointments,
    tasks,
    trustedContacts,
    preferences
  };
}

export async function resetDemoData() {
  const database = await getDb();
  database.run("DELETE FROM users WHERE id = 'user_demo'");
  seedDemoData(database);
  saveDb();
  return getFullUserData('user_demo');
}
