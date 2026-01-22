# Vercel Deployment - Quick Start

## 🚀 5-Minute Deployment

### Step 1: Push Frontend to GitHub

```bash
cd frontend-nextjs
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your repository
4. Select **Root Directory:** `frontend-nextjs` (if monorepo)
5. Click **"Deploy"** (we'll add env vars after)

### Step 3: Add Environment Variables

In Vercel → Your Project → **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_API_URL = https://gitguide-api-qonfz7xtjq-uc.a.run.app
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_xxxxxxxxxxxxx
CLERK_SECRET_KEY = sk_live_xxxxxxxxxxxxx
```

**Important:**

- Get Clerk keys from [Clerk Dashboard](https://dashboard.clerk.com) → API Keys
- Use **Production** keys (pk*live*... and sk*live*...)
- Select **Production** environment when adding

### Step 4: Redeploy

After adding env vars, go to **Deployments** → Click **"..."** on latest → **Redeploy**

### Step 5: Configure Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. **Configure** → **Domains** → Add your Vercel URL: `https://your-app.vercel.app`

### Step 6: Test

Visit your Vercel URL and test:

- ✅ Sign in/Sign up works
- ✅ Dashboard loads
- ✅ Can create projects
- ✅ API calls succeed

---

## 🔧 Current Backend URLs

- **API:** `https://gitguide-api-qonfz7xtjq-uc.a.run.app`
- **Roadmap:** `https://gitguide-roadmap-qonfz7xtjq-uc.a.run.app`
- **Workspace VM:** `http://35.222.130.245:8080`

---

## ⚠️ Important Notes

1. **CORS:** Your backend currently allows all origins (`*`). This works but consider restricting to your Vercel domain for production.

2. **Clerk Keys:** Make sure you're using **production** keys, not test keys.

3. **Environment Variables:** All `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secrets there.

---

## 🐛 Troubleshooting

**CORS Error?**

- Backend allows all origins, so this shouldn't happen
- Check `NEXT_PUBLIC_API_URL` is correct

**Auth Not Working?**

- Verify Clerk keys are production keys
- Check Clerk dashboard has Vercel domain added

**API Calls Failing?**

- Check `NEXT_PUBLIC_API_URL` points to Cloud Run
- Test API directly: `curl https://gitguide-api-qonfz7xtjq-uc.a.run.app/api/health`

---

## 📚 Full Guide

See `VERCEL_DEPLOYMENT.md` for detailed instructions.
