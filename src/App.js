import logo from './logo.svg'
import './App.css'
import { Register } from './pages/register'
import { Login } from './pages/login'
import Home from './pages/home'
import Uplaod from './pages/upload'
import Upload2 from './pages/upload2'
import Initial from './pages/initial'
import Edit from './pages/edit_profile'
import { AuthProvider } from './Auth'
import PrivateRoutes from './PrivateRoute'
import { useEffect } from 'react'
import { onAuthStateChanged, setCurrentUser } from 'firebase/auth'

import { BrowserRouter, Routes, Route, Switch } from 'react-router-dom'
import ChangePassword from './pages/reset_password'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Initial />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route element={<PrivateRoutes />}>
            <Route element={<Register />} path='/register'></Route>
          </Route>
          <Route element={<PrivateRoutes />}>
            <Route element={<Upload2 />} path='/home/hotel/:email'></Route>
          </Route>
          <Route element={<PrivateRoutes />}>
            <Route element={<Home />} path='/home/ngo/:email'></Route>
          </Route>
          <Route element={<PrivateRoutes />}>
            <Route element={<Edit />} path='/edit/:email'></Route>
          </Route>
          <Route element={<PrivateRoutes />}>
            <Route
              element={<ChangePassword />}
              path='/changepassword/:email'
            ></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
