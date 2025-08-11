import React, { useState } from 'react'
import { useAuth } from '../store'
import AdminAvailability from './AdminAvailability.jsx'

export default function Admin(){
  const { admin, adminLogin, adminLogout } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('availability')

  if(!admin){
    return (
      <div className="min-h-screen grid place-items-center bg-zinc-50">
        <div className="bg-white border rounded-2xl p-6 w-full max-w-sm">
          <h2 className="text-xl font-semibold mb-3">Admin Login</h2>
          <input placeholder="Email" className="border rounded w-full px-3 py-2 mb-2" value={email} onChange={e=>setEmail(e.target.value)}/>
          <input placeholder="Password" type="password" className="border rounded w-full px-3 py-2 mb-2" value={password} onChange={e=>setPassword(e.target.value)}/>
          <button onClick={()=>adminLogin(email,password)} className="bg-black text-white rounded w-full py-2">Login</button>
          <a href="#/" className="block text-center text-sm text-zinc-500 mt-3">← Back to site</a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <button onClick={adminLogout} className="border rounded px-3 py-1">Logout</button>
      </div>
      <div className="mt-4 flex gap-3">
        <button onClick={()=>setTab('availability')} className={"px-3 py-2 rounded "+ (tab==='availability'?'bg-black text-white':'border')}>Availability</button>
      </div>
      <div className="mt-4">
        {tab==='availability' && <AdminAvailability/>}
      </div>
    </div>
  )
}