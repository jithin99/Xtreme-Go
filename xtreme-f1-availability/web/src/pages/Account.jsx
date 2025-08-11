import React, { useEffect, useState } from 'react'
import { useAuth, api } from '../store'

export default function Account(){
  const { user, signIn, signOut } = useAuth()
  const [data, setData] = useState(null)

  useEffect(()=>{ (async()=>{
    if(!user){
      const email = prompt('Enter email to sign in')
      if(!email) return window.location.hash = '#/'
      await signIn(email)
    }
    const { data } = await api.get('/api/account')
    setData(data)
  })() },[])

  if(!data) return null
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Account</h1>
        <button onClick={signOut} className="border rounded px-3 py-1">Sign out</button>
      </div>
      <div className="bg-white border rounded-xl p-4">
        <div className="text-sm text-zinc-600 mb-2">Signed in as {data.email}</div>
        <h3 className="font-semibold mb-2">Bookings</h3>
        <div className="space-y-2">
          {data.bookings.map(b=>(
            <div key={b.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{b.productId} • {b.date} {b.time}</div>
                <div className="text-sm text-zinc-600">Qty {b.qty} • {b.hours||1}h • Code {b.code}</div>
              </div>
              <div className="font-semibold">₹{b.total}</div>
            </div>
          ))}
          {!data.bookings.length && <div className="text-zinc-500">No bookings yet.</div>}
        </div>
      </div>
    </div>
  )
}