import React from 'react'
import Navbar from '../ui/Navbar.jsx'
import Hero from '../ui/Hero.jsx'
import Pricing from '../ui/Pricing.jsx'
import Reviews from '../ui/Reviews.jsx'
import Booking from '../ui/Booking.jsx'
import FloatingButtons from '../ui/FloatingButtons.jsx'

export default function Home(){
  return (
    <>
      <Navbar/>
      <main>
        <div className="max-w-6xl mx-auto px-6">
          <Hero/>
        </div>
        <Pricing/>
        <Booking/>
        <Reviews/>
      </main>
      <FloatingButtons/>
    </>
  )
}