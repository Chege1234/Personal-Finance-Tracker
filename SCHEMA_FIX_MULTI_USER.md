# Database Schema Fix - Multi-User Budget Constraint

## Problem Description

### The Error
```
duplicate key value violates unique constraint "budgets_month_year_key"
```

### Root Cause
The budgets table had a **global unique constraint** on `(month, year)` that prevented multiple users from creating budgets for the same month and year. This constraint was designed for a single-user application but broke multi-user functionality.

### Impact
- **User A** creates a budget for February 2026 ✅
- **User B** tries to create a budget for February 2026 ❌
- Error: "duplicate key value violates unique constraint"
- **Result**: Only one user in the entire system could have a budget for any given month/year

## Solution Implemented

### Database Migration Applied

```sql
-- Drop the existing global unique constraint
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_month_year_key;

-- Create a new user-specific unique constraint
ALTER TABLE budgets ADD CONSTRAINT budgets_user_month_year_key 
  UNIQUE (user_id, month, year);
```

### What Changed

#### Before Fix
```sql
-- Old constraint (WRONG for multi-user)
UNIQUE (month, year)
```
- Only ONE budget allowed per month/year **globally**
- User A creates budget for Feb 2026 → OK
- User B creates budget for Feb 2026 → ERROR

#### After Fix
```sql
-- New constraint (CORRECT for multi-user)
UNIQUE (user_id, month, year)
```
- Each user can have ONE budget per month/year
- User A creates budget for Feb 2026 → OK
- User B creates budget for Feb 2026 → OK ✅
- User A tries to create another budget for Feb 2026 → ERROR (as expected)

## How It Works

### Constraint Logic

The new constraint `budgets_user_month_year_key` ensures:

1. **Per-User Uniqueness**: Each user can only have one budget per month/year
2. **Multi-User Support**: Different users can have budgets for the same month/year
3. **Data Integrity**: Prevents duplicate budgets for the same user/period

### Examples

#### Scenario 1: Different Users, Same Period ✅
```sql
-- User A (uuid: aaa-111)
INSERT INTO budgets (user_id, month, year, monthly_amount, ...)
VALUES ('aaa-111', 2, 2026, 5000, ...);
-- Result: SUCCESS ✅

-- User B (uuid: bbb-222)
INSERT INTO budgets (user_id, month, year, monthly_amount, ...)
VALUES ('bbb-222', 2, 2026, 3000, ...);
-- Result: SUCCESS ✅ (Different user_id)
```

#### Scenario 2: Same User, Same Period ❌
```sql
-- User A (uuid: aaa-111)
INSERT INTO budgets (user_id, month, year, monthly_amount, ...)
VALUES ('aaa-111', 2, 2026, 5000, ...);
-- Result: SUCCESS ✅

-- User A tries to create another budget for same period
INSERT INTO budgets (user_id, month, year, monthly_amount, ...)
VALUES ('aaa-111', 2, 2026, 6000, ...);
-- Result: ERROR ❌ "duplicate key value violates unique constraint budgets_user_month_year_key"
```

#### Scenario 3: Same User, Different Period ✅
```sql
-- User A (uuid: aaa-111)
INSERT INTO budgets (user_id, month, year, monthly_amount, ...)
VALUES ('aaa-111', 2, 2026, 5000, ...);
-- Result: SUCCESS ✅

-- User A creates budget for different month
INSERT INTO budgets (user_id, month, year, monthly_amount, ...)
VALUES ('aaa-111', 3, 2026, 5000, ...);
-- Result: SUCCESS ✅ (Different month)
```

## Verification

### Check Current Constraints
```sql
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
WHERE conrelid = 'public.budgets'::regclass
  AND contype = 'u';
```

**Expected Result:**
```
constraint_name              | constraint_definition
-----------------------------|----------------------------------
budgets_user_month_year_key  | UNIQUE (user_id, month, year)
```

### Test Multi-User Budget Creation
```sql
-- Simulate two users creating budgets for the same month
-- (Replace with actual user UUIDs from your profiles table)

-- User 1
INSERT INTO budgets (user_id, month, year, monthly_amount, currency, days_in_month, daily_budget, start_date)
VALUES (
  (SELECT id FROM profiles LIMIT 1 OFFSET 0),
  2, 2026, 5000, 'USD', 28, 178.57, '2026-02-06'
);

-- User 2 (different user, same month/year)
INSERT INTO budgets (user_id, month, year, monthly_amount, currency, days_in_month, daily_budget, start_date)
VALUES (
  (SELECT id FROM profiles LIMIT 1 OFFSET 1),
  2, 2026, 3000, 'KSH', 28, 107.14, '2026-02-06'
);

-- Both should succeed ✅
```

## Testing Instructions

### Test 1: Multiple Users, Same Month/Year

1. **Create User A Account**
   - Email: `usera@example.com`
   - Password: `password123`

2. **Login as User A**
   - Create budget for February 2026: 5000 USD
   - ✅ Should succeed

3. **Logout**

