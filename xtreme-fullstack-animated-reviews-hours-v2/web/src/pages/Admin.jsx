
import React from 'react'
import dayjs from 'dayjs'
import { api as axios } from '../lib/api'
function currency(n){ return `₹${n.toLocaleString('en-IN')}` }

export default function Admin(){
  const [email,setEmail]=React.useState('admin@xtreme.local'); const [password,setPassword]=React.useState('admin123'); const [token,setToken]=React.useState(null);
  const [tab,setTab]=React.useState('schedule'); const [products,setProducts]=React.useState([]); const [settings,setSettings]=React.useState(null)

  const login=async()=>{ const {data}=await axios.post('/api/auth/login',{email,password}); localStorage.setItem('adminToken',data.token); setToken(data.token) }
  React.useEffect(()=>{ const t=localStorage.getItem('adminToken'); if(t) setToken(t) },[])

  React.useEffect(()=>{ const load=async()=>{ const {data}=await axios.get('/api/products'); setProducts(data); try{ const s=await axios.get('/api/settings',{headers:{Authorization:`Bearer ${token}`}}); setSettings(s.data) }catch{} }; if(token) load() },[token])

  if(!token) return (<div className='min-h-screen grid place-items-center'><div className='card p-6 w-[420px]'><h1 className='text-xl font-bold mb-3'>Admin Login</h1><input className='border rounded-xl px-3 py-2 w-full mb-2' value={email} onChange={e=>setEmail(e.target.value)}/><input className='border rounded-xl px-3 py-2 w-full mb-3' type='password' value={password} onChange={e=>setPassword(e.target.value)}/><button className='btn btn-primary w-full' onClick={login}>Login</button><a className='text-xs text-zinc-600 block mt-3 text-center' href='#home'>← Back to site</a></div></div>)

  return (<div className='max-w-6xl mx-auto px-4 py-8'><div className='flex items-center justify-between'><h1 className='text-2xl font-bold'>Admin</h1><div className='flex gap-2'><button className={'px-3 py-1.5 rounded-xl border '+(tab==='schedule'?'bg-black text-white':'')} onClick={()=>setTab('schedule')}>Schedule</button><button className={'px-3 py-1.5 rounded-xl border '+(tab==='products'?'bg-black text-white':'')} onClick={()=>setTab('products')}>Products</button></div></div>{tab==='products'? <ProductsTab products={products}/> : <ScheduleTab products={products} settings={settings} token={token}/>}<a className='text-xs text-zinc-600 block mt-8' href='#home'>← Back to site</a></div>)
}

function ProductsTab({products}){
  return (<div className='grid md:grid-cols-2 gap-4 mt-6'>{products.map(p=>(<div key={p.id} className='card p-4'><div className='font-semibold'>{p.name}</div><ul className='text-sm mt-2'>{p.variants.map(v=><li key={v.id}>{v.name} — ₹{v.price}</li>)}</ul></div>))}</div>)
}

function ScheduleTab({products, settings, token}){
  const [date,setDate]=React.useState(dayjs().format('YYYY-MM-DD')); const [rows,setRows]=React.useState([]); const [loading,setLoading]=React.useState(false); const [code,setCode]=React.useState(''); const [label,setLabel]=React.useState(''); const [amount,setAmount]=React.useState('')

  const load=async()=>{ setLoading(true); const {data}=await axios.get('/api/bookings',{params:{date}}); const list=[]; for(const b of data){ for(const it of b.items){ const prod=products.find(p=>p.id===it.productId); const v=prod?.variants.find(x=>x.id===it.variantId); list.push({ time:dayjs(b.startsAt).format('HH:mm'), code:b.code, item:prod?prod.name:it.productId, variant:v?v.name:it.variantId, qty:it.qty, gopro:it.gopro?'Yes':'No', total:b.total, source:b.source||'online', status:b.checkedIn?'Checked-in':'Pending' }) } } list.sort((a,b)=>a.time.localeCompare(b.time)); setRows(list); setLoading(false) }
  React.useEffect(()=>{ load() },[date])

  const addCharge=async()=>{ if(!code||!label||!amount) return alert('Fill code, name and price'); await axios.post(`/api/admin/bookings/${code}/charge`,{label,amount:parseInt(amount,10)},{headers:{Authorization:`Bearer ${token}`}}); setCode(''); setLabel(''); setAmount(''); await load() }

  return (<div className='mt-6'>
    <div className='card p-4 mb-4 grid gap-3'>
      <div className='flex flex-wrap gap-3 items-end'>
        <div className='flex flex-col'>
          <label className='text-xs mb-1'>Date</label>
          <input type='date' value={date} onChange={e=>setDate(e.target.value)} className='border rounded-xl px-3 py-2'/>
        </div>
        <button className='btn border' onClick={load} disabled={loading}>{loading?'Loading...':'Refresh'}</button>
        {settings && (<div className='ml-auto text-xs text-zinc-600'>Capacity: Super={settings.resources?.super ?? '-'} • Double={settings.resources?.double ?? '-'} • Kids={settings.resources?.kids ?? '-'}</div>)}
      </div>

      <WalkInForm date={date} products={products} onCreated={load} />

      <div className='flex flex-wrap gap-2 items-end'>
        <div className='text-sm font-semibold mr-2'>Add Custom Charge</div>
        <div className='flex flex-col'><label className='text-xs mb-1'>Booking Code</label><input className='border rounded-xl px-3 py-2' value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder='XGK-XXXXXX'/></div>
        <div className='flex flex-col'><label className='text-xs mb-1'>Custom Name</label><input className='border rounded-xl px-3 py-2' value={label} onChange={e=>setLabel(e.target.value)} placeholder='Snacks / Drinks / ...'/></div>
        <div className='flex flex-col'><label className='text-xs mb-1'>Price (₹)</label><input className='border rounded-xl px-3 py-2' value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9]/g,''))} placeholder='100'/></div>
        <button className='btn btn-primary' onClick={addCharge}>Add Charge</button>
      </div>
    </div>

    <div className='overflow-auto rounded-2xl border bg-white'>
      <table className='w-full text-sm'>
        <thead className='bg-zinc-50'><tr><th className='p-3'>Time</th><th className='p-3'>Code</th><th className='p-3'>Item</th><th className='p-3'>Variant</th><th className='p-3'>Qty</th><th className='p-3'>GoPro</th><th className='p-3'>Source</th><th className='p-3'>Status</th><th className='p-3 text-right'>Total</th></tr></thead>
        <tbody>{rows.length===0?(<tr><td className='p-3 text-zinc-500' colSpan='9'>No bookings for this date.</td></tr>):rows.map((r,i)=>(<tr key={i} className={i%2?'bg-white':'bg-zinc-50'}><td className='p-3 font-mono'>{r.time}</td><td className='p-3'>{r.code}</td><td className='p-3'>{r.item}</td><td className='p-3'>{r.variant}</td><td className='p-3'>{r.qty}</td><td className='p-3'>{r.gopro}</td><td className='p-3'>{r.source}</td><td className='p-3'>{r.status}</td><td className='p-3 text-right'>{currency(r.total)}</td></tr>))}</tbody>
      </table>
    </div>
  </div>)
}

function WalkInForm({date, products, onCreated}){
  const [time,setTime]=React.useState('11:00')
  const [name,setName]=React.useState('Walk-in')
  const [phone,setPhone]=React.useState('')
  const [productId,setProductId]=React.useState('super')
  const [variantId,setVariantId]=React.useState('super-5')
  const [qty,setQty]=React.useState(1)
  const [gopro,setGopro]=React.useState(false)
  const [hours,setHours]=React.useState(1) // for games

  React.useEffect(()=>{
    const p = products.find(p=>p.id===productId)
    if(p) setVariantId(p.variants[0].id)
  },[productId,products])

  const create = async()=>{
    const startTime = `${date} ${time}`
    const p = products.find(p=>p.id===productId)
    const isGame = p?.type === 'Game'
    await axios.post('/api/bookings',{
      customer:{ name, phone },
      items:[{
        productId, variantId, qty: 1,
        gopro: p?.type==='Kart' ? gopro : false,
        ...(isGame ? { customMinutes: Math.max(1, parseInt(hours,10)) * 60 } : {})
      }],
      startTime,
      source:'walk-in'
    })
    onCreated?.()
    setName('Walk-in'); setPhone(''); setQty(1); setGopro(false); setHours(1)
  }

  const current = products.find(p=>p.id===productId)
  return (
    <div className='flex flex-wrap gap-2 items-end'>
      <div className='text-sm font-semibold mr-2'>Add Walk-in</div>
      <div className='flex flex-col'><label className='text-xs mb-1'>Time</label><input className='border rounded-xl px-3 py-2' type='time' value={time} onChange={e=>setTime(e.target.value)}/></div>
      <div className='flex flex-col'><label className='text-xs mb-1'>Name</label><input className='border rounded-xl px-3 py-2' value={name} onChange={e=>setName(e.target.value)}/></div>
      <div className='flex flex-col'><label className='text-xs mb-1'>Phone</label><input className='border rounded-xl px-3 py-2' value={phone} onChange={e=>setPhone(e.target.value)}/></div>
      <div className='flex flex-col'><label className='text-xs mb-1'>Product</label><select className='border rounded-xl px-3 py-2' value={productId} onChange={e=>setProductId(e.target.value)}>{products.filter(p=>p.type!=='AddOn').map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
      <div className='flex flex-col'><label className='text-xs mb-1'>Variant</label><select className='border rounded-xl px-3 py-2' value={variantId} onChange={e=>setVariantId(e.target.value)}>{products.find(p=>p.id===productId)?.variants.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
      {current?.type==='Game' ? (
        <div className='flex flex-col'><label className='text-xs mb-1'>Hours</label><input className='border rounded-xl px-3 py-2' type='number' min='1' value={hours} onChange={e=>setHours(e.target.value.replace(/[^0-9]/g,''))}/></div>
      ): (
        <div className='flex flex-col'><label className='text-xs mb-1'>Qty</label><input className='border rounded-xl px-3 py-2' type='number' min='1' value={qty} onChange={e=>setQty(parseInt(e.target.value||'1'))} disabled/></div>
      )}
      {current?.type==='Kart' && (<label className='text-xs flex items-center gap-2'><input type='checkbox' checked={gopro} onChange={e=>setGopro(e.target.checked)}/> Go-Pro</label>)}
      <button className='btn btn-primary' onClick={create}>Create Walk-in</button>
    </div>
  )
}
