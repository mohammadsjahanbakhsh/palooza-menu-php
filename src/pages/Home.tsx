// src/pages/Home.tsx
import React from 'react'
import Halls from '../pages/‌HallsList'      // ← مسیر واقعی فایل‌ات
import Tables from '../pages/‌TablesPage'    // ← مسیر واقعی فایل‌ات

export default function Home() {
  return (
    <div className="…">
      {/* … اورلِی و هِدر … */}
      
      {/* بخش سالن‌ها */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">سالن‌ها</h2>
        <Halls />
      </section>

      {/* بخش میزها */}
      <section>
        <h2 className="text-xl font-bold mb-4">میزها</h2>
        <Tables />
      </section>
    </div>
  )
}
