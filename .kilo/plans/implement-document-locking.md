# Plan: Document Upload and Session Locking

## Summary
Ensure document uploads work properly and that once a session is marked as complete, no documents can be modified or added.

## Current Issues

### Upload Feature
1. **Two upload paths exist:**
   - R2 Presigned URL: `/api/documents/upload-url` → R2 → `/api/documents` (POST)
   - Supabase Storage: `UploadMaterial.tsx` → `/api/uploads/session-material`
2. Both paths work but lack session completion checks
3. Upload button is hidden client-side for completed sessions but API doesn't enforce

### Session Locking
1. **No backend enforcement:**
   - `/api/documents` POST - no session completion check
   - `/api/documents/upload-url` POST - no session completion check
   - `/api/documents` DELETE - no session completion check
   - `/api/uploads/session-material` POST - no session completion check
2. **UI hiding is client-side only** - API allows uploads to completed sessions

## Implementation Plan

### 1. Add Session Completion Check to `/api/documents` POST
**File:** `src/app/api/documents/route.ts`

Add check after line 110 (after therapist-client verification):
```typescript
// Check if session is completed (if session_id provided)
if (session_id) {
  const { data: sessionCheck } = await supabase
    .from('sessions')
    .select('status')
    .eq('id', session_id)
    .single();
  
  if (sessionCheck?.status === 'completed') {
    return NextResponse.json({ error: 'Cannot add documents to completed sessions' }, { status: 403 });
  }
}
```

### 2. Add Session Completion Check to `/api/documents/upload-url` POST
**File:** `src/app/api/documents/upload-url/route.ts`

Add check after line 50 (after therapist-client verification):
```typescript
// Check if session is completed (if sessionId provided)
if (sessionId) {
  const { data: sessionCheck } = await supabase
    .from('sessions')
    .select('status')
    .eq('id', sessionId)
    .single();
  
  if (sessionCheck?.status === 'completed') {
    return NextResponse.json({ error: 'Cannot upload to completed sessions' }, { status: 403 });
  }
}
```

### 3. Add Session Completion Check to `/api/documents` DELETE
**File:** `src/app/api/documents/route.ts`

Add check after line 169 (after getting document details):
```typescript
// Check if session is completed
if (doc.session_id) {
  const { data: sessionCheck } = await supabase
    .from('sessions')
    .select('status')
    .eq('id', doc.session_id)
    .single();
  
  if (sessionCheck?.status === 'completed') {
    return NextResponse.json({ error: 'Cannot delete documents from completed sessions' }, { status: 403 });
  }
}
```

Note: First need to add `session_id` to the select query.

### 4. Add Session Completion Check to `/api/uploads/session-material` POST
**File:** `src/app/api/uploads/session-material/route.ts`

Add check after line 66 (after session verification):
```typescript
// Check if session is completed
const { data: sessionData, error: sessionCheckError } = await supabase
  .from('sessions')
  .select('id, status')
  .eq('id', sessionId)
  .single();

if (sessionData?.status === 'completed') {
  return NextResponse.json({ error: 'Cannot upload to completed sessions' }, { status: 403 });
}
```

### 5. Update UploadMaterial Component to Respect Session Status
**File:** `src/components/dashboard/therapist/UploadMaterial.tsx`

Add `isCompleted` prop and disable upload when session is completed:
```typescript
interface Props {
  sessionId: string;
  onUploadComplete: () => void;
  isCompleted?: boolean;
}

// Disable file input when completed
<input 
  type="file" 
  disabled={uploading || isCompleted}
  ...
/>
```

### 6. Update TherapistTabs to Pass isCompleted to UploadMaterial
**File:** `src/components/dashboard/therapist/TherapistTabs.tsx`

Pass `isCompleted` prop when using UploadMaterial component (if used elsewhere).

### 7. Add Visual "Locked" Indicator for Completed Sessions
**File:** `src/components/dashboard/therapist/TherapistTabs.tsx`

In SessionCard component, add locked badge when session is completed:
```tsx
{isCompleted && (
  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg flex items-center gap-1">
    <Lock className="w-3 h-3" /> Locked
  </span>
)}
```

Also show lock icon on documents from completed sessions:
```tsx
{isCompleted && (
  <div className="absolute top-2 right-2">
    <Lock className="w-4 h-4 text-slate-400" />
  </div>
)}
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/api/documents/route.ts` | Add session completion check to POST and DELETE |
| `src/app/api/documents/upload-url/route.ts` | Add session completion check to POST |
| `src/app/api/uploads/session-material/route.ts` | Add session completion check to POST |
| `src/components/dashboard/therapist/UploadMaterial.tsx` | Add `isCompleted` prop to disable upload |
| `src/components/dashboard/therapist/TherapistTabs.tsx` | Add "Locked" badge and lock icons |

## Testing Checklist

- [ ] Upload document to active session - should succeed
- [ ] Upload document to completed session - should fail with 403
- [ ] Delete document from active session - should succeed
- [ ] Delete document from completed session - should fail with 403
- [ ] Mark session complete - UI should show "Locked" badge
- [ ] Upload button should be hidden/disabled for completed sessions
- [ ] Documents from completed sessions should show lock icon
- [ ] Video upload should work for active sessions
- [ ] PDF upload should work for active sessions

## Notes

- The `status === 'completed'` check is consistent with existing patterns in the codebase
- Backend enforcement ensures security even if client-side checks are bypassed
- The UI changes provide clear visual feedback to users
