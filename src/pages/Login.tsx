import React from "react";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-accent flex items-center justify-center" dir="rtl">
      <main className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 border-t-8 border-primary">
        {/* لوگو */}
        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-full p-3 shadow-lg">
            <img
              src="/assets/logo_animation.gif"
              alt="کافه کتاب‌فروشی"
              className="w-20 h-20 object-contain"
            />
          </div>
        </div>

        {/* عنوان */}
        <h1 className="text-2xl font-bold text-primary text-center">
          ورود به کافه کتاب‌فروشی
        </h1>
        <p className="text-gray-600 mt-2 text-center">
          برای پیوستن به جمع دوستان کتاب، وارد شوید
        </p>

        {/* فرم */}
        <form className="space-y-4 mt-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-right text-gray-700 mb-1">
              نام کاربری یا ایمیل
            </label>
            <input
              type="text"
              className="w-full border border-border rounded px-3 py-2 focus:outline-none focus:border-secondary"
              placeholder="نام کاربری یا ایمیل"
              required
            />
          </div>

          <div>
            <label className="block text-right text-gray-700 mb-1">
              رمز عبور
            </label>
            <input
              type="password"
              className="w-full border border-border rounded px-3 py-2 focus:outline-none focus:border-secondary"
              placeholder="رمز عبور"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="ml-2" />
              مرا به خاطر بسپار
            </label>
            <a href="#" className="text-secondary hover:underline">
              رمز عبور را فراموش کرده‌اید؟
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-secondary text-primary-foreground py-2 rounded transition-colors"
          >
            ورود
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          حساب کاربری ندارید؟{" "}
          <a href="#" className="text-secondary hover:underline">
            ثبت نام کنید
          </a>
        </p>

        <footer className="text-center text-gray-400 mt-6 text-xs">
          © ۲۰۲۵ کافه کتاب‌فروشی
        </footer>
      </main>
    </div>
  );
};

export default Login;
