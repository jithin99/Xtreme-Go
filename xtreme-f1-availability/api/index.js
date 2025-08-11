import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc); dayjs.extend(timezone);

import { loadJson, saveJson, loadAvailability, saveAvailability, buildSlotsForDay } from './store.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

const TZ = process.env.BUSINESS_TZ || 'Asia/Kolkata';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-please-change';

function defaultsForProduct(productId) {
  const settings = loadJson('settings.json');
  const p = (settings.productDefaults && settings.productDefaults[productId]) || {};
  return {
    slotLen: p.slotLengthMinutes ?? settings.slotLengthMinutes ?? 15,
    capacity: p.capacityPerSlot ?? settings.capacityPerSlot ?? 6,
    businessHours: settings.businessHours || { open: '10:00', close: '22:00' }
  };
}

function slotKeysForDuration(startHHMM, hours, slotLen) {
  const keys = [];
  const [h,m] = startHHMM.split(':').map(Number);
  let start = h*60 + m;
  let end   = start + Math.ceil((hours||1) * 60);
  for (let t=start; t<end; t+=slotLen) {
    const hh = String(Math.floor(t/60)).padStart(2, '0');
    const mm = String(t % 60).padStart(2, '0');
    keys.push(`${hh}:${mm}`);
  }
  return keys;
}

function remainingForSlot(date, productId, slotHHMM) {
  const { slotLen, capacity } = defaultsForProduct(productId);
  const av = loadAvailability();
  const base = av?.[date]?.[productId]?.[slotHHMM]?.base ?? capacity;
  const bookings = loadJson('bookings.json') || [];
  const taken = bookings.filter(b => (
    b.date === date &&
    b.productId === productId &&
    slotKeysForDuration(b.time, b.hours || 1, slotLen).includes(slotHHMM)
  )).length;
  return Math.max(base - taken, 0);
}

function dailyAvailability(date, productId) {
  const { slotLen, businessHours } = defaultsForProduct(productId);
  const slots = buildSlotsForDay(TZ, businessHours, slotLen);
  return slots.map(time => ({ time, remaining: remainingForSlot(date, productId, time) }));
}

function setAuthCookie(res, payload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
}

