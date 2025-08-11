import React, { useEffect, useState } from 'react'
import { api, useAuth } from '../store'

export default function AdminAvailability(){
  const [date, setDate] = useState(()=> new Date().toISOString().slice(0,10))
  const [productId, setProductId] = useState('')
  const [products, setProducts] = useState([])
  const [rows, setRows] = useState([])

  useEffect(()=>{ (async()=>{
    const { data } = await api.get('/api/products'); setProducts(data)
    const first = data?.[0]?.variants?.[0]?.id; if(first) setProductId(first)
  })() },[])

  async function load(){
    if(!productId) return
    const { data } = await api.get('/api/availability', { params:{ date, productId } })
    setRows(data.slots)
  }
  useEffect(()=>{ load() }, [date, productId])

  async function saveBase(){
    const edits = Array.from(document.querySelectorAll('[data-base]'))
      .map(el => ({ time: el.dataset.time, base: el.value }))
      .filter(x => x.base !== '')
    if(!edits.length) return alert('Nothing to save')
    await api.post('/api/admin/availability/upsert', { date, productId, slots: edits })
    await load(); alert('Saved!')
  }
  async function resetOverrides(){
    if(!confirm('Reset overrides for this day/product?')) return
    await api.post('/api/admin/availability/reset', { date, productId })
    await load()
  }

  return (
    <div className="p-4">
      <div className="flex gap-3 mb-3">
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border rounded px-3 py-2"/>
        <select value={productId} onChange={e=>setProductId(e.target.value)} className="border rounded px-3 py-2">
          {products.map(p=>(
            <optgroup key={p.id} label={p.title}>
              {p.variants.map(v=> <option key={v.id} value={v.id}>{v.title}</option>)}
            </optgroup>
          ))}
        </select>
        <button onClick={saveBase} className="bg-black text-white rounded px-4">Save</button>
        <button onClick={resetOverrides} className="border rounded px-4">Reset</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Remaining</th>
              <th className="p-2 text-left">Set Base</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.time} className="border-t">
                <td className="p-2 font-mono">{r.time}</td>
                <td className="p-2">{r.remaining}</td>
                <td className="p-2">
                  <input type="number" min="0" placeholder="(keep default)" className="border rounded px-2 py-1 w-28" data-base data-time={r.time}/>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td className="p-4 text-gray-500" colSpan={3}>No slots.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}