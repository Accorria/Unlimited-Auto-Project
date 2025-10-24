#!/bin/bash

# Supabase CLI Setup Script for Unlimited Auto Project
echo "🚀 Setting up Supabase CLI for Unlimited Auto Project"
echo "=================================================="

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI is installed: $(supabase --version)"

# Step 1: Login (interactive)
echo ""
echo "🔐 Step 1: Login to Supabase"
echo "This will open a browser window for authentication..."
echo "Press Enter when ready to continue..."
read

supabase login

# Step 2: List projects
echo ""
echo "📋 Step 2: Available Projects"
echo "Here are your Supabase projects:"
supabase projects list

# Step 3: Get project reference
echo ""
echo "🔗 Step 3: Link Your Project"
echo "Enter your project reference ID (from the list above):"
read PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Project reference is required"
    exit 1
fi

# Step 4: Link the project
echo "Linking project: $PROJECT_REF"
supabase link --project-ref $PROJECT_REF

# Step 5: Initialize (if not already done)
if [ ! -f "supabase/config.toml" ]; then
    echo ""
    echo "🔧 Step 4: Initialize Supabase in project"
    supabase init
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Run your SQL scripts: supabase db push"
echo "2. Start local development: supabase start"
echo "3. View your database: supabase db diff"
echo ""
echo "📚 Useful commands:"
echo "- supabase status          # Check connection"
echo "- supabase db diff         # See database changes"
echo "- supabase db push         # Apply local changes to remote"
echo "- supabase db pull         # Pull remote changes to local"
