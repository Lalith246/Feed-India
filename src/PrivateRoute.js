import React, { useContext } from 'react'
import { Route, Navigate, Routes, Outlet } from 'react-router-dom'
import { AuthContext } from './Auth'

const PrivateRoutes = ({ component: RouteComponent, ...rest }) => {
  const { currentUser } = useContext(AuthContext)
  return currentUser ? <Outlet /> : <Navigate to='/login' />
}

export default PrivateRoutes
