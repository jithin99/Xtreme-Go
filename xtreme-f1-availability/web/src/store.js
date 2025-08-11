import axios from 'axios'

const base = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export const api = axios.create({
  baseURL: base,
  withCredentials: true,
})

import React, { createContext, useContext, useEffect, useState } from 'react'

const Ctx = createContext(null)
export function Provider({ children }){
  const [user, setUser] = useState(null)
  const [admin, setAdmin] = useState(false)

  async function signIn(email){
    await api.post('/api/auth/login', { email })
    setUser({ email })
  }
  async function signOut(){
    await api.post('/api/auth/logout')
    setUser(null); setAdmin(false)
  }
  async function adminLogin(email, password){
    await api.post('/api/admin/login', { email, password })
    setAdmin(true)
  }
  async function adminLogout(){
    await api.post('/api/admin/logout')
    setAdmin(false)
  }

  const value = { api, user, setUser, signIn, signOut, admin, adminLogin, adminLogout }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export function useAuth(){ return useContext(Ctx) }