# Royal Matras - Setup Guide

## Environment Variables Setup

### 1. Create `.env.local` file

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

### 2. Supabase Configuration

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important**: Never commit `SUPABASE_SERVICE_ROLE_KEY` to Git!

### 3. Google OAuth Setup (Optional)

If you're using Google Sign-In:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)
6. Copy Client ID and Secret:

```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

### 4. Site URL Configuration

For local development:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production (Netlify/Vercel):
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 5. Rate limiting (Upstash Redis)

Admin and payment-related routes use `rateLimitFromRequest()` ([`src/lib/rate-limit.ts`](src/lib/rate-limit.ts)).

- **Without** `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, the app falls back to an **in-memory** counter inside each Node/serverless instance. That works on a single local process but is **wrong under horizontal scaling**: each Vercel function instance has its own memory, so a client can exceed the global limit by hitting different instances.
- **With Upstash** (free tier available at [upstash.com](https://upstash.com)): create a Redis database, copy **REST URL** and **REST TOKEN** into `.env.local` / hosting env. All instances then share the same counters.

```env
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXX...
```

## Deployment to Netlify

### Environment Variables in Netlify

1. Go to your Netlify project
2. **Site settings** → **Environment variables**
3. Add all variables from `.env.local`:

| Key | Value | Scopes |
|-----|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Builds, Functions, Runtime |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.netlify.app` | All |

### Build Settings

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Database Setup

### Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Seed Data (Optional)

```bash
# Add sample products
npm run seed
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

### "Invalid API key" error
- Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Verify the key hasn't expired

### Google OAuth not working
- Check redirect URIs in Google Console
- Verify `NEXT_PUBLIC_SITE_URL` matches your domain

### Database connection issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check Supabase project is active

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is never exposed to client
- [ ] Environment variables are set in Netlify/Vercel
- [ ] Google OAuth redirect URIs are configured
- [ ] RLS (Row Level Security) policies are enabled in Supabase

## Support

For issues, check:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Netlify Documentation](https://docs.netlify.com)
