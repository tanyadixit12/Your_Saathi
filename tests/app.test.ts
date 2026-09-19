import { describe, it, expect, beforeAll } from 'vitest';
import { getDb, saveDb, getFullUserData, resetDemoData } from '../server/db';
import {
  analyzeSuspiciousMessage,
  simplifyDocument,
  generateDailyBriefing,
  answerCompanionQuestion,
} from '../server/ai';

describe('Saathi Database and Seeding Logic', () => {
  beforeAll(async () => {
    await getDb();
  });

  it('should initialize and contain the demo user Anita Sharma', async () => {
    const data = await getFullUserData('user_demo');
    expect(data.user).toBeDefined();
    expect(data.user.name).toBe('Anita Sharma');
  });

  it('should contain initial medicines for Anita', async () => {
    const data = await getFullUserData('user_demo');
    expect(data.medicines.length).toBeGreaterThanOrEqual(2);
    const medNames = data.medicines.map((m) => m.name);
    expect(medNames).toContain('Metformin');
    expect(medNames).toContain('Amlodipine');
  });

  it('should allow marking a medicine as taken or skipped', async () => {
    const data = await getFullUserData('user_demo');
    const firstMed = data.medicines[0];
    const db = await getDb();
    db.run("UPDATE medicines SET status = ? WHERE id = ?", ['taken', firstMed.id]);
    saveDb();

    const updatedData = await getFullUserData('user_demo');
    const updatedMed = updatedData.medicines.find((m) => m.id === firstMed.id);
    expect(updatedMed?.status).toBe('taken');

    // Reset back to pending
    db.run("UPDATE medicines SET status = ? WHERE id = ?", ['pending', firstMed.id]);
    saveDb();
  });

  it('should allow adding and deleting a medicine', async () => {
    const db = await getDb();
    const testId = `test_med_${Date.now()}`;
    db.run(
      `INSERT INTO medicines (id, userId, name, dosage, time, frequency, instructions, status, aiExplanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [testId, 'user_demo', 'Vitamin D3', '1000 IU', '10:00 AM', 'Weekly', 'With milk', 'pending', 'Take with milk']
    );
    saveDb();

    const dataAfterAdd = await getFullUserData('user_demo');
    expect(dataAfterAdd.medicines.find((m) => m.id === testId)).toBeDefined();

    db.run("DELETE FROM medicines WHERE id = ?", [testId]);
    saveDb();

    const dataAfterDelete = await getFullUserData('user_demo');
    expect(dataAfterDelete.medicines.find((m) => m.id === testId)).toBeUndefined();
  });

  it('should have initial appointment with Dr. Rao and allow toggling', async () => {
    const data = await getFullUserData('user_demo');
    expect(data.appointments.length).toBeGreaterThanOrEqual(1);
    const apt = data.appointments[0];
    expect(apt.title).toContain('Dr. Rao');
    expect(apt.preparationChecklist).toBeDefined();
    expect(apt.preparationChecklist?.length).toBeGreaterThanOrEqual(2);
  });

  it('should have initial tasks and allow completion toggle', async () => {
    const data = await getFullUserData('user_demo');
    expect(data.tasks.length).toBeGreaterThanOrEqual(1);
    const task = data.tasks[0];
    const db = await getDb();
    const newStatus = task.completed ? 0 : 1;
    db.run("UPDATE tasks SET completed = ? WHERE id = ?", [newStatus, task.id]);
    saveDb();

    const updatedData = await getFullUserData('user_demo');
    const updatedTask = updatedData.tasks.find((t) => t.id === task.id);
    expect(updatedTask?.completed).toBe(Boolean(newStatus));

    // Restore original status
    db.run("UPDATE tasks SET completed = ? WHERE id = ?", [task.completed ? 1 : 0, task.id]);
    saveDb();
  });

  it('should have trusted family contact Rahul Sharma', async () => {
    const data = await getFullUserData('user_demo');
    expect(data.trustedContacts.length).toBeGreaterThanOrEqual(1);
    const contact = data.trustedContacts[0];
    expect(contact.name).toBe('Rahul Sharma');
    expect(contact.relationship).toBe('Son');
  });

  it('should reset demo data cleanly', async () => {
    await resetDemoData();
    const data = await getFullUserData('user_demo');
    expect(data.user.name).toBe('Anita Sharma');
    expect(data.medicines.length).toBe(2);
    expect(data.appointments.length).toBe(1);
  });
});

describe('Saathi AI Safety & Heuristic Fallbacks', () => {
  it('should detect high risk scam for OTP demands and account threat', async () => {
    const testScam = 'URGENT: Your State Bank account is blocked! Send your 6-digit OTP code immediately to verify.';
    const result = await analyzeSuspiciousMessage(testScam);
    expect(result.riskLevel).toBe('danger');
    expect(result.warningSigns.length).toBeGreaterThan(0);
    expect(result.whatToDoNow.length).toBeGreaterThan(0);
  });

  it('should identify genuine doctor appointment notices', async () => {
    const safeNotice = "Dr. Rao's Clinic: Reminder of your routine checkup today at 4:00 PM. Please arrive 15 minutes early.";
    const result = await analyzeSuspiciousMessage(safeNotice);
    expect(result.riskLevel).toBe('safe');
  });

  it('should produce structured 6-section document simplification', async () => {
    const sampleBill = `METRO ELECTRIC CO - OVERDUE NOTICE
Account: 9482-1102
Your bill of $128.50 is past due. Pay by October 22, 2026 to avoid disconnection.`;

    const result = await simplifyDocument(sampleBill);
    expect(result.whatIsThis).toBeDefined();
    expect(result.whatNeedToDo).toBeDefined();
    expect(result.whenNeedToDoIt).toBeDefined();
    expect(result.howMuchCost).toBeDefined();
    expect(result.importantThingsToNotice.length).toBeGreaterThan(0);
    expect(result.questionsToAsk.length).toBeGreaterThan(0);
  });

  it('should generate personalized daily briefing', async () => {
    const data = await getFullUserData('user_demo');
    const briefing = await generateDailyBriefing({
      userName: 'Anita',
      medicines: data.medicines,
      appointments: data.appointments,
      tasks: data.tasks,
    });
    expect(briefing.greeting).toContain('Anita');
    expect(briefing.summary).toBeDefined();
    expect(briefing.highlights.length).toBeGreaterThan(0);
    expect(briefing.closingMessage).toBeDefined();
  });

  it('should answer voice assistant queries', async () => {
    const data = await getFullUserData('user_demo');
    const answer = await answerCompanionQuestion({
      question: 'What medicines do I have today?',
      userName: 'Anita',
      medicines: data.medicines,
      appointments: data.appointments,
      tasks: data.tasks,
      trustedContact: data.trustedContacts[0],
    });
    expect(answer).toBeDefined();
    expect(typeof answer).toBe('string');
    expect(answer.length).toBeGreaterThan(10);
  });

  it('should flag sensitive user credentials in message checker', async () => {
    const messageWithCard = 'Please verify your credit card number 4111 2222 3333 4444 and enter OTP 849201 immediately.';
    const result = await analyzeSuspiciousMessage(messageWithCard);
    expect(result.sensitiveDataWarning).toBe(true);
    expect(result.riskLevel).toBe('danger');
  });

  it('should generate preparation checklist for doctor appointments', async () => {
    const { generateTaskPreparation } = await import('../server/ai');
    const checklist = await generateTaskPreparation({
      title: 'Dr. Rao Cardiology Follow-up',
      location: 'City Clinic Room 302',
      notes: 'Check blood pressure and sugar levels',
    });
    expect(checklist).toBeDefined();
    expect(checklist.length).toBeGreaterThanOrEqual(3);
    const hasClinicNote = checklist.some((item) => /report|test|medicine|clinic|card/i.test(item));
    expect(hasClinicNote).toBe(true);
  });

  it('should route companion voice queries for doctor visits and contacts', async () => {
    const data = await getFullUserData('user_demo');
    const doctorAnswer = await answerCompanionQuestion({
      question: 'When is my doctor appointment?',
      userName: 'Anita',
      medicines: data.medicines,
      appointments: data.appointments,
      tasks: data.tasks,
      trustedContact: data.trustedContacts[0],
    });
    expect(doctorAnswer).toContain('Dr. Rao');

    const contactAnswer = await answerCompanionQuestion({
      question: 'Call my son',
      userName: 'Anita',
      medicines: data.medicines,
      appointments: data.appointments,
      tasks: data.tasks,
      trustedContact: data.trustedContacts[0],
    });
    expect(contactAnswer).toContain('Rahul');
  });
});
