# Supabase Setup Guide

Follow these steps to set up your Supabase backend for the portfolio CMS.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free tier is perfect for this)
3. Create a new project:
   - **Name**: `portfolio-cms` (or any name you prefer)
   - **Database Password**: Choose a strong password (save it somewhere safe!)
   - **Region**: Choose the closest region to you
   - Click "Create new project" and wait 1-2 minutes for setup

## Step 2: Run the Database Schema

1. In your Supabase project dashboard, click on the **SQL Editor** icon in the left sidebar
2. Click "New query"
3. Copy the entire contents of `supabase/schema.sql` from your project
4. Paste it into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - this means your tables and policies are created!

## Step 3: Get Your API Credentials

1. In Supabase, click on the **Settings** icon (gear) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 4: Configure Your Environment Variables

1. In your project root, create a file named `.env` (copy from `.env.example`)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **IMPORTANT**: Never commit `.env` to git! It's already in `.gitignore`.

## Step 5: Create Your Admin Account

1. In Supabase dashboard, go to **Authentication** > **Users**
2. Click "Add user" > "Create new user"
3. Enter your email and password (this will be your admin login)
4. Click "Create user"
5. You can now log in at `/admin/login` with these credentials!

## Step 6: Test Everything

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Test the following:
   - **Contact Form**: Go to `http://localhost:5173`, scroll to contact, submit a message
   - **Admin Login**: Go to `http://localhost:5173/admin/login` and sign in
   - **Create Article**: In admin dashboard, click "New Article", create and publish
   - **View Article**: Go to `/articles` to see your published article

## Deployment

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. **Import Your Repository to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign up/login (use your GitHub account)
   - Click "Add New..." → "Project"
   - Click "Import" next to your `final-portfolio` repository
   - Vercel will auto-detect it's a Vite project ✅

3. **Configure Environment Variables**:
   - Before clicking "Deploy", scroll down to "Environment Variables"
   - Add your first variable:
     - **Name**: `VITE_SUPABASE_URL`
     - **Value**: (paste your Supabase URL from `.env`)
   - Click "Add" to add another:
     - **Name**: `VITE_SUPABASE_ANON_KEY`
     - **Value**: (paste your Supabase anon key from `.env`)
   - ⚠️ **Important**: Make sure the variable names match exactly (including `VITE_` prefix)

4. **Deploy**:
   - Click "Deploy" button
   - Wait 1-2 minutes for build to complete
   - You'll get a live URL like `https://your-portfolio.vercel.app` 🎉
   - Every time you push to GitHub, Vercel will auto-deploy!

### Option 2: Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and import your repository
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in Netlify dashboard
6. Deploy!

## Troubleshooting

**"Failed to fetch" errors**: Make sure your `.env` file has the correct Supabase URL and key.

**Can't log in**: Make sure you created a user in Supabase Authentication panel.

**Articles not showing**: Check that Row Level Security policies are set up correctly (they should be if you ran the schema.sql).

**Contact form not saving**: Check browser console for errors and verify Supabase credentials.
