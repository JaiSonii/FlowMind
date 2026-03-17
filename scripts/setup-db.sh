#!/bin/bash
# FlowMind Database Setup Script

echo "Setting up FlowMind database..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push the schema to the database
echo "Pushing schema to database..."
npx prisma db push --skip-generate

echo "Database setup complete!"
