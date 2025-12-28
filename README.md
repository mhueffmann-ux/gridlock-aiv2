# GRIDLOCK AI - Deployment Guide

## Step 1: Download This Project

You should have received a ZIP file called `gridlock-deploy.zip`. 

Unzip it somewhere you'll remember (like your Desktop).

---

## Step 2: Upload to GitHub

1. Go to [github.com](https://github.com) and log in
2. Click the **+** button in the top right → **New repository**
3. Name it: `gridlock-ai`
4. Keep it **Public** (or Private if you prefer)
5. Click **Create repository**

You'll see a page with instructions. Look for **"uploading an existing file"** link and click it.

6. Drag ALL the files from the unzipped folder into the upload area:
   - `api/` folder
   - `src/` folder  
   - `index.html`
   - `package.json`
   - `vercel.json`
   - `vite.config.js`
   
7. Click **Commit changes**

---

## Step 3: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and log in (with GitHub)
2. Click **Add New...** → **Project**
3. Find `gridlock-ai` in your repo list → Click **Import**
4. Leave all settings as default
5. Click **Deploy**

⏳ Wait 1-2 minutes for it to build...

---

## Step 4: Add Your API Key

1. Once deployed, click on your project name
2. Go to **Settings** (top tab)
3. Click **Environment Variables** (left sidebar)
4. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Paste your API key (starts with `sk-ant-...`)
5. Click **Save**

---

## Step 5: Redeploy

After adding the API key, you need to redeploy:

1. Go to **Deployments** tab
2. Click the **...** menu on the most recent deployment
3. Click **Redeploy**
4. Wait 1-2 minutes

---

## Done! 🎉

Your app is now live at: `https://gridlock-ai.vercel.app` (or similar URL)

Share this link with your friend!

---

## Troubleshooting

**"Error: Failed to connect"**
→ Your API key might not be set. Check Step 4.

**"Error: Invalid API key"**  
→ Make sure you copied the full key including `sk-ant-`

**Page is blank**
→ Check the Vercel deployment logs for errors

---

## Updating the App Later

To make changes:
1. Edit files on GitHub directly, or
2. Upload new files to replace old ones

Vercel will automatically redeploy when you change files.
