import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import mysql from 'mysql2/promise';

import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

// Outlook/Office365 Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'your-outlook-email@outlook.com',
    pass: process.env.EMAIL_PASS || 'myfispprjoxanocj'
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'chikitsa-super-secret-key';

// MySQL Configuration
let dbHost = process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost';
let dbPort = parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10);
let dbUser = process.env.MYSQL_USER || process.env.DB_USER || 'root';
let dbPassword = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || 'SURYA_1416';
let dbName = process.env.MYSQL_DATABASE || process.env.DB_NAME || 'defaultdb';

const dbUri = process.env.MYSQL_URI || process.env.DB_URI || process.env.DATABASE_URL;
if (dbUri) {
  try {
    const parsed = new URL(dbUri);
    dbHost = parsed.hostname;
    dbPort = parseInt(parsed.port || '3306', 10);
    dbUser = parsed.username;
    dbPassword = decodeURIComponent(parsed.password);
    dbName = parsed.pathname.replace(/^\//, '');
  } catch (e) {
    console.log('Error parsing database URI:', e.message);
  }
}

const isAiven = dbHost.includes('aivencloud.com');
const connectionConfig = {
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  ssl: isAiven || process.env.MYSQL_SSL === 'true' || process.env.MYSQL_SSL === 'REQUIRED' ? { rejectUnauthorized: false } : undefined,
};

const DB_NAME = dbName;

// Initialize and auto-create MySQL database if it doesn't exist
try {
  const initConnection = await mysql.createConnection({
    ...connectionConfig,
    database: DB_NAME
  });
  await initConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await initConnection.end();
} catch (err) {
  console.log('Database initialization notice (can be ignored on managed databases like Aiven):', err.message);
}

const pool = mysql.createPool({
  ...connectionConfig,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Seed Table creation
await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    practice_description TEXT,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_expiry DATETIME,
    created_at VARCHAR(255)
  );
`);

try {
  await pool.query(`ALTER TABLE users ADD COLUMN is_verified TINYINT DEFAULT 1`);
} catch (e) {}
try {
  await pool.query(`ALTER TABLE users ADD COLUMN verification_code VARCHAR(50)`);
} catch (e) {}

await pool.query(`
  CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    experience VARCHAR(255),
    rating DOUBLE,
    availability VARCHAR(255)
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255),
    specialist VARCHAR(255),
    status VARCHAR(255),
    urgency VARCHAR(50),
    symptoms TEXT,
    diagnosis TEXT,
    findings TEXT,
    vitals TEXT,
    timestamp VARCHAR(255),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255),
    message TEXT,
    \`read\` TINYINT DEFAULT 0,
    timestamp VARCHAR(255),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS vitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type VARCHAR(100),
    value DOUBLE,
    timestamp VARCHAR(255),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(255),
    frequency VARCHAR(255),
    time VARCHAR(255),
    active TINYINT DEFAULT 1,
    notifications_enabled TINYINT DEFAULT 0,
    timestamp VARCHAR(255),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS medication_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medication_id INT,
    user_id INT,
    status VARCHAR(50) DEFAULT 'taken',
    timestamp VARCHAR(255),
    FOREIGN KEY(medication_id) REFERENCES medications(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    doctor_id INT,
    date VARCHAR(100),
    time VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Scheduled',
    notes TEXT,
    timestamp VARCHAR(255),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS clinical_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    timestamp VARCHAR(255),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Pre-populate Doctors if empty
const [doctorCountRows] = await pool.query('SELECT COUNT(*) as count FROM doctors');
const doctorCount = doctorCountRows[0]?.count || 0;
if (doctorCount === 0) {
  await pool.execute('INSERT INTO doctors (name, specialty, experience, rating, availability) VALUES (?, ?, ?, ?, ?)', ['Dr. Sarah Chen', 'Cardiologist', '12 Years', 4.9, 'Mon, Wed, Fri']);
  await pool.execute('INSERT INTO doctors (name, specialty, experience, rating, availability) VALUES (?, ?, ?, ?, ?)', ['Dr. Marcus Thorne', 'Neurologist', '15 Years', 4.8, 'Tue, Thu']);
  await pool.execute('INSERT INTO doctors (name, specialty, experience, rating, availability) VALUES (?, ?, ?, ?, ?)', ['Dr. Elena Rodriguez', 'Endocrinologist', '8 Years', 4.7, 'Daily']);
  await pool.execute('INSERT INTO doctors (name, specialty, experience, rating, availability) VALUES (?, ?, ?, ?, ?)', ['Dr. James Wilson', 'General Physician', '20 Years', 4.9, 'Daily']);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Middleware to authenticate JWT
  const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Authentication token required' });

    jwt.verify(token, SECRET_KEY, async (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token' });
      
      try {
        const [users] = await pool.execute('SELECT id FROM users WHERE id = ?', [user.id]);
        if (users.length === 0) {
          console.error(`AUTH FAILURE: User ID ${user.id} from token not found in database.`);
          return res.status(401).json({ error: 'User no longer exists' });
        }
        req.user = user;
        next();
      } catch (dbErr) {
        return res.status(500).json({ error: 'Auth failed' });
      }
    });
  };

  // --- API ROUTES ---

  app.get('/api/config', (req, res) => {
    res.json({
      tomtomKey: process.env.VITE_TOMTOM_API_KEY || process.env.TOMTOM_API_KEY || ''
    });
  });

  // Auth: Verify Session
  app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user });
  });

  // Auth: Signup
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const [result] = await pool.execute(
        'INSERT INTO users (email, password, name, is_verified, verification_code, created_at) VALUES (?, ?, ?, 0, ?, ?)',
        [email, hashedPassword, name, otpCode, new Date().toISOString()]
      );
      // Send the email via Outlook in the background
      transporter.sendMail({
        from: process.env.EMAIL_USER || 'your-outlook-email@outlook.com',
        to: email,
        subject: 'Your Chikitsa Verification Code',
        text: `Your account verification code is: ${otpCode}. Please use this code to activate your Chikitsa account.`,
        html: `<div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #0d9488; text-transform: uppercase; letter-spacing: 2px;">Chikitsa Verification</h2>
          <p style="font-size: 16px; color: #4b5563;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #4b5563;">Thank you for registering on Chikitsa. Here is your 6-digit verification code to activate your account:</p>
          <div style="background: #f0fdfa; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; color: #0d9488; letter-spacing: 5px; border-radius: 8px; border: 1px dashed #0d9488; margin: 20px 0;">
            ${otpCode}
          </div>
          <p style="font-size: 14px; color: #6b7280;">This code will activate your account. If you did not sign up for an account, you can safely ignore this email.</p>
        </div>`
      }).catch(mailErr => {
        console.error("Outlook sendMail failed in background during signup:", mailErr);
      });
      
      res.status(201).json({ id: result.insertId, message: 'User created' });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.message.includes('UNIQUE constraint failed') || error.message.includes('Duplicate entry')) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
  });

  // Auth: Verify Code
  app.post('/api/auth/verify-code', async (req, res) => {
    try {
      const { email, code } = req.body;
      const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      const user = users[0];

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      if (user.verification_code === code) {
        await pool.execute('UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?', [user.id]);
        
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
        return res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, subscription_tier: user.subscription_tier, subscription_expiry: user.subscription_expiry } });
      } else {
        return res.status(400).json({ error: 'Invalid verification code' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
  });

  // Resend Verification Code
  app.post('/api/auth/resend-code', async (req, res) => {
    try {
      const { email } = req.body;
      const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      const user = users[0];

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await pool.execute('UPDATE users SET verification_code = ? WHERE id = ?', [otpCode, user.id]);

      // Send the email via Outlook in the background
      transporter.sendMail({
        from: process.env.EMAIL_USER || 'your-outlook-email@outlook.com',
        to: user.email,
        subject: 'Your Chikitsa Verification Code',
        text: `Your account verification code is: ${otpCode}. Please use this code to activate your Chikitsa account.`,
        html: `<div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #0d9488; text-transform: uppercase; letter-spacing: 2px;">Chikitsa Verification</h2>
          <p style="font-size: 16px; color: #4b5563;">Hello <strong>${user.name}</strong>,</p>
          <p style="font-size: 16px; color: #4b5563;">Thank you for registering on Chikitsa. Here is your 6-digit verification code to activate your account:</p>
          <div style="background: #f0fdfa; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; color: #0d9488; letter-spacing: 5px; border-radius: 8px; border: 1px dashed #0d9488; margin: 20px 0;">
            ${otpCode}
          </div>
          <p style="font-size: 14px; color: #6b7280;">This code will activate your account. If you did not sign up for an account, you can safely ignore this email.</p>
        </div>`
      }).catch(mailErr => {
        console.error("Outlook sendMail failed in background during code resend:", mailErr);
      });

      res.json({ message: 'Verification code resent' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      const user = users[0];
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (user.is_verified === 0) {
        return res.status(403).json({ error: 'unverified', message: 'Account is not verified yet. Check your email for code.' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, subscription_tier: user.subscription_tier, subscription_expiry: user.subscription_expiry } });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // User Profile Update
  app.patch('/api/user', authenticateToken, async (req, res) => {
    try {
      const { name, bio, practice_description } = req.body;
      await pool.execute('UPDATE users SET name = ?, bio = ?, practice_description = ? WHERE id = ?', [name, bio, practice_description, req.user.id]);
      
      const [users] = await pool.execute('SELECT id, email, name, bio, practice_description, subscription_tier, subscription_expiry FROM users WHERE id = ?', [req.user.id]);
      res.json(users[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  app.post('/api/subscription/upgrade', authenticateToken, async (req, res) => {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      const expiryStr = expiryDate.toISOString().slice(0, 19).replace('T', ' ');
      
      await pool.execute('UPDATE users SET subscription_tier = ?, subscription_expiry = ? WHERE id = ?', ['pro', expiryStr, req.user.id]);
        
      const [users] = await pool.execute('SELECT id, name, email, subscription_tier, subscription_expiry FROM users WHERE id = ?', [req.user.id]);
      res.json({ success: true, user: users[0] });
    } catch (err) {
      res.status(500).json({ error: 'Upgrade failed' });
    }
  });

  // Health Check
  app.get('/api/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ 
        status: 'healthy', 
        database: 'connected', 
        uptime: process.uptime(),
        timestamp: Date.now()
      });
    } catch (err) {
      res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
    }
  });

  // Reports
  app.get('/api/reports', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT *, timestamp as date FROM reports WHERE user_id = ? ORDER BY timestamp DESC', [req.user.id]);
      // Parse JSON fields
      const formatted = rows.map(r => ({
        ...r,
        vitals: JSON.parse(r.vitals || '{}')
      }));
      res.json(formatted);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve reports' });
    }
  });

  app.post('/api/reports', authenticateToken, async (req, res) => {
    try {
      const { title, specialist, status, urgency, symptoms, diagnosis, findings, vitals } = req.body;
      const userId = parseInt(req.user.id);
      
      if (!userId || isNaN(userId)) {
        console.error('Report Save Error: Invalid User ID', req.user);
        return res.status(401).json({ error: 'Session expired or invalid user ID' });
      }

      const [result] = await pool.execute('INSERT INTO reports (user_id, title, specialist, status, urgency, symptoms, diagnosis, findings, vitals, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        userId, 
        title || 'General Assessment', 
        specialist || 'General Physician', 
        status || 'Ready', 
        urgency || 'Normal', 
        symptoms || 'Clinical Synthesis', 
        diagnosis || title || 'Summary', 
        findings || 'Analysis complete.', 
        JSON.stringify(vitals || { heart: 'Stable', bp: 'Normal' }),
        new Date().toISOString()
      ]);
      
      console.log(`Report saved for user ${userId}, ID: ${result.insertId}`);
      res.status(201).json({ id: result.insertId, message: 'Report archived successfully' });
    } catch (error) {
      console.error('Report save error:', error);
      res.status(500).json({ error: 'Persistence layer failure: ' + error.message });
    }
  });

  app.delete('/api/reports/:id', authenticateToken, async (req, res) => {
    try {
      await pool.execute('DELETE FROM reports WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete report' });
    }
  });

  // Vitals
  app.get('/api/vitals', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM vitals WHERE user_id = ? ORDER BY timestamp ASC', [req.user.id]);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve vitals' });
    }
  });

  app.post('/api/vitals', authenticateToken, async (req, res) => {
    try {
      const { type, value } = req.body;
      const [result] = await pool.execute('INSERT INTO vitals (user_id, type, value, timestamp) VALUES (?, ?, ?, ?)', [req.user.id, type, value, new Date().toISOString()]);
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save vital' });
    }
  });

  // Medications
  app.get('/api/medications', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM medications WHERE user_id = ? AND active = 1 ORDER BY timestamp DESC', [req.user.id]);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve medications' });
    }
  });

  app.post('/api/medications', authenticateToken, async (req, res) => {
    try {
      const { name, dosage, frequency, time } = req.body;
      const [result] = await pool.execute('INSERT INTO medications (user_id, name, dosage, frequency, time, timestamp) VALUES (?, ?, ?, ?, ?, ?)', [req.user.id, name, dosage, frequency, time, new Date().toISOString()]);
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add medication' });
    }
  });

  app.patch('/api/medications/:id', authenticateToken, async (req, res) => {
    try {
      const { active, notifications_enabled } = req.body;
      if (active !== undefined) {
        await pool.execute('UPDATE medications SET active = ? WHERE id = ? AND user_id = ?', [active ? 1 : 0, req.params.id, req.user.id]);
      }
      if (notifications_enabled !== undefined) {
        await pool.execute('UPDATE medications SET notifications_enabled = ? WHERE id = ? AND user_id = ?', [notifications_enabled ? 1 : 0, req.params.id, req.user.id]);
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update medication' });
    }
  });

  app.post('/api/medications/:id/log', authenticateToken, async (req, res) => {
    try {
      const { status } = req.body;
      await pool.execute('INSERT INTO medication_logs (medication_id, user_id, status, timestamp) VALUES (?, ?, ?, ?)', [req.params.id, req.user.id, status || 'taken', new Date().toISOString()]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to log medication' });
    }
  });

  app.get('/api/medications/adherence', authenticateToken, async (req, res) => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString();
      const [logs] = await pool.execute(`
        SELECT m.name, COUNT(l.id) as count
        FROM medication_logs l
        JOIN medications m ON l.medication_id = m.id
        WHERE l.user_id = ? AND l.timestamp > ?
        GROUP BY m.id
      `, [req.user.id, sevenDaysAgoStr]);
      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: 'Failed to compute adherence' });
    }
  });

  // Doctors & Appointments
  app.get('/api/doctors', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM doctors');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get doctors' });
    }
  });

  app.get('/api/appointments', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT a.*, d.name as doctor_name, d.specialty as doctor_specialty 
        FROM appointments a 
        JOIN doctors d ON a.doctor_id = d.id 
        WHERE a.user_id = ? 
        ORDER BY a.date DESC, a.time DESC
      `, [req.user.id]);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get appointments' });
    }
  });

  app.post('/api/appointments', authenticateToken, async (req, res) => {
    try {
      const { doctor_id, date, time, notes } = req.body;
      const [result] = await pool.execute('INSERT INTO appointments (user_id, doctor_id, date, time, notes, timestamp) VALUES (?, ?, ?, ?, ?, ?)', [req.user.id, doctor_id, date, time, notes, new Date().toISOString()]);
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create appointment' });
    }
  });

  // Clinical Notes
  app.get('/api/notes', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM clinical_notes WHERE user_id = ? ORDER BY timestamp DESC', [req.user.id]);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get clinical notes' });
    }
  });

  app.post('/api/notes', authenticateToken, async (req, res) => {
    try {
      const { title, content, category } = req.body;
      const [result] = await pool.execute('INSERT INTO clinical_notes (user_id, title, content, category, timestamp) VALUES (?, ?, ?, ?, ?)', [req.user.id, title, content, category, new Date().toISOString()]);
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add clinical note' });
    }
  });

  app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
    try {
      await pool.execute('DELETE FROM clinical_notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete note' });
    }
  });

  // Notifications
  app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT *, timestamp as time FROM notifications WHERE user_id = ? ORDER BY timestamp DESC', [req.user.id]);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  });

  app.post('/api/notifications', authenticateToken, async (req, res) => {
    try {
      const { title, message } = req.body;
      const [result] = await pool.execute('INSERT INTO notifications (user_id, title, message, timestamp) VALUES (?, ?, ?, ?)', [req.user.id, title, message, new Date().toISOString()]);
      res.status(201).json({ id: result.insertId, title, message, read: 0 });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add notification' });
    }
  });

  app.delete('/api/notifications', authenticateToken, async (req, res) => {
    try {
      await pool.execute('DELETE FROM notifications WHERE user_id = ?', [req.user.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete notifications' });
    }
  });

  app.delete('/api/notifications/medication/:name', authenticateToken, async (req, res) => {
    try {
      const { name } = req.params;
      await pool.execute('DELETE FROM notifications WHERE user_id = ? AND message LIKE ?', [req.user.id, `%${name}%`]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete medication notification' });
    }
  });

  // Export Data (JSON)
  app.get('/api/db/export', authenticateToken, async (req, res) => {
    try {
      const [users] = await pool.execute('SELECT email, name, bio, practice_description FROM users WHERE id = ?', [req.user.id]);
      const [vitals] = await pool.execute('SELECT * FROM vitals WHERE user_id = ?', [req.user.id]);
      const [reports] = await pool.execute('SELECT * FROM reports WHERE user_id = ?', [req.user.id]);
      const [medications] = await pool.execute('SELECT * FROM medications WHERE user_id = ?', [req.user.id]);
      const [appointments] = await pool.execute('SELECT * FROM appointments WHERE user_id = ?', [req.user.id]);

      const data = {
        user: users[0] || null,
        vitals,
        reports,
        medications,
        appointments
      };
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Export failed' });
    }
  });

  // Download Physical .db File
  app.get('/api/admin/db-download', (req, res) => {
    const dbPath = path.join(process.cwd(), 'chikitsa.db');
    if (fs.existsSync(dbPath)) {
      res.download(dbPath, 'chikitsa_backup.db');
    } else {
      res.status(404).send('No SQLite backup file found.');
    }
  });

  // Download package.json
  app.get('/api/admin/manifest-download', (req, res) => {
    const pkgPath = path.join(process.cwd(), 'package.json');
    res.download(pkgPath, 'package.json');
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chikitsa Server running on http://localhost:${PORT}`);
  });
}

startServer();
