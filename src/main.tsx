// src/main.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from 'react-router-dom'
import './index.css'

import Index from './pages/Index'
import Login           from './pages/Login'
import Register        from './pages/Register'     
import Dashboard       from './pages/Dashboard'
import NotFound        from './pages/NotFound'

const router = createBrowserRouter([
  { path: '/',           element: <Index /> },
  { path: '/login',         element: <Login /> },
  { path: '/register',      element: <Register /> },    // ← اضافه یا اصلاح مسیر
  // { path: '/dashboard',     element: <Dashboard /> },
  { path: '*',              element: <NotFound /> },
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
