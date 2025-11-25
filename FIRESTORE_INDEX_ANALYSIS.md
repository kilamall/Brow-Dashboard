# Firestore Index Analysis - Duplicate Detection

## Potential Duplicates/Redundancies Found:

### 1. ⚠️ **appointments** collection - Redundant Index
- **Index 1** (lines 238-254): `status` ASC, `start` ASC, `attendance` ASC
- **Index 2** (lines 272-284): `status` ASC, `start` ASC
- **Issue**: Index 2 is a subset of Index 1. If you query with `status` and `start`, Index 1 can handle it. Index 2 might be redundant.

### 2. ⚠️ **holds** collection - Redundant Index
- **Index 1** (lines 87-99): `status` ASC, `expiresAt` ASC
- **Index 2** (lines 102-118): `status` ASC, `expiresAt` ASC, `resourceId` ASC
- **Issue**: Index 2 includes Index 1 as a prefix. If you only query by `status` and `expiresAt`, Index 2 can handle it. Index 1 might be redundant.

### 3. ⚠️ **skinAnalyses** collection - Near Duplicate
- **Index 1** (lines 166-178): `customerId` ASC, `createdAt` DESC
- **Index 2** (lines 539-555): `customerId` ASC, `createdAt` DESC, `__name__` DESC
- **Issue**: Index 2 is almost identical to Index 1, just adds `__name__`. Firestore automatically includes `__name__` in queries, so Index 1 might be redundant if Index 2 exists.

## Indexes That Are NOT Duplicates (Different Order):

### ✅ **appointments** collection
- `customerId` ASC, `start` ASC (line 4-16)
- `customerId` ASC, `start` DESC (line 19-31)
- **These are different** - one is ascending, one is descending

### ✅ **messages** collection
- `customerId` ASC, `timestamp` ASC (line 136-148)
- `customerId` ASC, `timestamp` DESC (line 463-475)
- **These are different** - one is ascending, one is descending

## Recommendations:

1. **Remove redundant index** for `appointments`: `status` ASC, `start` ASC (line 272-284) - Index 1 with `attendance` can handle this query
2. **Remove redundant index** for `holds`: `status` ASC, `expiresAt` ASC (line 87-99) - Index 2 with `resourceId` can handle this query
3. **Review** `skinAnalyses` indexes - Index 1 might be redundant if Index 2 is used

## How to Check if Indexes Are Actually Used:

1. Check Cloud Function logs for index-related errors
2. Monitor Firestore usage - unused indexes still cost storage
3. Check if queries are using these specific field combinations

## Safe to Remove?

**Before removing any indexes:**
1. Check your codebase for queries that use these exact field combinations
2. Test in a development environment first
3. Monitor for "index required" errors after removal


