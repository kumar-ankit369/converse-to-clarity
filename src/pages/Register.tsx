import { RegisterForm } from "@/components/auth/RegisterForm"
import Navbar from "@/components/Navbar"

export default function Register() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <RegisterForm />
      </div>
    </div>
  )
}


