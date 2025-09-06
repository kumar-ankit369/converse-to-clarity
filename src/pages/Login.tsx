import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-md">
        <h1 className="text-2xl font-semibold mb-6">Login</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
          <Input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">Login</Button>
        </form>
      </div>
    </div>
  )
}


