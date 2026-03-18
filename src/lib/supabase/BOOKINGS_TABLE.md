# Bookings Table Setup

## Table Structure

The `bookings` table stores all consultation booking submissions from the modal form.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key, auto-generated |
| `name` | TEXT | Yes | Customer full name |
| `email` | TEXT | Yes | Customer email address |
| `therapist_id` | TEXT | Yes | ID of selected practitioner |
| `therapist_name` | TEXT | Yes | Name of selected practitioner |
| `date` | DATE | Yes | Booking date |
| `time` | TEXT | Yes | Booking time slot |
| `created_at` | TIMESTAMP | Yes | Record creation timestamp, auto-set |

## How to Execute

### Option 1: Supabase Dashboard (Easiest)

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Open your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy the entire SQL from `001_create_bookings_table.sql`
6. Click **Run**

### Option 2: Using Supabase CLI

```bash
supabase migration new create_bookings_table
# Copy the SQL content into the generated file
supabase db push
```

## Table Features

### Indexes
- **email**: Fast lookup by customer email
- **therapist_id**: Filter bookings by practitioner
- **date**: Query bookings by date
- **created_at**: Sort by creation time (most recent first)
- **date + therapist_id**: Composite index for availability checking

### Constraints
- **Email validation**: Uses PostgreSQL regex to validate email format
- **NOT NULL**: All fields required (no incomplete bookings)

### Security (RLS)
- Public insert access (booking form submissions)
- Public read access (booking confirmations)
- Update access for all (future cancellations/modifications)

## Integration with BookingModal

The modal form data maps to table fields:

```typescript
// From BookingModal formData → bookings table
const booking = {
  name: formData.name,           // → name
  email: formData.email,         // → email
  therapist_id: formData.therapist,        // → therapist_id
  therapist_name: selectedTherapist.name,  // → therapist_name
  date: formData.date,           // → date (ISO format converted)
  time: formData.time,           // → time
};
```

## Common Queries

### Get all bookings for a therapist
```sql
SELECT * FROM bookings
WHERE therapist_id = 'therapist-123'
ORDER BY date DESC;
```

### Find bookings on a specific date
```sql
SELECT * FROM bookings
WHERE date = '2026-03-20'
ORDER BY time;
```

### Get bookings for a customer
```sql
SELECT * FROM bookings
WHERE email = 'user@example.com'
ORDER BY created_at DESC;
```

### Check availability (occupied slots on a date)
```sql
SELECT time FROM bookings
WHERE date = '2026-03-20'
AND therapist_id = 'therapist-123';
```

## Scalability Considerations

✅ **UUID primary key**: Global uniqueness, no coordination needed  
✅ **Indexes on query columns**: Fast lookups even with large datasets  
✅ **Date field**: Allows efficient range queries and archival  
✅ **Composite index**: Optimizes availability checking  
✅ **RLS policies**: Secure by default, extensible permissions

## Future Enhancements

Consider adding these fields as the system grows:

```sql
ALTER TABLE bookings ADD COLUMN status TEXT DEFAULT 'confirmed'; -- confirmed, cancelled, completed
ALTER TABLE bookings ADD COLUMN notes TEXT; -- internal notes
ALTER TABLE bookings ADD COLUMN updated_at TIMESTAMP DEFAULT NOW(); -- track changes
ALTER TABLE bookings ADD COLUMN user_id UUID; -- link to users table when auth added
```

## Reference

- [Supabase SQL Documentation](https://supabase.com/docs/guides/sql)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [Indexes Guide](https://www.postgresql.org/docs/current/indexes.html)
