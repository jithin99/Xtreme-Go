import React, { useEffect, useState } from 'react'
import { api } from '../store'

export default function Reviews(){
  const [list, setList] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  async function load(){ const { data } = await api.get('/api/reviews'); setList(data) }
  useEffect(()=>{ load() },[])
  async function submit(e){
    e.preventDefault();
    await api.post('/api/reviews', { name, message });
    setName(''); setMessage(''); load();
  }
  return (
    <section id="reviews" className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      <form onSubmit={submit} className="bg-white border rounded-xl p-4 flex gap-3 mb-6">
        <input className="border rounded px-3 py-2 flex-1" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>
        <input className="border rounded px-3 py-2 flex-[2]" placeholder="Your review" value={message} onChange={e=>setMessage(e.target.value)}/>
        <button className="bg-black text-white rounded px-4">Post</button>
      </form>
      <div className="space-y-3">
        {list.map(r=>(
          <div key={r.id} className="bg-white border rounded-xl p-4">
            <div className="font-semibold">{r.name}</div>
            <div className="text-sm text-zinc-600">{r.message}</div>
          </div>
        ))}
      </div>
    </section>
  )
}