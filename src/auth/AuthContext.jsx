"use client"

import { createContext, useContext, useState } from 'react'
import { api } from '../lib/api'

const AuthCtx = createContext(null)

export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children, initialApplicant }) {
  const [applicant, setApplicant] = useState(initialApplicant ?? null)

  const login = async (c) => {
    const r = await api.loginApplicant(c)
    setApplicant(r.applicant)
    return r
  }
  const register = async (p) => {
    const r = await api.registerApplicant(p)
    setApplicant(r.applicant)
    return r
  }
  const claim = async (p) => {
    const r = await api.claimApplicant(p)
    setApplicant(r.applicant)
    return r
  }
  const logout = async () => {
    await api.logoutApplicant()
    setApplicant(null)
  }
  const refresh = async () => {
    const r = await api.me()
    setApplicant(r.data)
    return r.data
  }

  return (
    <AuthCtx.Provider
      value={{
        applicant,
        isAuthenticated: !!applicant,
        login,
        register,
        claim,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthCtx.Provider>
  )
}
