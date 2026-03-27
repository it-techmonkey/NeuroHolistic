# NeuroHolistic System Deep Audit Report

## Executive Summary

This comprehensive audit reveals a functional but technically debt-heavy codebase with significant duplication, inconsistent patterns, and missed optimization opportunities. The core business logic is sound, but the implementation has accumulated technical debt that impacts maintainability, security, and performance.

---

## 1. CRITICAL ISSUES (Fix Immediately)

### 1.1 Duplicate Supabase Client Creations (3 implementations doing same thing)

| File | Function | Issue |
|------|----------|-------|
| `src/lib/services/supabase-admin.ts` | `getServiceClient()` | Falls back to anon key if service role missing |
| `src/lib/supabase/service.ts` | `getServiceSupabase()` | Proper service client |
| `src/lib/auth/server.ts` | `createServiceClient()` | SSR-compatible service client |

**Problem**: 3 different service clients with inconsistent fallback behavior. The `supabase-admin.ts` has a dangerous fallback to anon key.

**Recommendation**: Consolidate to ONE service client in `supabase/service.ts`, remove the others.

### 1.2 Triple Notification System Duplication

| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/notifications/service.ts` | 161 | Basic email + WhatsApp |
| `src/lib/services/notification.service.ts` | 462 | Full-featured notifications |
| `src/lib/notifications/booking.ts` | (duplicate) | Booking-specific notifications |

**Problem**: Three different notification implementations with overlapping functionality, different interfaces, and inconsistent error handling.

**Recommendation**: Keep `services/notification.service.ts` (most complete), delete the other two.

### 1.3 Duplicate Auth Functions

| File | Functions |
|------|-----------|
| `src/lib/auth.ts` | `getCurrentUserId()`, `getCurrentUserEmail()`, `getCurrentSession()` |
| `src/lib/getUser.ts` | `getCurrentUser()` |
| `src/lib/auth/server.ts` | `getCurrentUserId()`, `getCurrentUserWithRole()` |

**Problem**: Multiple ways to get current user, creating confusion and potential inconsistencies.

**Recommendation**: Keep `auth/server.ts` as single source, delete `getUser.ts`, simplify `auth.ts`.

### 1.4 Security Vulnerabilities

#### 1.4.1 Missing Input Validation
- `booking.service.ts` - No validation on email, phone, date, time inputs
- `passwordless.ts` - No email format validation
- All API routes - No request body validation

#### 1.4.2 XSS in Email Templates
```typescript
// services/notification.service.ts:107
<p>Hi ${firstName},</p> // Unsanitized user input in HTML
```

#### 1.4.3 Missing Rate Limiting
- No rate limiting on any API endpoints
- Booking creation vulnerable to abuse
- Email sending could be spammed

#### 1.4.4 Environment Variable Handling
```typescript
// supabase-admin.ts:7
process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// Falls back to anon key, silently reducing security
```

---

## 2. ARCHITECTURAL ISSUES

### 2.1 Booking Service Complexity (474 lines, 1 function 200+ lines)

The `createBooking()` function handles:
- Time validation
- Eligibility checking
- Program validation
- Therapist assignment
- Duplicate checking
- Meet creation
- Database insertion
- Program updates
- Lead creation
- Notifications

**Recommendation**: Split into:
```
- validateBookingInput()
- resolveTherapist()
- checkSlotAvailability()
- createBookingRecord()
- handleSideEffects() // emails, calendar, etc.
```

### 2.2 Dashboard Components Are Monolithic

| Component | Lines | Issues |
|-----------|-------|--------|
| `TherapistTabs.tsx` | 695 | Sessions + Reports + Forms mixed |
| `DiagnosticAssessmentForm.tsx` | 679 | 6 sections, complex state |
| `SessionDevelopmentForm.tsx` | 595 | Multiple concerns |
| `client/page.tsx` | 795 | Entire dashboard in one file |

**Recommendation**: Extract sub-components, use custom hooks for data fetching.

### 2.3 API Route Inconsistency

**62 API routes** with inconsistent patterns:
- Some use `getServiceClient()` 
- Some use `getServiceSupabase()`
- Some use `createClient()`
- Different error response formats
- Different auth checking patterns

**Recommendation**: Create API middleware for:
- Auth verification
- Error handling
- Request validation
- Response formatting

---

## 3. DATA FLOW ISSUES

### 3.1 Silent Failures in Booking Creation

```typescript
// booking.service.ts:164-166
if (therapistUpdateError) {
  console.error('Failed to update therapist:', therapistUpdateError);
  // Continues execution - data inconsistency risk
}
```

Multiple side effects fail silently:
- Therapist assignment update
- Program session increment
- Lead creation
- Notification sending

**Recommendation**: Use database transactions or at minimum, implement a compensation/rollback mechanism.

### 3.2 Token Refresh Without User Notification

```typescript
// token-service.ts:100-107
if (refreshError) {
  await supabase.from('therapist_google_tokens').delete().eq('user_id', therapistId);
  throw new Error('Token refresh failed. Please reconnect your Google account.');
}
```

Tokens are deleted but user is not notified until they try to use the feature.

**Recommendation**: Store disconnected state and show UI notification.

### 3.3 No Caching Layer

Multiple repeated queries:
- `getUserProgram()` called frequently
- Therapist info fetched repeatedly
- Availability checks query same data

**Recommendation**: Implement React Query or SWR for client-side caching.

---

## 4. UI/UX ISSUES

### 4.1 Inconsistent Card Styles

```typescript
// Different border radii across the app:
rounded-[20px]  // Card.tsx
rounded-2xl     // ProgramCard.tsx  
rounded-lg      // EventCard.tsx
rounded-xl      // Dashboard components
```

### 4.2 Repeated UI Patterns Not Extracted

| Pattern | Locations | Should Be |
|---------|-----------|-----------|
| Stat Cards | TherapistTabs, AdminOverview, ProgressComparison | `StatCard` component |
| Session Cards | Client Sessions, Therapist Sessions, Clients | `SessionCard` component |
| Score Displays | TherapistTabs, ProgressComparison, Client Progress | `ScoreDisplay` component |
| Form Sections | Assessment, Development, Booking forms | `FormSection` component |

### 4.3 Client Dashboard Complexity

The client dashboard (`client/page.tsx`) is 795 lines handling:
- Auth flow with retry logic
- Multiple view modes
- Session management
- Document viewing
- Account menu
- Reschedule flow

**Recommendation**: Split into:
- `useClientDashboard()` hook
- `SessionsList` component
- `SessionDetail` component
- `DocumentViewer` component

---

## 5. CODE DUPLICATION MAP

### 5.1 Format Functions (Copy-pasted everywhere)
```typescript
// Same functions in multiple files:
formatDate() // notifications/service.ts, notifications/booking.ts
formatTime() // notifications/service.ts, notifications/booking.ts
```

### 5.2 Slug Generation
```typescript
// Same pattern in 3 places:
program.therapist_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
```

### 5.3 Role Normalization
```typescript
// Same logic in auth/role-routing.ts AND services/eligibility.service.ts
if (rawRole === 'founder') return 'admin';
if (rawRole === 'client' || rawRole === 'therapist' || rawRole === 'admin') return rawRole;
```

---

## 6. MISSING FEATURES / IMPROVEMENTS

### 6.1 No Input Validation Library
- Use Zod for all API inputs
- Define schemas for booking, assessments, user data
- Runtime validation + TypeScript types from schemas

### 6.2 No Centralized Error Handling
- Create custom error classes: `AuthError`, `BookingError`, `PaymentError`
- Consistent error codes and messages
- Better debugging and user feedback

### 6.3 No Job Queue for Async Operations
- Email sending is fire-and-forget
- Calendar events created synchronously
- No retry mechanism for failed operations

### 6.4 Missing Database Indexes
- Check for missing indexes on frequently queried columns
- Foreign key constraints that might be missing

---

## 7. PRIORITY ACTION PLAN

### Phase 1: Critical Fixes (1-2 days)
1. [ ] Consolidate Supabase service clients (remove `supabase-admin.ts`)
2. [ ] Consolidate notification services (keep `services/notification.service.ts`)
3. [ ] Remove duplicate auth functions (keep `auth/server.ts`)
4. [ ] Add input validation to booking service
5. [ ] Sanitize email template inputs

### Phase 2: Architecture (3-5 days)
1. [ ] Extract booking service into smaller functions
2. [ ] Create API route middleware
3. [ ] Extract dashboard hooks
4. [ ] Create shared UI components (StatCard, SessionCard, etc.)

### Phase 3: Quality (2-3 days)
1. [ ] Add Zod validation schemas
2. [ ] Create custom error classes
3. [ ] Standardize error responses
4. [ ] Add rate limiting to critical endpoints

### Phase 4: Performance (2-3 days)
1. [ ] Add React Query for data fetching
2. [ ] Implement caching for frequently accessed data
3. [ ] Add loading states and skeleton screens
4. [ ] Optimize bundle size

---

## 8. FILE-SPECIFIC RECOMMENDATIONS

### Delete These Files (Consolidate)
- `src/lib/services/supabase-admin.ts` → Use `supabase/service.ts`
- `src/lib/getUser.ts` → Use `auth/server.ts`
- `src/lib/notifications/service.ts` → Use `services/notification.service.ts`
- `src/lib/notifications/booking.ts` → Use `services/notification.service.ts`
- `src/lib/supabase/bookings-with-programs.ts` → Merge with `bookings.ts`

### Refactor These Files
- `src/lib/services/booking.service.ts` - Split into 5+ functions
- `src/app/dashboard/therapist/page.tsx` - Extract components
- `src/app/dashboard/client/page.tsx` - Extract components
- `src/components/dashboard/therapist/TherapistTabs.tsx` - Split into smaller tabs

### Add These Files
- `src/lib/validation/schemas.ts` - Zod schemas
- `src/lib/errors/index.ts` - Custom error classes
- `src/lib/utils/format.ts` - Shared format functions
- `src/hooks/useDashboard.ts` - Dashboard data fetching hook
- `src/components/ui/StatCard.tsx` - Reusable stat card

---

## 9. TESTING GAPS

No automated tests found for:
- Booking flow
- Payment integration
- Google Calendar integration
- Notification sending
- Assessment scoring

**Recommendation**: Add:
- Unit tests for `booking.service.ts`
- Integration tests for API routes
- E2E tests for critical user flows

---

## 10. METRICS TO TRACK

After implementing fixes, measure:
- Bundle size reduction
- API response time improvement
- Reduction in duplicate code
- Test coverage increase
- Error rate reduction

---

*Report generated from codebase analysis*
*Priority: HIGH - Technical debt is accumulating*
*Estimated effort for full remediation: 10-15 days*
