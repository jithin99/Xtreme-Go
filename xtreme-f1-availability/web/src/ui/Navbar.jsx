import React from 'react'

export default function Navbar(){
  return (
    <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="font-extrabold tracking-tight">Xtreme Go Karting</div>
        <nav className="hidden md:flex gap-6 text-sm">
          <a href="#pricing" className="hover:underline">Pricing</a>
          <a href="#book" className="hover:underline">Book</a>
          <a href="#reviews" className="hover:underline">Reviews</a>
          <a href="#/admin" className="hover:underline">Admin</a>
          <a href="#/staff" className="hover:underline">Staff</a>
          <a href="#/account" className="hover:underline">Account</a>
        </nav>
        <a href="#book" className="bg-[var(--f1-red)] text-white px-4 py-2 rounded-xl">Book Now</a>
      </div>
    </div>
  )
}