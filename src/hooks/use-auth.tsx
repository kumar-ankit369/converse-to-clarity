import React from "react"
import { apiLogin, apiRegister } from "@/lib/api"

type AuthState = {
  token: string | null
  email: string | null
}

type AuthContextValue = {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>(() => {
    const token = localStorage.getItem("auth:token")
    const email = localStorage.getItem("auth:email")
    return { token, email }
  })

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password)
    localStorage.setItem("auth:token", res.token)
    localStorage.setItem("auth:email", email)
    setState({ token: res.token, email })
  }, [])

  const register = React.useCallback(async (name: string, email: string, password: string) => {
    await apiRegister(name, email, password)
    await login(email, password)
  }, [login])

  const logout = React.useCallback(() => {
    localStorage.removeItem("auth:token")
    localStorage.removeItem("auth:email")
    setState({ token: null, email: null })
  }, [])

  const value = React.useMemo(() => ({ state, login, register, logout }), [state, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}


