import { Router } from 'express';
import { isDbConnected, dbStatus, testDbConnection } from '../services/db.js';

const router = Router();

router.get('/', async (req, res) => {
  return res.status(200).json({
    status: 'ONLINE',
    system: 'FINSETU Banking & Cybersecurity Platform',
    version: '2026.1.0',
    timestamp: new Date(),
    database: dbStatus,
    instructions: !isDbConnected ? {
      message: 'To connect your live PostgreSQL / Supabase database:',
      step1: 'Create a Supabase project at https://supabase.com',
      step2: 'Go to Project Settings -> Database -> Connection string (URI)',
      step3: 'Update DATABASE_URL and DIRECT_URL in server/.env',
      step4: 'Run database schema sync: npm run prisma:push (or npm run prisma:migrate)',
      step5: 'Run database seed: npm run prisma:seed'
    } : null
  });
});

router.post('/recheck-db', async (req, res) => {
  const connected = await testDbConnection();
  return res.status(200).json({
    success: true,
    connected,
    status: dbStatus
  });
});

export default router;