function parseAuth(req) {
  try {
    const token = req.cookies.token;
    if(!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch(e){ return null; }
}

function requireUser(req,res,next){
  const auth = parseAuth(req);
  if(!auth || (auth.role!=='user' && auth.role!=='admin')) return res.status(401).json({error:'auth required'});
  req.auth = auth; next();
}
function requireAdmin(req,res,next){
  const auth = parseAuth(req);
  if(!auth || auth.role!=='admin') return res.status(401).json({error:'admin required'});
  req.auth = auth; next();
}

// Health
app.get('/', (req,res)=> res.json({ ok:true, service:'xtreme-api' }));

// Products
app.get('/api/products', (req,res)=>{
  res.json(loadJson('products.json'));
});

// Reviews
app.get('/api/reviews', (req,res)=> res.json(loadJson('reviews.json')));
app.post('/api/reviews', (req,res)=>{
  const { name, message } = req.body;
  if(!name || !message) return res.status(400).json({error:'name and message required'});
  const r = loadJson('reviews.json'); r.unshift({ id: uuidv4(), name, message, ts: Date.now() });
  saveJson('reviews.json', r); res.json({ ok:true });
});

// Auth (user email only)
app.post('/api/auth/login', (req,res)=>{
  const { email } = req.body;
  if(!email) return res.status(400).json({error:'email required'});
  setAuthCookie(res, { role:'user', email });
  // ensure user exists
  const users = loadJson('users.json');
  if(!users[email]) { users[email] = { email, createdAt: Date.now() }; saveJson('users.json', users); }
  res.json({ ok:true, user:{ email } });
});
app.post('/api/auth/logout', (req,res)=>{ res.clearCookie('token'); res.json({ ok:true }); });

// Admin login
app.post('/api/admin/login', async (req,res)=>{
  const { email, password } = req.body;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@xtreme.com';
  const PASS = process.env.ADMIN_PASSWORD || null;
  const HASH = process.env.ADMIN_PASSWORD_HASH || null;
  if(email !== ADMIN_EMAIL) return res.status(401).json({error:'invalid'});
  let ok=false;
  if(HASH) ok = await bcrypt.compare(password||'', HASH);
  else if(PASS) ok = (password === PASS);
  else ok = (password === 'admin'); // dev fallback
  if(!ok) return res.status(401).json({error:'invalid'});
  setAuthCookie(res, { role:'admin', email });
  res.json({ ok:true });
});
app.post('/api/admin/logout', (req,res)=>{ res.clearCookie('token'); res.json({ok:true}); });

// Account
app.get('/api/account', requireUser, (req,res)=>{
  const bookings = loadJson('bookings.json') || [];
  const out = bookings.filter(b=> b.email === req.auth.email);
  res.json({ email:req.auth.email, bookings: out });
});

// Availability
app.get('/api/availability', (req,res)=>{
  const { date, productId } = req.query;
  if(!date || !productId) return res.status(400).json({ error:'date and productId required' });
  const now = dayjs().tz(TZ);
  const reqDate = dayjs.tz(date, 'YYYY-MM-DD', TZ);
  let slots = dailyAvailability(date, productId);
  if(reqDate.isSame(now,'day')) {
    const hhmm = now.format('HH:mm');
    slots = slots.filter(s => s.time >= hhmm);
  }
  res.json({ date, productId, slots });
});

// Booking
app.post('/api/bookings', requireUser, (req,res)=>{
  const { productId, date, time, qty=1, hours=1 } = req.body;
  if(!productId || !date || !time) return res.status(400).json({error:'productId, date, time required'});
  // validate slots
  const { slotLen } = defaultsForProduct(productId);
  for(const k of slotKeysForDuration(time, hours||1, slotLen)) {
    if(remainingForSlot(date, productId, k) <= 0) return res.status(409).json({error:`Slot ${k} is full`});
  }
  const code = Math.random().toString(36).slice(2,8).toUpperCase();
  const bookings = loadJson('bookings.json') || [];
  // pricing
  const products = loadJson('products.json');
  const all = products.flatMap(p => p.variants.map(v => ({...v, cat:p.title})));
  const item = all.find(v => v.id===productId);
  const unit = item?.price || 0;
  const total = unit * qty * (item?.type==='game' ? (hours||1) : 1);
  const record = { id: uuidv4(), code, email:req.auth.email, productId, date, time, qty, hours, total, status:'booked', ts: Date.now() };
  bookings.push(record); saveJson('bookings.json', bookings);
  res.json({ ok:true, booking: record });
});

// Admin: walk-in booking
app.post('/api/admin/walkin', requireAdmin, (req,res)=>{
  const { productId, date, time, qty=1, hours=1 } = req.body;
  if(!productId || !date || !time) return res.status(400).json({error:'productId, date, time required'});
  const { slotLen } = defaultsForProduct(productId);
  for(const k of slotKeysForDuration(time, hours||1, slotLen)) {
    if(remainingForSlot(date, productId, k) <= 0) return res.status(409).json({error:`Slot ${k} is full`});
  }
  const code = Math.random().toString(36).slice(2,8).toUpperCase();
  const bookings = loadJson('bookings.json') || [];
  const products = loadJson('products.json');
  const all = products.flatMap(p => p.variants.map(v => ({...v, cat:p.title})));
  const item = all.find(v => v.id===productId);
  const unit = item?.price || 0;
  const total = unit * qty * (item?.type==='game' ? (hours||1) : 1);
  const record = { id: uuidv4(), code, email:'WALKIN', productId, date, time, qty, hours, total, status:'booked', ts: Date.now() };
  bookings.push(record); saveJson('bookings.json', bookings);
  res.json({ ok:true, booking: record });
});

// Admin: add custom charge
app.post('/api/admin/bookings/:code/charge', requireAdmin, (req,res)=>{
  const { code } = req.params;
  const { name, price } = req.body;
  if(!name || typeof price!=='number') return res.status(400).json({error:'name and price required'});
  const bookings = loadJson('bookings.json') || [];
  const b = bookings.find(x=>x.code===code);
  if(!b) return res.status(404).json({error:'not found'});
  b.charges = b.charges || []; b.charges.push({ name, price });
  b.total = (b.total||0) + price;
  saveJson('bookings.json', bookings);
  res.json({ ok:true, booking:b });
});

// Admin: check-in
app.post('/api/admin/checkin', requireAdmin, (req,res)=>{
  const { code } = req.body;
  const bookings = loadJson('bookings.json') || [];
  const b = bookings.find(x=>x.code===code);
  if(!b) return res.status(404).json({error:'not found'});
  b.status = 'checked-in'; saveJson('bookings.json', bookings);
  res.json({ ok:true, booking:b });
});

// Admin: availability upsert/reset
app.post('/api/admin/availability/upsert', requireAdmin, (req,res)=>{
  const { date, productId, slots } = req.body; // [{time, base}]
  if(!date || !productId || !Array.isArray(slots)) return res.status(400).json({ error:'date, productId, slots[] required' });
  const av = loadAvailability();
  av[date] ??= {}; av[date][productId] ??= {};
  for(const s of slots) av[date][productId][s.time] = { base: Number(s.base) };
  saveAvailability(av); res.json({ ok:true });
});
app.post('/api/admin/availability/reset', requireAdmin, (req,res)=>{
  const { date, productId } = req.body;
  const av = loadAvailability();
  if(av?.[date]?.[productId]) {
    delete av[date][productId];
    if(Object.keys(av[date]).length===0) delete av[date];
    saveAvailability(av);
  }
  res.json({ ok:true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`xtreme-api listening on http://localhost:${PORT}`));