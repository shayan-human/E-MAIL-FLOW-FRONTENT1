#!/bin/bash
# Script to run raw SQL using InsForge MCP

API_KEY="ik_bc9f26b7c1a135d6f8d386fc73783018"
API_BASE_URL="https://4njfm5n4.us-east.insforge.app"

# Create drafts table
SQL='CREATE TABLE IF NOT EXISTS drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    subject TEXT DEFAULT '"'"''"'"',
    body TEXT DEFAULT '"'"''"'"',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);'

echo "Creating drafts table..."
echo "$SQL"

# Try using the InsForge REST API directly
curl -s -X POST "$API_BASE_URL/rawsql" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$SQL\"}" || echo "Direct API failed"

echo ""
echo "Done"
