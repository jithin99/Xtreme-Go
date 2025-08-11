import React, { useEffect, useMemo, useState } from 'react'
import { api, useAuth } from '../store'

export default function Booking(){
  const { user, signIn } = useAuth()
  const [products, setProducts] = useState([])
  const [productId, setProductId] = useState('')
  const [date, setDate] = useState(()=> new Date().toISOString().slice(0,10))
  const [slots, setSlots] = useState([])
  const [time, setTime] = useState('')
  const [qty, setQty] = useState(1)
  const [hours, setHours] = useState(1)
  const selected = useMemo(()=>{
    for(const cat of products) for(const v of cat.variants) if(v.id===productId) return v
    return null
  },[products, productId])

  useEffect(()=>{ (async()=>{
    const { data } = await api.get('/api/products'); setProducts(data)
    const first = data?.[0]?.variants?.[0]?.id; if(first) setProductId(first)
  })() },[])

  async function loadSlots(){ if(!productId) return;
    const { data } = await api.get('/api/availability', { params:{ date, productId } }); setSlots(data.slots)
  }
  useEffect(()=>{ loadSlots() }, [date, productId])

  async function doBook(){
    if(!user){
      const email = prompt('Enter your email to sign in')
      if(!email) return
      await signIn(email)
    }
    const payload = { productId, date, time, qty, hours }
    const { data } = await api.post('/api/bookings', payload)
    alert('Booked! Code: ' + data.booking.code)
  }

  return (
    <section id="book" className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-4">Book</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-4">
          <div className="flex gap-3 mb-3">
            <input type="date" className="border rounded px-3 py-2" value={date} onChange={e=>setDate(e.target.value)}/>
            <select className="border rounded px-3 py-2" value={productId} onChange={e=>setProductId(e.target.value)}>
              {products.map(p=>(
                <optgroup key={p.id} label={p.title}>
                  {p.variants.map(v=> <option key={v.id} value={v.id}>{v.title}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          {selected?.type==='game' && (
            <div className="mb-3">
              <label className="text-sm text-zinc-600">Hours</label>
              <input type="number" min="1" value={hours} onChange={e=>setHours(Number(e.target.value))} className="border rounded px-3 py-2 ml-2 w-24"/>
            </div>
          )}

          <div className="mb-3">
            <label className="text-sm text-zinc-600">Quantity</label>
            <input type="number" min="1" value={qty} onChange={e=>setQty(Number(e.target.value))} className="border rounded px-3 py-2 ml-2 w-24"/>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {slots.map(s=>(
              <button key={s.time} onClick={()=>setTime(s.time)} disabled={s.remaining===0}
                className={"px-3 py-2 rounded border text-sm " + (s.remaining===0?'opacity-50 cursor-not-allowed':'' ) + (time===s.time?' bg-black text-white ':'')}>
                {s.time} <span className="text-zinc-500">({s.remaining} left)</span>
              </button>
            ))}
          </div>

          <button onClick={doBook} disabled={!time} className="mt-4 bg-black text-white rounded px-4 py-2">Confirm</button>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <h3 className="font-semibold mb-2">Summary</h3>
          <div>Date: {date}</div>
          <div>Time: {time || '-'}</div>
          <div>Variant: {selected?.title || '-'}</div>
          <div>Qty: {qty}</div>
          {selected?.type==='game' && <div>Hours: {hours}</div>}
          <div className="mt-2 text-zinc-600 text-sm">Price is calculated on server.</div>
        </div>
      </div>
    </section>
  )
}