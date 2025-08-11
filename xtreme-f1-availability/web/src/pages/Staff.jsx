import React, { useState } from 'react'
import { useAuth, api } from '../store'

export default function Staff(){
  const { admin, adminLogin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')

  if(!admin){
    return (
      <div className="min-h-screen grid place-items-center bg-zinc-50">
        <div className="bg-white border rounded-2xl p-6 w-full max-w-sm">
          <h2 className="text-xl font-semibold mb-3">Staff Login</h2>
          <input placeholder="Admin Email" className="border rounded w-full px-3 py-2 mb-2" value={email} onChange={e=>setEmail(e.target.value)}/>
          <input placeholder="Password" type="password" className="border rounded w-full px-3 py-2 mb-2" value={password} onChange={e=>setPassword(e.target.value)}/>
          <button onClick={()=>adminLogin(email,password)} className="bg-black text-white rounded w-full py-2">Login</button>
          <a href="#/" className="block text-center text-sm text-zinc-500 mt-3">← Back to site</a>
        </div>
      </div>
    )
  }

  async function checkin(){
    const { data } = await api.post('/api/admin/checkin', { code })
    alert('Checked in: '+data.booking.code)
    setCode('')
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-4">Staff Check-in</h1>
      <div className="bg-white border rounded-xl p-4 flex gap-3">
        <input className="border rounded px-3 py-2 flex-1" placeholder="Booking code" value={code} onChange={e=>setCode(e.target.value)}/>
        <button onClick={checkin} className="bg-black text-white rounded px-4">Check-in</button>
      </div>
    </div>
  )
}