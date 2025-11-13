# Clerk Authentication Integration Guide

## 🎉 Clerk Setup Complete!

Your application now supports **Clerk authentication** - a modern, secure authentication solution with built-in user management, social logins, and more!

---

## 📋 Setup Steps

### 1. Get Your Clerk API Keys

1. Go to [https://clerk.com](https://clerk.com) and sign up/login
2. Create a new application
3. Go to **API Keys** in your dashboard
4. Copy your **Publishable Key**

### 2. Configure Environment Variables

Update your `.env` file with your Clerk key:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 3. Choose Authentication Method

In `src/AppWithClerk.tsx`, you can toggle between:
- **Clerk Auth** (recommended): Set `useClerkAuth = true`
- **Legacy Auth**: Set `useClerkAuth = false`

---

## 🚀 Features

### What You Get with Clerk

✅ **Pre-built UI Components**
- Beautiful sign-in/sign-up forms
- User profile management
- Password reset flows
- Email verification
- Multi-factor authentication (2FA)

✅ **Social Authentication**
- Google
- GitHub
- Microsoft
- Facebook
- And many more...

✅ **User Management**
- User profiles
- Session management
- Role-based access control
- Organization support

✅ **Security**
- Automatic HTTPS enforcement
- Token rotation
- Session management
- Brute force protection

---

## 📁 New Files Created

```
src/
├── components/
│   ├── ClerkNavbar.tsx          # Navbar with Clerk UserButton
│   └── ClerkProtectedRoute.tsx  # Route protection with Clerk
├── pages/
│   ├── ClerkLogin.tsx           # Clerk sign-in page
│   └── ClerkRegister.tsx        # Clerk sign-up page
├── AppWithClerk.tsx             # App with Clerk routing
└── main.tsx (updated)           # ClerkProvider wrapper
```

---

## 🎨 Usage Examples

### Using Clerk Hooks

```typescript
import { useUser, useAuth } from '@clerk/clerk-react'

function MyComponent() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useAuth()

  if (!isLoaded) return <div>Loading...</div>
  if (!isSignedIn) return <div>Please sign in</div>

  return (
    <div>
      <p>Hello, {user.firstName}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

### Conditional Rendering

```typescript
import { SignedIn, SignedOut } from '@clerk/clerk-react'

function Navigation() {
  return (
    <nav>
      <SignedIn>
        <Link to="/dashboard">Dashboard</Link>
      </SignedIn>
      <SignedOut>
        <Link to="/login">Sign In</Link>
      </SignedOut>
    </nav>
  )
}
```

### Getting User Data

```typescript
import { useUser } from '@clerk/clerk-react'

function Profile() {
  const { user } = useUser()

  return (
    <div>
      <h1>{user?.fullName}</h1>
      <p>{user?.primaryEmailAddress?.emailAddress}</p>
      <img src={user?.imageUrl} alt="Profile" />
    </div>
  )
}
```

---

## 🔧 Customization

### Styling Clerk Components

Clerk components are fully customizable. Example in `ClerkLogin.tsx`:

```typescript
<SignIn 
  appearance={{
    elements: {
      formButtonPrimary: 'bg-primary hover:bg-primary/90',
      card: 'shadow-lg',
      headerTitle: 'text-2xl font-bold',
    }
  }}
/>
```

### Available Appearance Options

```typescript
{
  layout: {
    socialButtonsPlacement: 'bottom',
    socialButtonsVariant: 'blockButton',
  },
  variables: {
    colorPrimary: '#your-color',
    borderRadius: '8px',
  },
  elements: {
    card: 'shadow-xl rounded-lg',
    formButtonPrimary: 'custom-button-class',
    footerActionLink: 'text-primary hover:underline',
  }
}
```

---

## 🌐 Social Authentication Setup

### Enable Social Providers

1. Go to Clerk Dashboard → **Social Connections**
2. Enable providers (Google, GitHub, etc.)
3. Follow provider-specific setup instructions
4. Social buttons will automatically appear in your forms!

---

## 🔒 Protected Routes

### Using ClerkProtectedRoute

```typescript
import { ClerkProtectedRoute } from '@/components/ClerkProtectedRoute'

<Route 
  path="/dashboard" 
  element={
    <ClerkProtectedRoute>
      <Dashboard />
    </ClerkProtectedRoute>
  } 
/>
```

### Redirecting After Sign-In

```typescript
<SignIn 
  afterSignInUrl="/dashboard"
  redirectUrl="/onboarding"
/>
```

---

## 📊 User Metadata

### Custom User Data

```typescript
import { useUser } from '@clerk/clerk-react'

function UpdateProfile() {
  const { user } = useUser()

  const updateMetadata = async () => {
    await user?.update({
      publicMetadata: {
        role: 'admin',
        preferences: { theme: 'dark' }
      }
    })
  }

  return <button onClick={updateMetadata}>Update</button>
}
```

---

## 🎯 Migration from Legacy Auth

If you're migrating from the legacy auth system:

### 1. Update API Calls

Replace custom JWT handling with Clerk's `getToken()`:

```typescript
import { useAuth } from '@clerk/clerk-react'

function MyComponent() {
  const { getToken } = useAuth()

  const fetchData = async () => {
    const token = await getToken()
    const response = await fetch('/api/data', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }
}
```

### 2. Update Redux Store

You can still use Redux for app state, while Clerk manages auth:

```typescript
// No need for authSlice with Clerk
// Clerk handles all authentication state
```

### 3. Backend Integration

Update your backend to verify Clerk tokens:

```javascript
// Express.js example
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node')

app.get('/api/protected', 
  ClerkExpressRequireAuth(),
  (req, res) => {
    res.json({ userId: req.auth.userId })
  }
)
```

---

## 🔄 Switching Between Auth Systems

In `AppWithClerk.tsx`:

```typescript
// Use Clerk (recommended)
const useClerkAuth = true

// Use Legacy Auth
const useClerkAuth = false
```

This allows you to test both systems without changing code!

---

## 📚 Additional Features

### Organizations (Teams)

```typescript
import { useOrganization } from '@clerk/clerk-react'

function TeamDashboard() {
  const { organization } = useOrganization()
  
  return <h1>{organization?.name}</h1>
}
```

### Webhooks

Set up webhooks in Clerk Dashboard to sync user events to your database:
- `user.created`
- `user.updated`
- `session.created`
- And more...

### Multi-Factor Authentication

Enable 2FA in Clerk Dashboard:
1. Go to **User & Authentication** → **Multi-factor**
2. Toggle on **SMS** or **Authenticator app**
3. Users can enable 2FA from their profile

---

## 🐛 Troubleshooting

### Issue: "Missing Publishable Key"

**Solution:** Add your Clerk key to `.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Issue: Social login not working

**Solution:** 
1. Enable provider in Clerk Dashboard
2. Configure OAuth credentials
3. Add redirect URLs

### Issue: Styling doesn't match

**Solution:** Use the `appearance` prop to customize Clerk components to match your theme

---

## 🎨 Example: Complete Authentication Flow

```typescript
import { SignIn, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { ClerkProtectedRoute } from '@/components/ClerkProtectedRoute'

// Login Page
function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn 
        routing="path"
        path="/login"
        signUpUrl="/register"
        afterSignInUrl="/dashboard"
      />
    </div>
  )
}

// Protected Dashboard
function Dashboard() {
  return (
    <ClerkProtectedRoute>
      <div>
        <nav>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
        <h1>Dashboard</h1>
      </div>
    </ClerkProtectedRoute>
  )
}
```

---

## 📖 Resources

- **Clerk Docs:** https://clerk.com/docs
- **React SDK:** https://clerk.com/docs/references/react/overview
- **Components:** https://clerk.com/docs/components/overview
- **Customization:** https://clerk.com/docs/components/customization/overview

---

## ✅ Next Steps

1. **Get your Clerk API key** from dashboard
2. **Add it to `.env`** file
3. **Restart your dev server**
4. **Visit `/login`** to see Clerk in action!
5. **Enable social auth** in Clerk Dashboard
6. **Customize appearance** to match your brand

---

**Status: Clerk Integration Complete! 🎉**

You now have enterprise-grade authentication with minimal code!
