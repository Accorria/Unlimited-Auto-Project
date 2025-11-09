-- Query to check lead source and details
-- Run this in your Supabase SQL editor to track where leads came from

-- Find the specific lead (replace with the vehicle ID from the email)
SELECT 
  id,
  name,
  phone,
  email,
  message,
  source,
  vehicle_id,
  vehicle_interest,
  notes,
  created_at,
  updated_at
FROM leads
WHERE vehicle_id = 'a837b100-af71-47a3-b086-ddfc76b5055d'  -- Replace with actual vehicle ID
  AND message LIKE '%requested a call%'
  AND created_at >= NOW() - INTERVAL '1 hour'  -- Last hour
ORDER BY created_at DESC
LIMIT 10;

-- Or find by message content
SELECT 
  id,
  name,
  phone,
  email,
  message,
  source,
  vehicle_id,
  notes,
  created_at
FROM leads
WHERE message LIKE '%Customer requested a call%'
  AND name = 'Customer'
  AND (phone IS NULL OR phone = '')
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Check all leads from sales_agent_chat source
SELECT 
  id,
  name,
  phone,
  email,
  message,
  source,
  vehicle_id,
  notes,
  created_at
FROM leads
WHERE source = 'sales_agent_chat'
ORDER BY created_at DESC
LIMIT 20;

-- Check messages table for chat conversations
SELECT 
  id,
  channel,
  direction,
  from_address,
  body,
  status,
  created_at
FROM messages
WHERE channel = 'website_chat'
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 20;

