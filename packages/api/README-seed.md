# Database Seeding

This package contains a seeding script to populate the database with sample data.

## Setup

1. **Create Environment File**

   Create a `.env` file in the `packages/api` directory with your database connection string:

   ```bash
   # packages/api/.env
   POSTGRES_URL="postgresql://username:password@localhost:5432/database_name"
   ```

   **Examples:**

   - Local development with PostgreSQL:
     ```
     POSTGRES_URL="postgresql://postgres:password@localhost:5432/myapp"
     ```
   - Vercel Postgres:
     ```
     POSTGRES_URL="postgresql://username:password@host:port/database"
     ```

2. **Check Environment**

   Verify your environment is set up correctly:

   ```bash
   pnpm seed:check
   ```

3. **Run Seeding**

   Execute the seeding script:

   ```bash
   pnpm seed
   ```

## What Gets Seeded

The script creates:

- 3 sample projects with different priorities and statuses
- Multiple tasks for each project with various types (design, development, testing, etc.)
- Sample data with realistic dates and descriptions

## Troubleshooting

### Missing POSTGRES_URL Error

If you see "Missing POSTGRES_URL environment variable":

1. Make sure you have a `.env` file in the `packages/api` directory
2. Verify the POSTGRES_URL is correctly formatted
3. Check that your database is running and accessible

### Database Connection Issues

- Ensure your PostgreSQL database is running
- Verify the connection string format is correct
- Check that the database exists and is accessible with the provided credentials

## Scripts

- `pnpm seed` - Run the seeding script
- `pnpm seed:check` - Check if environment variables are properly configured
