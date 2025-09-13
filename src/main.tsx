import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import Index from './pages/Index'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

const router = createBrowserRouter([
  { path: '/', element: <Index /> },
  { path: '/login', element: <Login /> },
  { path: '*', element: <NotFound /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
