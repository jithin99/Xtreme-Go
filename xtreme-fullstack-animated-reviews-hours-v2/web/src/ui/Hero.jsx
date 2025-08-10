
import React from 'react'
export default function Hero(){
  return (
    <div id='home' className='relative overflow-hidden'>
      {/* Glow orbs */}
      <div className='absolute inset-0 -z-10'>
        <div className='absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full blur-3xl opacity-40 bg-gradient-to-br from-red-500 to-fuchsia-500 animate-[pulse_8s_ease-in-out_infinite]'></div>
        <div className='absolute -bottom-24 -left-24 w-[520px] h-[520px] rounded-full blur-3xl opacity-40 bg-gradient-to-br from-indigo-500 to-cyan-400 animate-[pulse_10s_ease-in-out_infinite]'></div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center'>
        <div>
          <div className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-black text-white/90'>
            New • Online Booking Live
          </div>
          <h1 className='mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1]'>
            Feel the <span className='text-transparent bg-clip-text bg-gradient-to-r from-black to-red-600'>Rush</span>.
            <br/>Book Your Laps.
          </h1>
          <p className='mt-4 text-zinc-600 text-lg'>
            Reserve Karts, PS5, 8-Ball Pool and Snooker. Fast, secure, and mobile-friendly.
          </p>
          <div className='mt-6 flex gap-3'>
            <a href='#book' className='btn btn-primary'>Book Now</a>
            <a href='#pricing' className='btn border'>See Pricing</a>
          </div>

          <div className='mt-8 h-2 glow'></div>
        </div>

        {/* Animated "kart" chip */}
        <div className='relative aspect-[4/3] md:aspect-[4/3]'>
          <div className='absolute inset-0 rounded-3xl border bg-white shadow-2xl overflow-hidden'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,0,0,.06),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(0,0,0,.05),transparent_35%)]'></div>
            <div className='absolute left-6 right-6 top-6 h-10 rounded-full bg-zinc-100 animate-float'></div>
            <div className='absolute left-10 right-10 top-24 h-10 rounded-full bg-zinc-100 animate-float' style={{animationDelay:'-1s'}}></div>
            <div className='absolute left-16 right-16 top-40 h-10 rounded-full bg-zinc-100 animate-float' style={{animationDelay:'-2s'}}></div>
            <div className='absolute -bottom-4 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent'></div>
          </div>
        </div>
      </div>
    </div>
  )
}
