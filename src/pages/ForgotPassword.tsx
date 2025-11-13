import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"
import Navbar from "@/components/Navbar"

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
