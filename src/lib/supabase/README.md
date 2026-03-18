# Supabase Setup Guide

## Installation

First, install the Supabase JavaScript client:

```bash
npm install @supabase/supabase-js
```

## Environment Variables

Create a `.env.local` file in the project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**How to find these values:**
1. Go to your Supabase project dashboard
2. Click "Settings" → "API"
3. Copy the **Project URL** and **Anon Public** key
4. Paste them into `.env.local`

## Usage

### Basic Client Import

```typescript
import { supabase } from '@/lib/supabase/client';

// Example: Fetch data
const { data, error } = await supabase
  .from('your_table')
  .select()
  .limit(10);
```

### In React Components

```typescript
'use client'; // Mark as client component

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function MyComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('your_table')
        .select()
        .limit(10);

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setData(data);
      }
    }

    fetchData();
  }, []);

  return <div>{/* Render data */}</div>;
}
```

## Generating TypeScript Types

Generate type-safe database types for autocompletion:

### Option 1: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Generate types (replace PROJECT_ID with your Supabase project ID)
supabase gen types typescript --project-id PROJECT_ID > src/lib/supabase/database.types.ts
```

### Option 2: Manual Generation

1. Visit your [Supabase dashboard](https://app.supabase.com)
2. Go to **SQL Editor** → **User Management** (or any table)
3. Copy the generated type definitions from the Supabase docs
4. Paste into `src/lib/supabase/database.types.ts`

## Authentication

For user authentication, you can extend the setup:

```typescript
// Example: Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure_password',
});

// Example: Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure_password',
});

// Example: Get current user
const { data: { user } } = await supabase.auth.getUser();
```

## Real-time Subscriptions

Listen to live database changes:

```typescript
supabase
  .from('your_table')
  .on('*', (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

## Next Steps

1. Create your database tables in Supabase
2. Generate TypeScript types
3. Start using the client in your components

For more info: [Supabase JavaScript Docs](https://supabase.com/docs/reference/javascript)
