
import React from 'react'
import { api } from '../lib/api'
export default function Auth(){
  const [mode,setMode]=React.useState('login')
  const [form,setForm]=React.useState({ name:'', email:'', password:'', phone:'' })
  const [err,setErr]=React.useState('')
  const onSubmit = async (e)=>{
    e.preventDefault(); setErr('')
    try{
      const url = mode==='login'? '/api/users/login' : '/api/users/register'
      const {data} = await api.post(url, form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      location.hash = 'home'; location.reload()
    }catch(ex){ setErr(ex.response?.data?.error || 'Failed') }
  }
  return (<div className='min-h-screen grid place-items-center px-4'><div className='card p-6 w-[420px]'><h1 className='text-xl font-bold mb-2'>{mode==='login'?'Sign in':'Create account'}</h1><p className='text-xs text-zinc-600 mb-3'>Book faster and track your codes.</p><form onSubmit={onSubmit} className='grid gap-3'>{mode==='register'&&(<input className='border rounded-xl px-3 py-2' placeholder='Full name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>)}<input className='border rounded-xl px-3 py-2' type='email' placeholder='Email' value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/><input className='border rounded-xl px-3 py-2' type='password' placeholder='Password' value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>{mode==='register'&&(<input className='border rounded-xl px-3 py-2' placeholder='Phone (optional)' value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>)}{err && <div className='text-red-600 text-xs'>{err}</div>}<button className='btn btn-primary w-full' type='submit'>{mode==='login'?'Sign in':'Create account'}</button></form><div className='mt-3 text-xs text-center'>{mode==='login'? <>No account? <button className='underline' onClick={()=>setMode('register')}>Register</button></> : <>Already have an account? <button className='underline' onClick={()=>setMode('login')}>Sign in</button></>}</div><a className='text-xs text-zinc-600 block mt-4 text-center' href='#home'>← Back to site</a></div></div>)}
