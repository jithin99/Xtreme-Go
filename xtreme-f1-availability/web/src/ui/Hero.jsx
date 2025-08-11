import React from 'react'
import { motion } from 'framer-motion'

export default function Hero(){
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[var(--f1-dark)] f1-stripes text-white py-16 mt-6">
      <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl" style={{background:'radial-gradient(circle, rgba(255,30,30,.35), transparent 60%)'}}/>
      <div className="pointer-events-none absolute -bottom-16 -left-16 w-72 h-72 rounded-full blur-3xl" style={{background:'radial-gradient(circle, rgba(255,255,255,.15), transparent 60%)'}}/>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center px-6">
        <div>
          <span className="inline-block text-xs tracking-widest bg-white/10 px-3 py-1 rounded-full">NEW • Online Booking</span>
          <h1 className="mt-4 text-4xl md:text-5xl font-black leading-tight">
            Feel the <span className="text-[var(--f1-red)]">Rush</span>.<br/>Book Your Laps.
          </h1>
          <p className="mt-4 text-white/70">Karts, PS5, Snooker & 8-Ball. Fast, secure, and mobile-friendly.</p>
          <div className="mt-6 flex gap-3">
            <a href="#book" className="bg-[var(--f1-red)] hover:brightness-110 transition text-white px-5 py-3 rounded-xl font-semibold float">Book Now</a>
            <a href="#pricing" className="bg-white/10 hover:bg-white/20 transition px-5 py-3 rounded-xl">See Pricing</a>
          </div>
        </div>

        <motion.div initial={{opacity:0, y:40}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:.7}}
          className="relative bg-[var(--f1-gray)]/80 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <div className="text-sm text-white/70">Next Available</div>
          <div className="mt-2 text-3xl font-extrabold">Today • 4:30 PM</div>
          <div className="mt-6 h-24 rounded-xl bg-black/40 flex items-center justify-center">
            <span className="text-white/50 text-sm">Live Track Preview</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}