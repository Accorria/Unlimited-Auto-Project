# 🧹 SQL Files Cleanup Plan

## Current Status
- **Project SQL Files**: 10 (cleaned from 12)
- **Supabase Private Queries**: 10
- **Duplicates Removed**: 2

## 📁 Project SQL Files (KEEP THESE)

### Core Schema Files
1. **`working-dealership-schema.sql`** - Main database schema
2. **`accorria-performance-schema.sql`** - Performance analytics schema

### Fix Scripts (Run as needed)
3. **`fix-angle-column.sql`** - ⭐ **NEW** - Fixes photo upload issue
4. **`fix-vehicles-permissions.sql`** - Fixes vehicle table permissions
5. **`fix-database-policies.sql`** - Fixes recursive policy issues

### Utility Scripts
6. **`disable-all-rls.sql`** - Disables Row Level Security
7. **`check-policies.sql`** - Inspects RLS policies
8. **`check-rls-status.sql`** - Health check for all tables
9. **`test-dealer-lookup.sql`** - Verifies dealer data
10. **`complete-fix.sql`** - Complete permissions restoration

## 🗑️ Supabase Cleanup Recommendations

### DELETE These Supabase Queries (Duplicates):
- Any query that matches the project files above
- Old versions of the same fixes
- Test queries that are no longer needed

### KEEP These Supabase Queries:
- **Dealership Management Schema** (matches `working-dealership-schema.sql`)
- **Performance Analytics Schema** (matches `accorria-performance-schema.sql`)
- **Disable Row-Level Security for App Tables** (matches `disable-all-rls.sql`)

### ADD to Supabase:
- **`fix-angle-column.sql`** - Your new photo upload fix

## 🎯 Next Steps

1. **Run the new fix**: `fix-angle-column.sql` in Supabase
2. **Delete duplicate queries** in Supabase editor
3. **Keep only essential queries** (5-6 max)
4. **Use project files as source of truth**

## 📋 Supabase Query Organization

### Recommended Supabase Structure:
```
PRIVATE (6 queries max):
├── Dealership Management Schema
├── Performance Analytics Schema  
├── Fix Photo Upload (NEW)
├── Disable RLS (Emergency)
├── Health Check
└── Complete Permissions Fix
```

## ✅ Benefits of Cleanup
- No confusion about which script to run
- Project files are source of truth
- Supabase only has essential queries
- Easy to maintain and update
