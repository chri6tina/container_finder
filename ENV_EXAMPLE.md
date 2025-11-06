# Env Example

Create a file named `.env` (or `.env.local`) in the project root with:

```
DATABASE_URL="file:./dev.db" # local dev (SQLite)
NEXT_PUBLIC_SITE_NAME="Container Finder"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_CONTACT_EMAIL="hello@your-domain.com"
NEXT_PUBLIC_AMAZON_PARTNER_TAG="yourtag-20" # used to build affiliate URLs from ASIN
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY" # server-side only
ADMIN_SECRET="set-a-random-long-secret" # for admin API access (header: x-admin-secret)
HEALTH_SECRET="set-another-secret"      # to access detailed /api/health in production
```

For production (Supabase Postgres), set `DATABASE_URL` to your Supabase Postgres connection string, e.g.:

```
DATABASE_URL="postgresql://postgres:YOUR_DB_PASSWORD@aws-xxx-xxx-xxx-xxx.compute-1.amazonaws.com:5432/postgres"
```

Note: Keep the service role key strictly on the server (never expose to the client).


