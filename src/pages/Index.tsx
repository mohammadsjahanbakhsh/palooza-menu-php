
// src/pages/Index.tsx
import { Link } from 'react-router-dom'
import backgroundIndex from '../assets/backgroundindex.png'
import logo from '../assets/bookstore-logo-BdxIlNK5.jpg'

export default function Index() {
  return (
    <div
      className="relative min-h-screen bg-center bg-cover px-4 py-8 sm:px-6 sm:py-12"
      style={{ backgroundImage: `url(${backgroundIndex})` }}
      dir="rtl"
    >
      <div className="absolute inset-0 bg-gray-900 bg-opacity-40" />

      <div className="relative z-10 w-full max-w-md mx-auto bg-white bg-opacity-80 border-2 border-white rounded-2xl p-6 sm:p-10 flex flex-col items-center">
        {/*central logo*/}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-full overflow-hidden border-4 border-[hsl(var(--primary))] flex items-center justify-center">
            <img
              src={logo}
              alt="لوگوی سامانه"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        
        <h1 className="text-lg sm:text-2xl font-bold mb-2 text-[hsl(var(--foreground))] text-center">
         به سامانه سالنداری خوش آمدید
        </h1>
        <p className="text-sm sm:text-base mb-6 text-[hsl(var(--foreground))] text-center">
          برای ادامه لطفاً وارد شوید یا ثبت‌نام کنید.
        </p>

        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto text-center rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-[hsl(var(--primary-foreground))] font-medium transition hover:opacity-90"
          >
            ورود
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto text-center rounded-xl border border-[hsl(var(--primary))] px-4 py-2 text-[hsl(var(--primary))] font-medium transition hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]"
          >
            ثبت‌نام
          </Link>
        </div>
      </div>
    </div>
  )
}