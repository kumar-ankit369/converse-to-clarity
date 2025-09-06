import Navbar from "@/components/Navbar"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold">Protected Dashboard</h1>
        <p className="text-muted-foreground mt-2">You can only see this if logged in.</p>
      </div>
    </div>
  )
}


