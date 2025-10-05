export type LoginResponse = { message: string; token: string }

const base = "http://localhost:5000"

export async function apiHealth(): Promise<{ status: string }> {
  const res = await fetch(`${base}/api/health`)
  if (!res.ok) throw new Error(`Health failed: ${res.status}`)
  return res.json()
}

export async function apiRegister(name: string, email: string, password: string): Promise<{ message: string }> {
  const res = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}


