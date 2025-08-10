
import express from 'express'
import cors from 'cors'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
dayjs.extend(utc); dayjs.extend(timezone)

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { readJSON, writeJSON } from './store.js'

const TZ = process.env.BUSINESS_TZ || 'Asia/Kolkata'
const now = () => dayjs().tz(TZ)

const app = express()
app.use(cors())
app.use(express.json())

function getSettings(){ return readJSON('settings.json') }
function getProducts(){ return readJSON('products.json') }
function getBookings(){ return readJSON('bookings.json') }
function getUsers(){ return readJSON('users.json') }
function getReviews(){ return readJSON('reviews.json') }

function saveBookings(list){ writeJSON('bookings.json', list) }
function saveUsers(list){ writeJSON('users.json', list) }
function saveReviews(list){ writeJSON('reviews.json', list) }

function getJwtSecret() {
  return process.env.JWT_SECRET || getSettings().admin?.jwtSecret || 'devsecret'
}
function signToken(payload){ return jwt.sign(payload, getJwtSecret(), { expiresIn:'7d' }) }

app.get('/', (req,res)=> res.json({ ok:true, service:'xtreme-api', tz: TZ }))

// ------- Products ------- //
app.get('/api/products', (req,res)=> res.json(getProducts()))

// ------- Reviews ------- //
app.get('/api/reviews', (req,res)=>{
  const list = getReviews().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)).slice(0,50)
  res.json(list)
})
app.post('/api/reviews', (req,res)=>{
  const { name, text } = req.body || {}
  if(!name || !text) return res.status(400).json({ error:'Name and review are required' })
  const cleanName = String(name).slice(0,60)
  const cleanText = String(text).slice(0,600)
  const rev = { id:nanoid(), name: cleanName, text: cleanText, createdAt: new Date().toISOString() }
  const all = getReviews(); all.push(rev); saveReviews(all)
  res.json({ ok:true, review: rev })
})

// ------- Availability ------- //
app.get('/api/availability', (req,res)=>{
  const { productId, variantId, date, qty } = req.query
  const qtyNum = parseInt(qty||'1')

  const prod = getProducts().find(p=>p.id===productId)
  if(!prod) return res.status(400).json({error:'Invalid product'})
  const variant = prod.variants.find(v=>v.id===variantId)
  if(!variant) return res.status(400).json({error:'Invalid variant'})

  const d = dayjs.tz(date, TZ)
  const settings = getSettings()
  const isWeekend = [0,6].includes(d.day())
  const oh = isWeekend ? settings.openHours.weekend : settings.openHours.weekday
  const start = dayjs.tz(`${date} ${oh.open}`, TZ)
  const end   = dayjs.tz(`${date} ${oh.close}`, TZ)

  const resourceCount = settings.resources[productId] || 1
  const duration = variant.minutes + (settings.buffers[prod.type]||0)

  const bookings = getBookings().filter(b=> dayjs.tz(b.startsAt, TZ).isSame(d,'day'))
    .flatMap(b=> b.items.map(it=>({productId:it.productId, qty:it.qty, start:dayjs.tz(b.startsAt, TZ), end:dayjs.tz(b.endsAt, TZ)})))

  const slots=[]; let cursor=start
  const isToday = d.isSame(now(),'day')

  while(cursor.add(duration,'minute').isBefore(end) || cursor.add(duration,'minute').isSame(end)){
    if(!isToday || cursor.isAfter(now())){
      const overlapQty = bookings
        .filter(x=> x.productId===productId && cursor.isBefore(x.end) && cursor.add(duration,'minute').isAfter(x.start))
        .reduce((a,x)=>a+x.qty,0)
      if((resourceCount - overlapQty) >= qtyNum) slots.push(cursor.format('HH:mm'))
    }
    cursor = cursor.add(30,'minute')
  }
  res.json({ date, productId, variantId, qty:qtyNum, duration, slots })
})

// ------- Users ------- //
app.post('/api/users/register', (req,res)=>{
  const { name, email, password, phone } = req.body
  if(!name || !email || !password) return res.status(400).json({error:'Missing fields'})
  const users = getUsers()
  if(users.find(u=> u.email.toLowerCase()===email.toLowerCase())) return res.status(409).json({error:'Email already registered'})
  const user = { id: nanoid(), name, email, phone: phone||'', password: bcrypt.hashSync(password,10), createdAt:new Date().toISOString() }
  users.push(user); saveUsers(users)
  const token = signToken({ id:user.id, role:'user', email:user.email })
  res.json({ token, user: { id:user.id, name:user.name, email:user.email, phone:user.phone } })
})

app.post('/api/users/login', (req,res)=>{
  const { email, password } = req.body
  const user = getUsers().find(u=> u.email.toLowerCase()===String(email||'').toLowerCase())
  if(!user || !bcrypt.compareSync(password||'', user.password)) return res.status(401).json({error:'Invalid credentials'})
  const token = signToken({ id:user.id, role:'user', email:user.email })
  res.json({ token, user: { id:user.id, name:user.name, email:user.email, phone:user.phone } })
})

// Helper to read token (user or admin)
function authAny(req,res,next){
  const token = req.headers.authorization?.split(' ')[1]
  if(!token) return res.status(401).json({error:'Missing token'})
  try{ req.auth = jwt.verify(token, getJwtSecret()); next() }
  catch(e){ return res.status(401).json({error:'Invalid token'}) }
}
function authAdmin(req,res,next){ authAny(req,res,()=> req.auth?.role==='admin' ? next() : res.status(403).json({error:'Admin only'})) }

app.get('/api/users/me', authAny, (req,res)=>{
  if(req.auth.role!=='user') return res.status(403).json({error:'User only'})
  const user = getUsers().find(u=> u.id===req.auth.id)
  if(!user) return res.status(404).json({error:'Not found'})
  res.json({ id:user.id, name:user.name, email:user.email, phone:user.phone })
})

// ------- Create booking with strict time validation ------- //
app.post('/api/bookings', (req,res)=>{
  const { customer, items, startTime, source } = req.body
  if(!customer || !items?.length || !startTime) return res.status(400).json({error:'Invalid payload'})

  const requestedStart = dayjs.tz(startTime, TZ)
  if(!requestedStart.isValid()) return res.status(400).json({ error:'Bad start time' })
  if(requestedStart.isBefore(now())) return res.status(400).json({ error:'Cannot book a past time' })

  const settings = getSettings()
  const dateStr = requestedStart.format('YYYY-MM-DD')
  const isWeekend = [0,6].includes(requestedStart.day())
  const oh = isWeekend ? settings.openHours.weekend : settings.openHours.weekday
  const openT  = dayjs.tz(`${dateStr} ${oh.open}`,  TZ)
  const closeT = dayjs.tz(`${dateStr} ${oh.close}`, TZ)
  if (requestedStart.isBefore(openT) || !requestedStart.isBefore(closeT)) {
    return res.status(400).json({ error: 'Outside business hours' })
  }

  const products = getProducts()
  const dayBookings = getBookings().filter(b => dayjs.tz(b.startsAt, TZ).isSame(requestedStart, 'day'))
  const bookingsFlat = dayBookings.flatMap(b =>
    b.items.map(it => ({
      productId: it.productId,
      qty: it.qty,
      start: dayjs.tz(b.startsAt, TZ),
      end:   dayjs.tz(b.endsAt, TZ),
    }))
  )

  // Validate capacity for each item using its own duration (supports customMinutes)
  for (const it of items) {
    const p = products.find(x => x.id === it.productId)
    const v = p?.variants.find(v => v.id === it.variantId)
    if (!v) return res.status(400).json({ error: 'Invalid item' })

    const perItemMinutes = it.customMinutes ? parseInt(it.customMinutes,10) : v.minutes
    const duration = perItemMinutes + (settings.buffers[p.type] || 0)
    const windowEnd = requestedStart.add(duration, 'minute')
    const resourceCount = settings.resources[it.productId] || 1

    const overlapQty = bookingsFlat
      .filter(x => x.productId === it.productId && requestedStart.isBefore(x.end) && windowEnd.isAfter(x.start))
      .reduce((a, x) => a + x.qty, 0)

    if ((resourceCount - overlapQty) < (it.qty || 1)) {
      return res.status(409).json({ error: 'Slot no longer available' })
    }
  }

  // Optional attach user
  let userId = null
  if(source !== 'walk-in'){
    try{
      const token = req.headers.authorization?.split(' ')[1]
      if(token){
        const auth = jwt.verify(token, getJwtSecret())
        if(auth.role==='user') userId = auth.id
      }
    }catch{}
  }

  // Price + total duration
  let subtotal=0, minutes=0
  for(const it of items){
    const p = products.find(x=>x.id===it.productId); const v = p?.variants.find(v=>v.id===it.variantId)
    const baseMin = v.minutes
    const perItemMinutes = it.customMinutes ? parseInt(it.customMinutes,10) : baseMin
    const multiplier = baseMin>0 ? Math.ceil(perItemMinutes / baseMin) : 1
    subtotal += (v.price * multiplier * (it.qty||1)) + (it.gopro?200*(it.qty||1):0)
    minutes  += perItemMinutes * (it.qty||1)
  }
  const tax = Math.round(subtotal*settings.taxRate); const total = subtotal+tax

  const code = 'XGK-'+nanoid(6).toUpperCase()
  const startsAt = requestedStart.toISOString(); const endsAt = requestedStart.add(minutes,'minute').toISOString()

  const b = { id:nanoid(), code, customer, items, total, tax, status:'confirmed', startsAt, endsAt, checkedIn:false, createdAt:new Date().toISOString(), source: source||'online', userId, charges: [] }
  const all = getBookings(); all.push(b); saveBookings(all)
  res.json({ ok:true, booking:b })
})

