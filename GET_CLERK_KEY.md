# 🔑 How to Get Your Clerk API Key

## Step-by-Step Guide

### 1. Go to Clerk Dashboard
Visit: https://dashboard.clerk.com/

### 2. Sign Up / Login
- Create a free account if you don't have one
- Or login with your existing account

### 3. Create an Application
- Click **"+ Create application"**
- Give it a name (e.g., "Converse to Clarity")
- Choose your authentication options:
  - ✅ Email
  - ✅ Google (optional)
  - ✅ GitHub (optional)
- Click **"Create application"**

### 4. Get Your Publishable Key
After creating the app, you'll see your API keys:
- Look for **"Publishable key"**
- It will start with `pk_test_` (for development)
- Click the **copy icon** to copy it

### 5. Add to Your Project
1. Open your `.env` file in the project root
2. Replace this line:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_replace_with_your_actual_clerk_key_from_dashboard
   ```
   
   With your actual key:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_abc123...your_actual_key
   ```

3. Save the file

### 6. Restart Your Server
Stop and restart your development server:
```bash
# Press Ctrl+C to stop
# Then run:
npm run dev
```

## 🎉 That's It!

Your Clerk authentication will now work with:
- ✅ Email/Password login
- ✅ Social authentication (if enabled)
- ✅ User management
- ✅ Session handling
- ✅ Security features

## 📝 Example Key Format

Your key should look like this:
```
pk_test_YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkwYWJjZGVm
```

- Starts with `pk_test_` (test environment)
- Or `pk_live_` (production environment)
- Followed by a long random string

## ⚠️ Important Notes

- **Never commit your .env file** to version control
- The `.env` file should be in your `.gitignore`
- Use `pk_test_` keys for development
- Use `pk_live_` keys for production only

## 🔗 Useful Links

- Clerk Dashboard: https://dashboard.clerk.com/
- Clerk Docs: https://clerk.com/docs
- API Keys Guide: https://clerk.com/docs/deployments/api-keys

## 💡 Need Help?

If you don't have a Clerk account or need assistance:
1. Go to https://clerk.com
2. Click "Sign Up" (it's free!)
3. Follow the setup wizard
4. Get your key from the dashboard

---

**Once you add your key, your app will have enterprise-grade authentication! 🚀**
