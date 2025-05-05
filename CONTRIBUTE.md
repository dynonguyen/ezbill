# Get started

## Self-hosting supabase with Docker

[Supabase docs](https://supabase.com/docs/guides/self-hosting/docker)

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

## Run locally

```bash
cp .env.example .env

# Change the VITE_SUPABASE_URL & VITE_SUPABASE_KEY in .env file

yarn dev
```