// ------- My bookings & public fetch ------- //
app.get('/api/my/bookings', authAny, (req,res)=>{
  if(req.auth.role!=='user') return res.status(403).json({error:'User only'})
  const list = getBookings().filter(b=> b.userId === req.auth.id)
  list.sort((a,b)=> dayjs(b.startsAt) - dayjs(a.startsAt))
  res.json(list)
})
app.get('/api/bookings/:code', (req,res)=>{
  const b = getBookings().find(x=> x.code === req.params.code.toUpperCase())
  if(!b) return res.status(404).json({error:'Not found'})
  res.json(b)
})

// ------- Staff check-in ------- //
app.post('/api/staff/checkin', (req,res)=>{
  const { code } = req.body
  const all = getBookings(); const i = all.findIndex(x=> x.code===code)
  if(i<0) return res.status(404).json({error:'Not found'})
  all[i].checkedIn = true; saveBookings(all)
  res.json({ ok:true, booking: all[i] })
})

// ------- Admin auth + endpoints ------- //
app.post('/api/auth/login', (req,res)=>{
  const { email, password } = req.body
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || getSettings().admin?.email
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || getSettings().admin?.password

  let ok = false
  if (ADMIN_PASSWORD_HASH) {
    ok = email === ADMIN_EMAIL && bcrypt.compareSync(password || '', ADMIN_PASSWORD_HASH)
  } else {
    ok = email === ADMIN_EMAIL && password === ADMIN_PASSWORD
  }
  if(!ok) return res.status(401).json({error:'Invalid credentials'})
  const token = signToken({ role:'admin', email })
  res.json({ token })
})

// Admin: add custom charge to a booking
app.post('/api/admin/bookings/:code/charge', authAdmin, (req,res)=>{
  const { code } = req.params
  const { label, amount } = req.body || {}
  if(!label || !amount) return res.status(400).json({ error:'label and amount required' })
  const all = getBookings()
  const i = all.findIndex(b => b.code === String(code).toUpperCase())
  if(i<0) return res.status(404).json({ error:'Booking not found' })
  all[i].charges = all[i].charges || []
  all[i].charges.push({ label: String(label).slice(0,60), amount: parseInt(amount,10) || 0 })
  // recompute total
  const subtotal = all[i].items.reduce((s,it)=>{
    const p = getProducts().find(x=>x.id===it.productId)
    const v = p?.variants.find(v=> v.id===it.variantId) || { price:0, minutes:0 }
    const baseMin = v.minutes || 0
    const perItemMinutes = it.customMinutes ? parseInt(it.customMinutes,10) : baseMin
    const multiplier = baseMin>0 ? Math.ceil(perItemMinutes / baseMin) : 1
    const base = (v.price * multiplier * (it.qty||1)) + (it.gopro?200*(it.qty||1):0)
    return s + base
  }, 0)
  const extras = all[i].charges.reduce((s,c)=> s + (parseInt(c.amount,10)||0), 0)
  const tax = Math.round((subtotal + extras) * getSettings().taxRate)
  all[i].total = subtotal + extras + tax
  saveBookings(all)
  res.json({ ok:true, booking: all[i] })
})

app.get('/api/settings', authAdmin, (req,res)=>{
  res.json(getSettings())
})

app.get('/api/bookings', (req,res)=>{
  const { date, productId } = req.query;
  let list = getBookings();
  if(date){ list = list.filter(b=> dayjs.tz(b.startsAt, TZ).isSame(dayjs.tz(date, TZ),'day')) }
  if(productId){ list = list.filter(b=> b.items.some(it=> it.productId===productId)) }
  list.sort((a,b)=> dayjs(a.startsAt) - dayjs(b.startsAt))
  res.json(list);
})

const PORT = process.env.PORT || 4000
app.listen(PORT, ()=> console.log('xtreme-api listening on http://localhost:'+PORT))
