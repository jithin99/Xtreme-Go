import React from 'react'
import { Phone, MessageCircle, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

export default function FloatingButtons(){
  const items = [
    { href:'https://wa.me/91XXXXXXXXXX?text=Hi%20Xtreme%20Go%20Karting!', icon:MessageCircle, label:'WhatsApp' },
    { href:'tel:+91XXXXXXXXXX', icon:Phone, label:'Call' },
    { href:'#book', icon:Calendar, label:'Book' },
  ]
  return (
    <div className="fixed z-50 right-5 bottom-5 flex flex-col gap-3">
      {items.map((it,i)=>(
        <motion.a key={it.label} href={it.href} target={it.href.startsWith('http') ? '_blank':undefined}
          whileHover={{scale:1.05}} whileTap={{scale:.95}}
          initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:.1*i}}
          className="group flex items-center gap-2 bg-[var(--f1-red)] text-white px-4 py-2 rounded-full shadow-lg">
          <it.icon size={18}/><span className="text-sm">{it.label}</span>
        </motion.a>
      ))}
    </div>
  )
}