4. **Create User B Account**
   - Email: `userb@example.com`
   - Password: `password123`

5. **Login as User B**
   - Create budget for February 2026: 3000 KSH
   - ✅ Should succeed (no duplicate key error)

6. **Verify**
   - User A sees: 5000 USD budget
   - User B sees: 3000 KSH budget
   - No errors

### Test 2: Same User, Duplicate Period

1. **Login as User A**
2. **Create budget for February 2026**
   - ✅ Should succeed
3. **Try to create another budget for February 2026**
   - ❌ Should fail with: "duplicate key value violates unique constraint budgets_user_month_year_key"
   - This is expected behavior

### Test 3: Same User, Different Periods

1. **Login as User A**
2. **Create budget for February 2026**
   - ✅ Should succeed
3. **Create budget for March 2026**
   - ✅ Should succeed
4. **Verify**
   - User A has two budgets (Feb and Mar)
   - No errors

## Impact on Application

### What Changed for Users

#### Before Fix
- Only the first user to create a budget for a month could succeed
- All other users got errors
- Multi-user functionality was broken

#### After Fix
- ✅ All users can create budgets for any month/year
- ✅ Each user is limited to one budget per month/year
- ✅ Complete data isolation between users
- ✅ Multi-user functionality works correctly

### What Stayed the Same

- Users still cannot create duplicate budgets for the same period
- All RLS policies remain unchanged
- API code remains unchanged
- Frontend code remains unchanged
- User experience remains the same (except errors are gone)

## Database Schema Summary

### Budgets Table Constraints

```sql
-- Primary Key
budgets_pkey: PRIMARY KEY (id)

-- Foreign Key
budgets_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE

-- Unique Constraint (FIXED)
budgets_user_month_year_key: UNIQUE (user_id, month, year)
```

### Column Structure
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  monthly_amount NUMERIC NOT NULL,
  currency VARCHAR NOT NULL DEFAULT 'USD',
  days_in_month INTEGER NOT NULL,
  daily_budget NUMERIC NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Unique constraint: one budget per user per month/year
  CONSTRAINT budgets_user_month_year_key UNIQUE (user_id, month, year)
);
```

## Error Handling

### Before Fix
```javascript
// User B tries to create budget for Feb 2026 (User A already has one)
Error: duplicate key value violates unique constraint "budgets_month_year_key"
Detail: Key (month, year)=(2, 2026) already exists.
```

### After Fix
```javascript
// User B creates budget for Feb 2026 (User A already has one)
Success: Budget created ✅

// User B tries to create another budget for Feb 2026
Error: duplicate key value violates unique constraint "budgets_user_month_year_key"
Detail: Key (user_id, month, year)=(uuid-b, 2, 2026) already exists.
```

The error message now correctly indicates it's a per-user constraint.

## Migration Safety

### Safe to Apply
- ✅ Non-destructive migration
- ✅ No data loss
- ✅ Existing budgets remain intact
- ✅ Only constraint definition changes

### Rollback (If Needed)
```sql
-- Revert to old constraint (NOT RECOMMENDED)
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_user_month_year_key;
ALTER TABLE budgets ADD CONSTRAINT budgets_month_year_key UNIQUE (month, year);
```

**Warning**: Rolling back will break multi-user functionality again.

## Performance Impact

### Query Performance
- ✅ No negative impact
- ✅ Unique constraint on (user_id, month, year) is efficient
- ✅ Index automatically created for constraint
- ✅ Queries filtered by user_id benefit from this index

### Index Information
```sql
-- Check indexes on budgets table
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'budgets';
```

The unique constraint automatically creates an index on (user_id, month, year).

## Related Components

### No Code Changes Required

The following components work without modification:
- ✅ API functions (api.ts)
- ✅ React components
- ✅ RLS policies
- ✅ Authentication flow
- ✅ Frontend forms

### Why No Code Changes?

The constraint change is purely at the database level:
- API already passes correct user_id from auth session
- RLS policies already filter by user_id
- Frontend already handles per-user data
- The only change is allowing multiple users to share month/year values

## Summary

### Problem
Global unique constraint on (month, year) prevented multiple users from creating budgets for the same period.

### Solution
Replaced with user-specific unique constraint on (user_id, month, year).

### Result
✅ Multiple users can create budgets for the same month/year
✅ Each user limited to one budget per period
✅ Complete data isolation maintained
✅ Multi-user functionality fully operational

### Verification
```sql
-- Confirm the fix
SELECT conname, pg_get_constraintdef(c.oid)
FROM pg_constraint c
WHERE conrelid = 'public.budgets'::regclass
  AND conname = 'budgets_user_month_year_key';

-- Expected: UNIQUE (user_id, month, year)
```

## Next Steps

1. ✅ Test with multiple users creating budgets for same month
2. ✅ Verify error handling for duplicate user/period combinations
3. ✅ Monitor application logs for any constraint violations
4. ✅ Update user documentation if needed

The fix is complete and the application now fully supports multi-user budget creation! 🎉
