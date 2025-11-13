# SMS Booking - Weekly Grid View Feature

## New Feature
Added a creative 5-day hourly availability grid that shows at-a-glance availability in a compact, SMS-friendly format!

## How It Works

### User Command
Text: **"WEEK"** or **"WEEKLY"**

### Response Format
```
📅 NEXT 5 DAYS:

Tu 12│10✓ 11✓ 12✓ 1✓ 2✓ 3✗ 4✗
We 13│10✓ 11✗ 12✓ 1✓ 2✗ 3✓ 4✓
Th 14│10✗ 11✓ 12✓ 1✓ 2✓ 3✓ 4✗
Fr 15│10✓ 11✓ 12✗ 1✗ 2✓ 3✓ 4✓
Sa 16│10✓ 11✓ 12✓ 1✓ 2✓ 3✓ 4✓

✓ = Open  ✗ = Booked

Reply with day & time to book! (e.g., "Wed 2pm")
- Bueno Brows
```

## Features

### Compact Design
- Uses dots & checkmarks for easy visual scanning
- Each row = one day (e.g., "Tu 12" = Tuesday the 12th)
- Each column = one hour from 10am-4pm
- Perfect for SMS character limits!

### Time Coverage
- **Days**: Next 5 days starting from today
- **Hours**: 10am - 4pm (7 hours total)
- **Legend**: ✓ = Open slot, ✗ = Booked/unavailable

### Smart Detection
- Checks actual business hours for each day
- Respects closures and special hours
- Shows real-time availability

## Usage Examples

### Example 1: Check Weekly Availability
```
User: WEEK
Bot: [Shows 5-day grid]
User: Wed 2pm
Bot: Great! Which service? [Shows top 5]
```

### Example 2: Quick Visual Scan
```
User: WEEKLY
Bot: [Grid shows Wed fully booked]
User: Thu 11am
Bot: [Proceeds to book Thursday instead]
```

## Implementation Details

### New Function: `getWeeklyAvailabilityGrid()`
```typescript
async function getWeeklyAvailabilityGrid(): Promise<string>
```
- Fetches availability for next 5 days
- Checks each hour (10am-4pm) per day
- Formats into compact grid layout
- Returns formatted string

### New Template: `SMS_TEMPLATES.weeklyGrid()`
```typescript
weeklyGrid: (gridData: string) => {
  return `📅 NEXT 5 DAYS:\n\n${gridData}\n\n✓ = Open  ✗ = Booked\n\nReply with day & time to book!`;
}
```

### Parser Detection
```typescript
if (text === 'week' || text === 'weekly') {
  return { type: 'weekly_grid_request', data: null };
}
```

### Handler
```typescript
case 'weekly_grid_request':
  const weeklyGrid = await getWeeklyAvailabilityGrid();
  responseMessage = SMS_TEMPLATES.weeklyGrid(weeklyGrid);
  break;
```

## Comparison to Other Commands

| Command | Shows | Best For |
|---------|-------|----------|
| `AVAILABLE` | Next 10 individual time slots across multiple days | Finding next available appointment |
| `WEEK` | 5-day hourly grid (10am-4pm each day) | Planning ahead, visual overview |
| `Nov 12` | All times available on specific date | Booking a specific day |

## Benefits

1. **Visual at a glance**: Quickly see which days are busier
2. **SMS-friendly**: Compact format fits in one message
3. **Plan ahead**: See full week to pick best time
4. **Mobile-optimized**: Easy to read on phone screens
5. **Creative UX**: Makes booking feel modern and intuitive

## Future Enhancements
Potential additions:
- Custom time ranges (e.g., show 9am-7pm for longer days)
- Color emojis for different availability levels (🟢 🟡 🔴)
- Weekend-only view
- Month view (collapsed format)

---
**Deployed**: November 10, 2025
**Status**: ✅ Live in production
**Commands**: Text "WEEK" or "WEEKLY"


