# Netlify + Supabase Google OAuth Checklist

## 1. Supabase Settings

### Authentication → URL Configuration
Go to: https://app.supabase.com/project/peihzxieybpsmocidwfa/auth/url-configuration

**Site URL:**
```
https://statuesque-rabanadas-82127c.netlify.app
```

**Redirect URLs (add both):**
```
https://statuesque-rabanadas-82127c.netlify.app/auth/callback
http://localhost:3000/auth/callback
```

### Authentication → Providers → Google
Go to: https://app.supabase.com/project/peihzxieybpsmocidwfa/auth/providers

**Enable Google provider:**
- ✅ Google enabled
- Add Client ID from Google Cloud Console
- Add Client Secret from Google Cloud Console

## 2. Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

**OAuth 2.0 Client IDs → Your Client → Authorized redirect URIs:**

Add these URLs:
```
https://peihzxieybpsmocidwfa.supabase.co/auth/v1/callback
https://statuesque-rabanadas-82127c.netlify.app/auth/callback
http://localhost:3000/auth/callback
```

**Important:** The first URL is Supabase's callback, not your app's!

## 3. Netlify Environment Variables

Go to: https://app.netlify.com/sites/statuesque-rabanadas-82127c/settings/env

Add these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://peihzxieybpsmocidwfa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlaWh6eGlleWJwc21vY2lkd2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODQwODksImV4cCI6MjA4OTI2MDA4OX0.KTVw8fpj0XI0ilx7YNOJxrRs7NenySnqhqyMpTvYUGs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlaWh6eGlleWJwc21vY2lkd2ZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4NDA4OSwiZXhwIjoyMDg5MjYwMDg5fQ.WoVnl_TuVM2i9hFMtp9WUu7D4-7TdDxeJ5bRwC8nRJ4
NEXT_PUBLIC_SITE_URL=https://statuesque-rabanadas-82127c.netlify.app
```

**After adding:** Trigger a new deploy!

## 4. Testing Steps

1. **Deploy to Netlify:**
   ```bash
   git add .
   git commit -m "Fix Google OAuth for Netlify"
   git push
   ```

2. **Wait for deploy to complete**

3. **Test on production:**
   - Go to: https://statuesque-rabanadas-82127c.netlify.app/auth/signin
   - Open browser console (F12)
   - Click sign in
   - Check console logs for debug info
   - Should redirect to Google

4. **If stuck on loading:**
   - Check browser console for errors
   - Look at the debug info on the page
   - Check Netlify function logs

## 5. Common Issues

### Issue: "No auth URL returned"
**Solution:** Google provider not enabled in Supabase or missing credentials

### Issue: "Invalid redirect URI"
**Solution:** Add Supabase callback URL to Google Cloud Console:
`https://peihzxieybpsmocidwfa.supabase.co/auth/v1/callback`

### Issue: Infinite loading
**Solution:** Check browser console and debug info on page

### Issue: "Unauthorized client"
**Solution:** Google OAuth consent screen not configured or app not published

## 6. Netlify-Specific Configuration

### netlify.toml (if needed)
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"
```

## 7. Debug Commands

**Check Netlify logs:**
```bash
netlify logs
```

**Test locally with Netlify CLI:**
```bash
netlify dev
```

**Check environment variables:**
```bash
netlify env:list
```
