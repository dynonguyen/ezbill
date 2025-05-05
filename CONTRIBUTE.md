# Self-hosting supabase with Docker

This is a minimal Docker Compose setup for self-hosting Supabase. Follow the steps [here](https://supabase.com/docs/guides/hosting/docker) to get started.

```bash
cp docker
docker compose up -d
```

```bash
# Stop the containers
docker compose -p supabase stop

# Start the containers
docker compose -p supabase start
```

# DB Migration

- Open the supabase studio: http://localhost:8000
- `Paste & Run` SQL from `scripts/migration.sql` to the SQL editor

# Run locally

```bash
cp .env.example .env

# Change the VITE_SUPABASE_URL & VITE_SUPABASE_KEY in .env file

yarn dev
```
