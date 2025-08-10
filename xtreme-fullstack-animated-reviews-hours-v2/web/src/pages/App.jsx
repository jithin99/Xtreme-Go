
import React from 'react'
import Home from './Home.jsx'
import Admin from './Admin.jsx'
import Staff from './Staff.jsx'
import Auth from './Auth.jsx'
import Account from './Account.jsx'

export default function App(){
  const [route,setRoute]=React.useState('home')
  React.useEffect(()=>{ const onHash=()=> setRoute(location.hash.replace('#','')||'home'); window.addEventListener('hashchange',onHash); onHash(); return ()=> window.removeEventListener('hashchange',onHash)},[])
  if(route==='admin') return <Admin/>
  if(route==='staff') return <Staff/>
  if(route==='auth') return <Auth/>
  if(route==='account') return <Account/>
  return <Home/>
}
