
import React from 'react'
import dayjs from 'dayjs'
import { api } from '../lib/api'
import Navbar from '../ui/Navbar.jsx'
const currency = (n) => `₹${n.toLocaleString('en-IN')}`
export default function Account(){
  const [user] = React.useState(JSON.parse(localStorage.getItem('user') || 'null'))
  const [rows, setRows] = React.useState([])
  React.useEffect(() => {
    if (!user) { location.hash = 'auth'; return }
    api.get('/api/my/bookings').then(r => setRows(r.data)).catch(() => setRows([]))
  }, [user])
  return (<div className='min-h-screen'><Navbar/><div className='max-w-5xl mx-auto px-4 py-10'><h1 className='text-2xl font-bold mb-4'>My Bookings</h1>{rows.length===0? <div className='text-sm text-zinc-600'>No bookings yet.</div> : (<div className='grid gap-4'>{rows.map(b=>(<div key={b.id} className='card p-4'><div className='flex flex-wrap justify-between'><div><div className='font-semibold'>Code: <span className='font-mono'>{b.code}</span></div><div className='text-xs text-zinc-600'>{dayjs(b.startsAt).format('DD MMM YYYY, HH:mm')}</div></div><div className='text-right'><div className='font-semibold'>{currency(b.total)}</div><div className='text-xs text-zinc-600'>{b.status}</div></div></div><ul className='mt-2 text-sm list-disc pl-5'>{b.items.map((it,i)=> <li key={i}>{it.qty}× {it.productId} — {it.variantId} {it.gopro?'• Go-Pro':''}</li>)}</ul>{b.charges?.length>0 && (<div className='mt-2 text-xs'>Extra charges: {b.charges.map(c=> `${c.label} (₹${c.amount})`).join(', ')}</div>)}</div>))}</div>)}<a className='text-xs text-zinc-600 block mt-6' href='#home'>← Back to site</a></div></div>)
}
