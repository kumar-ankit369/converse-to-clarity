import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

const Navbar = () => {
  const [apiOk, setApiOk] = useState<boolean | null>(null)

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((r) => r.json())
      .then((d) => setApiOk(d?.status === "ok"))
      .catch(() => setApiOk(false))
  }, [])

  const { state, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-semibold">Converse to Clarity</Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <a href="https://github.com/kumar-ankit369/converse-to-clarity" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">GitHub</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className={apiOk ? "text-green-600 text-xs" : apiOk === false ? "text-red-600 text-xs" : "text-muted-foreground text-xs"}>
            {apiOk == null ? "Checking API..." : apiOk ? "API: Online" : "API: Offline"}
          </span>
          {state.token ? (
            <>
              <span className="text-xs text-muted-foreground hidden sm:block">{state.email}</span>
              <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90">
                <Link to="/register">Start Free Trial</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar


