
import React from 'react'
import { api } from '../lib/api'
export default function Reviews(){
  const [list,setList]=React.useState([])
  const [name,setName]=React.useState('')
  const [text,setText]=React.useState('')
  const load=()=> api.get('/api/reviews').then(r=> setList(r.data))
  React.useEffect(()=>{ load() },[])
  const submit=async(e)=>{
    e.preventDefault()
    if(!name || !text) return
    await api.post('/api/reviews',{name,text})
    setName(''); setText(''); load()
    location.hash='reviews'
  }
  return (
    <section id='reviews' className='max-w-7xl mx-auto px-4 py-12 md:py-16'>
      <h2 className='text-2xl md:text-3xl font-bold mb-6'>What riders say</h2>
      <div className='grid md:grid-cols-2 gap-6'>
        <form onSubmit={submit} className='card p-4 grid gap-3'>
          <input className='border rounded-xl px-3 py-2' placeholder='Your name' value={name} onChange={e=>setName(e.target.value)} required/>
          <textarea className='border rounded-xl px-3 py-2 min-h-[120px]' placeholder='Write your review...' value={text} onChange={e=>setText(e.target.value)} required/>
          <button className='btn btn-primary w-full'>Submit Review</button>
        </form>
        <div className='grid gap-3'>
          {list.length===0? <div className='text-sm text-zinc-600'>No reviews yet — be the first!</div> :
            list.map(r=>(<div key={r.id} className='card p-4'><div className='font-semibold'>{r.name}</div><div className='text-sm mt-1 text-zinc-700 whitespace-pre-wrap'>{r.text}</div><div className='text-xs text-zinc-500 mt-1'>{new Date(r.createdAt).toLocaleString()}</div></div>))
          }
        </div>
      </div>
    </section>
  )
}
