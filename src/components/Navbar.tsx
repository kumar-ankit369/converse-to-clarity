import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { logout } from "@/store/slices/authSlice"

const Navbar = () => {
  const [apiOk, setApiOk] = useState<boolean | null>(null)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((r) => r.json())
      .then((d) => setApiOk(d?.status === "ok"))
      .catch(() => setApiOk(false))
  }, [])

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const user = useAppSelector((state) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-semibold">Converse to Clarity</Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
                <Link to="/projects" className="hover:text-foreground">Projects</Link>
                <Link to="/teams" className="hover:text-foreground">Teams</Link>
                <Link to="/chat" className="hover:text-foreground">Chat</Link>
              </>
            )}
            <a href="https://github.com/kumar-ankit369/converse-to-clarity" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">GitHub</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className={apiOk ? "text-green-600 text-xs" : apiOk === false ? "text-red-600 text-xs" : "text-muted-foreground text-xs"}>
            {apiOk == null ? "Checking API..." : apiOk ? "API: Online" : "API: Offline"}
          </span>
          {isAuthenticated ? (
            <>
              <span className="text-xs text-muted-foreground hidden sm:block">Hello, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90">
                <Link to="/register">Sign Up</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Login</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar


