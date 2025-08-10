
import React from 'react'
import { api as axios } from '../lib/api'
export default function Staff(){
  const [code,setCode]=React.useState(''); const [result,setResult]=React.useState(null)
  const checkin=async()=>{ try{ const {data}=await axios.post('/api/staff/checkin',{code}); setResult(data.booking) }catch(e){ alert('Not found')} }
  return (<div className='min-h-screen grid place-items-center'><div className='card p-6 w-[420px]'><h1 className='text-xl font-bold mb-3'>Staff Check-In</h1><input className='border rounded-xl px-3 py-2 w-full mb-3' placeholder='Booking Code (e.g., XGK-ABC123)' value={code} onChange={e=>setCode(e.target.value)}/><button className='btn btn-primary w-full' onClick={checkin}>Mark Checked-In</button>{result&&(<div className='mt-4 text-sm'><div className='font-semibold'>{result.code}</div><div>Status: {result.checkedIn?'Checked-in':'Pending'}</div></div>)}<a className='text-xs text-zinc-600 block mt-3 text-center' href='#home'>← Back to site</a></div></div>)
}
