import { LoginForm } from "@/components/auth/LoginForm"
import Navbar from "@/components/Navbar"

export default function Login() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <LoginForm />
      </div>
    </div>
  )
}


