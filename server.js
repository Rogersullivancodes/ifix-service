require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true });
const esc = s => String(s || '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Blocks messages that look like a 12+ word seed phrase, to protect visitors.
const SEED = /(?:\b[a-z]{3,8}\b[ ,]+){11}\b[a-z]{3,8}\b/;

app.post('/api/contact', limiter, async (req, res) => {
  const { name, email, type, message, website } = req.body || {};
  if (website) return res.json({ ok: true }); // honeypot: silently drop bots
  if (!name || !EMAIL.test(email || '') || !message || message.length > 3000 || name.length > 120)
    return res.status(400).json({ error: 'Please complete all fields.' });
  if (SEED.test(message))
    return res.status(400).json({ error: 'Your message looks like it may contain a seed phrase. Please remove it and never share it with anyone.' });
  try {
    await transport.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: process.env.TO_EMAIL || 'help@ifixservice.online',
      replyTo: email,
      subject: `New case review request: ${String(type || 'General').slice(0, 60)}`,
      html: `<p><b>Name:</b> ${esc(name)}<br><b>Email:</b> ${esc(email)}<br><b>Type:</b> ${esc(type)}</p><p>${esc(message).replace(/\n/g, '<br>')}</p>`
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Mail error:', err.message);
    res.status(500).json({ error: 'Could not send. Please email us directly.' });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('iFix Services running'));
