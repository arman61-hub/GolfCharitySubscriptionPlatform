# 🚀 Deployment Guide

This guide provides step-by-step instructions to deploy your Golf Charity Subscription Platform to production.

## 📋 Pre-Deployment Checklist
1. **GitHub Setup**: Initialize a git repository and push your code.
   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   # Add your remote and push
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push -u origin main
   ```
   > [!IMPORTANT]
   > The root `.gitignore` I added will prevent your sensitive `.env` files from being uploaded.

2. **Environment Variables**: Gather all your keys from Supabase, Stripe, and your backend.

---

## 🛠️ Step 1: Backend Deployment (e.g., Render or Railway)

We recommend using **Render** or **Railway** for the Node.js backend.

1. **Create a Web Service**: Link your GitHub repository.
2. **Root Directory**: Set this to `backend`.
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Environment Variables**: Add the following in the dashboard:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key.
   - `SUPABASE_URL`: Your Supabase project URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key.
   - `FRONTEND_URL`: The URL of your deployed frontend (e.g., `https://your-app.vercel.app`).
   - `PORT`: 5000 (usually handled by the platform).

---

## 💻 Step 2: Frontend Deployment (e.g., Vercel or Netlify)

We recommend using **Vercel** for the React/Vite frontend.

1. **Create a New Project**: Link your GitHub repository.
2. **Framework Preset**: Vite.
3. **Root Directory**: Set this to `frontend`.
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment Variables**: Add the following in the Vercel dashboard:
   - `VITE_SUPABASE_URL`: Your Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key.
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key.
   - `VITE_API_URL`: The URL of your deployed backend (e.g., `https://your-backend.render.com`).

---

## 🗄️ Step 3: Database & Stripe Webhooks

### Supabase
- Ensure your tables match the `database_schema.sql` file.
- If you haven't yet, run the SQL in the Supabase SQL Editor.

### Stripe Webhooks
1. In the Stripe Dashboard, go to **Developers > Webhooks**.
2. Add an endpoint: `https://your-backend.render.com/api/stripe/webhook`
3. Listen for events like `checkout.session.completed`.
4. Copy the **Signing Secret** and add it to your backend environment variables as `STRIPE_WEBHOOK_SECRET`.

---

## ✅ Step 4: Final Verification
1. Access your frontend URL.
2. Try to log in/sign up.
3. Test the subscription flow (using Stripe Test Mode).
4. Verify that scores and charities are loading correctly from Supabase.

---

## 🔒 Security Note
- Never commit your `.env` files.
- Regularly rotate your Stripe and Supabase keys if you suspect they have been leaked.
- Ensure your `FRONTEND_URL` in the backend matches exactly with your Vercel URL to allow CORS requests.
