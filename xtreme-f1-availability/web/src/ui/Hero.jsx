// xtreme-f1-availability/web/src/ui/Hero.jsx
import React from 'react'

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-tr from-red-500/20 via-rose-400/10 to-fuchsia-400/20 blur-3xl" />

      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28 md:py-32">
        <p className="text-xs font-semibold tracking-widest text-rose-500">NEW · Online Booking</p>
        <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
          Feel the <span className="inline-block animate-pulse text-rose-600">Rush</span>.<br />
          Book Your <span className="inline-block">Laps.</span>
        </h1>
        <p className="mt-4 max-w-xl text-zinc-600">
          Karts, PS5, Snooker & 8-Ball. Fast, secure, and mobile-friendly.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#book" className="rounded-xl bg-rose-600 px-5 py-3 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700">
            Book Now
          </a>
          <a href="#pricing" className="rounded-xl border border-zinc-200 px-5 py-3 text-zinc-700 hover:bg-zinc-50">
            See Pricing
          </a>
        </div>
      </div>
    </section>
  )
}
