import React, { useEffect, useState } from 'react'
import { api } from '../store'

export default function Pricing(){
  const [products, setProducts] = useState([])
  useEffect(()=>{ (async()=>{
    const { data } = await api.get('/api/products'); setProducts(data)
  })() },[])
  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-4">Pricing</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {products.map(cat => (
          <div key={cat.id} className="border rounded-2xl p-4 bg-white">
            <h3 className="font-semibold mb-2">{cat.title}</h3>
            <ul className="space-y-2">
              {cat.variants.map(v=>(
                <li key={v.id} className="flex items-center justify-between">
                  <span>{v.title}</span>
                  <span className="font-semibold">₹{v.price}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}