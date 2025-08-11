import React, { useEffect, useState } from 'react'
import { Provider } from '../store'
import Home from './Home.jsx'
import Admin from './Admin.jsx'
import Staff from './Staff.jsx'
import Account from './Account.jsx'

function Router(){
  const [hash, setHash] = useState(window.location.hash || '#/')
  useEffect(()=>{
    const f=()=>setHash(window.location.hash||'#/')
    window.addEventListener('hashchange',f)
    return ()=>window.removeEventListener('hashchange',f)
  },[])
  if(hash.startsWith('#/admin')) return <Admin/>
  if(hash.startsWith('#/staff')) return <Staff/>
  if(hash.startsWith('#/account')) return <Account/>
  return <Home/>
}

export default function App(){
  return <Provider><Router/></Provider>
}