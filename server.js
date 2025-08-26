
import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_FILE = path.resolve('./data.json');

app.use(cors());
app.use(express.json({limit:'2mb'}));

function ensureDB(){
  if (!fs.existsSync(DATA_FILE)){
    const seed = { promotions: [], clicks: [], comments: [], createdAt: new Date().toISOString() };
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
  }
}
function readDB(){ ensureDB(); return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); }
function writeDB(db){ fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2)); }
const isExpired = (p)=> dayjs().isAfter(dayjs(p.endsAt));
const withComputed = (p)=>{
  const status = isExpired(p) ? 'expired' : (p.paused ? 'paused' : 'active');
  const secondsLeft = Math.max(0, dayjs(p.endsAt).diff(dayjs(), 'second'));
  return { ...p, status, secondsLeft };
};

// PUBLIC endpoints (no auth) — suitable for MVP/demo only
app.get('/promotions', (req, res)=>{
  const { q = '', status = 'active', ends = '' } = req.query;
  const db = readDB();
  let items = db.promotions.map(withComputed);
  if (status !== 'all') items = items.filter(p => p.status === status);
  if (ends === 'today'){
    const end = dayjs().endOf('day');
    items = items.filter(p => p.status==='active' && dayjs(p.endsAt).isBefore(end));
  }
  const qi = String(q).toLowerCase();
  if (qi){
    items = items.filter(p =>
      (p.title||'').toLowerCase().includes(qi) ||
      (p.description||'').toLowerCase().includes(qi) ||
      (p.shopName||'').toLowerCase().includes(qi)
    );
  }
  // Paid first, then nearest expiry
  items.sort((a,b)=> (b.paid - a.paid) || (new Date(a.endsAt) - new Date(b.endsAt)));
  res.json({ items });
});

app.get('/promotions/:id', (req,res)=>{
  const db = readDB();
  const p = db.promotions.find(x=>x.id===req.params.id);
  if (!p) return res.status(404).json({error:'not found'});
  res.json(withComputed(p));
});

app.post('/promotions', (req,res)=>{
  const { title, description='', imageUrl='', shopName, shopPhone='', shopLink, endsAt, paid=false, paused=false } = req.body || {};
  if (!title || !shopName || !shopLink || !endsAt) return res.status(400).json({error:'title, shopName, shopLink, endsAt required'});
  const db = readDB();
  const item = { id: nanoid(), title, description, imageUrl, shopName, shopPhone, shopLink, endsAt, paid: !!paid, paused: !!paused, createdAt: new Date().toISOString() };
  db.promotions.push(item);
  writeDB(db);
  res.status(201).json(item);
});

app.put('/promotions/:id', (req,res)=>{
  const db = readDB();
  const idx = db.promotions.findIndex(x=>x.id===req.params.id);
  if (idx === -1) return res.status(404).json({error:'not found'});
  db.promotions[idx] = { ...db.promotions[idx], ...req.body, id: db.promotions[idx].id };
  writeDB(db);
  res.json(db.promotions[idx]);
});

app.delete('/promotions/:id', (req,res)=>{
  const db = readDB();
  const before = db.promotions.length;
  db.promotions = db.promotions.filter(x=>x.id!==req.params.id);
  writeDB(db);
  res.json({ deleted: before - db.promotions.length });
});

app.post('/promotions/:id/click', (req,res)=>{
  const db = readDB();
  db.clicks.push({ id: nanoid(), promotionId: req.params.id, at: new Date().toISOString() });
  writeDB(db);
  res.json({ ok:true });
});

app.post('/promotions/:id/comment', (req,res)=>{
  const { rating=5, text='' } = req.body || {};
  const db = readDB();
  if (!db.promotions.find(x=>x.id===req.params.id)) return res.status(404).json({error:'promotion not found'});
  db.comments.push({ id: nanoid(), promotionId: req.params.id, rating: Math.max(1, Math.min(5, parseInt(rating))), text, at: new Date().toISOString() });
  writeDB(db);
  res.status(201).json({ ok:true });
});

app.get('/', (_req,res)=> res.json({ ok:true, service:'EmPromo API', now: new Date().toISOString() }));

app.listen(PORT, ()=> console.log('EmPromo API running on http://localhost:'+PORT));
