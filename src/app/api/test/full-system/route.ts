import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { incrementUsedSessions } from '@/lib/supabase/programs';

const TEST_EMAIL = 'test@example.com';
const TEST_PAYMENT_ID = 'test_payment_auto';

export async function GET(request: NextRequest) {
  try {
    console.log('[Test] ========== FULL SYSTEM TEST START ==========');
    
    // STEP 1: Setup - Check/Create program by payment_id
    console.log('[Test] STEP 1: Setup - Checking test program...');
    
    const { data: existingProgram } = await supabase
      .from('programs')
      .select('*')
      .eq('payment_id', TEST_PAYMENT_ID)
      .maybeSingle();
    
    let programId: string;
    
    if (!existingProgram) {
      // Create program (no user_id required for test)
      console.log('[Test] Program not found, creating new program...');
      const { data: newProgram, error: createError } = await supabase
        .from('programs')
        .insert([{
          user_id: null,
          total_sessions: 10,
          used_sessions: 0,
          payment_id: TEST_PAYMENT_ID,
        }])
        .select()
        .single();
      
      if (createError || !newProgram) {
        console.error('[Test] ERROR - Failed to create program:', createError);
        return NextResponse.json(
          { success: false, error: 'Failed to create program', details: createError },
          { status: 500 }
        );
      }
      
      programId = newProgram.id;
      console.log('[Test] PROGRAM CREATED:', {
        programId,
        totalSessions: newProgram.total_sessions,
        usedSessions: newProgram.used_sessions,
        paymentId: TEST_PAYMENT_ID,
      });
    } else {
      programId = existingProgram.id;
      console.log('[Test] PROGRAM FOUND:', {
        programId,
        totalSessions: existingProgram.total_sessions,
        usedSessions: existingProgram.used_sessions,
        paymentId: TEST_PAYMENT_ID,
      });
    }
    
    // STEP 2: Fetch program - Get current used_sessions
    console.log('[Test] STEP 2: Fetching current program state...');
    const { data: programBefore } = await supabase
      .from('programs')
      .select('used_sessions, total_sessions')
      .eq('id', programId)
      .single();
    
    if (!programBefore) {
      return NextResponse.json(
        { success: false, error: 'Program not found after creation' },
        { status: 500 }
      );
    }
    
    const usedSessionsBefore = programBefore.used_sessions;
    console.log('[Test] BEFORE STATE:', {
      programId,
      usedSessions: usedSessionsBefore,
      totalSessions: programBefore.total_sessions,
      remaining: programBefore.total_sessions - usedSessionsBefore,
    });
    
    // STEP 3: Create paid booking
    console.log('[Test] STEP 3: Creating program booking...');
    const bookingPayload = {
      email: TEST_EMAIL,
      name: 'Test User',
      phone: '+1-555-0000',
      country: 'United States',
      therapist_id: 'dr-test-therapist',
      therapist_name: 'Test Therapist',
      type: 'program' as const,
      date: new Date().toISOString().split('T')[0], // Today
      time: '14:00',
    };
    
    let booking;
    try {
      // Create booking directly (no userId needed)
      const { data: createdBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          ...bookingPayload,
          type: 'program',
          program_id: programId,
        }])
        .select()
        .single();
      
      if (bookingError || !createdBooking) {
        console.error('[Test] ERROR - Booking creation failed:', {
          error: bookingError?.message,
          code: bookingError?.code,
        });
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Booking creation failed',
            details: bookingError?.message || 'Unknown error',
          },
          { status: 500 }
        );
      }
      
      booking = createdBooking;
      console.log('[Test] BOOKING CREATED:', {
        bookingId: booking.id,
        email: booking.email,
        type: booking.type,
        programId: booking.program_id,
      });
    } catch (bookingError: any) {
      console.error('[Test] ERROR - Booking creation exception:', {
        error: bookingError.message || String(bookingError),
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Booking creation failed',
          details: bookingError.message || String(bookingError),
        },
        { status: 500 }
      );
    }
    
    // STEP 4: Deduct session - increment used_sessions
    console.log('[Test] STEP 4: Deducting session...');
    try {
      await incrementUsedSessions(programId);
      console.log('[Test] SESSION DEDUCTED successfully');
    } catch (sessionError: any) {
      console.error('[Test] ERROR - Session deduction failed:', {
        error: sessionError.message || String(sessionError),
        programId,
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Session deduction failed',
          details: sessionError.message || String(sessionError),
          bookingCreated: true, // Booking was created before error
        },
        { status: 500 }
      );
    }
    
    // STEP 5: Fetch updated program
    console.log('[Test] STEP 5: Fetching updated program state...');
    const { data: programAfter } = await supabase
      .from('programs')
      .select('used_sessions, total_sessions')
      .eq('id', programId)
      .single();
    
    if (!programAfter) {
      return NextResponse.json(
        { success: false, error: 'Program not found after deduction' },
        { status: 500 }
      );
    }
    
    const usedSessionsAfter = programAfter.used_sessions;
    const sessionsDeducted = usedSessionsAfter - usedSessionsBefore;
    
    console.log('[Test] AFTER STATE:', {
      programId,
      usedSessions: usedSessionsAfter,
      totalSessions: programAfter.total_sessions,
      remaining: programAfter.total_sessions - usedSessionsAfter,
    });
    
    console.log('[Test] RESULT:', {
      before: usedSessionsBefore,
      after: usedSessionsAfter,
      deducted: sessionsDeducted,
      success: sessionsDeducted === 1,
    });
    
    // STEP 6: Return response
    console.log('[Test] ========== FULL SYSTEM TEST COMPLETE ==========');
    
    const testPassed = sessionsDeducted === 1;
    
    return NextResponse.json({
      success: true,
      testPassed,
      message: testPassed 
        ? 'System working correctly - Session properly deducted'
        : 'System test completed but session deduction anomaly detected',
      data: {
        email: TEST_EMAIL,
        paymentId: TEST_PAYMENT_ID,
        programId,
        before: usedSessionsBefore,
        after: usedSessionsAfter,
        deducted: sessionsDeducted,
        totalSessions: programAfter.total_sessions,
        remainingSessions: programAfter.total_sessions - usedSessionsAfter,
        booking: {
          id: booking.id,
          type: booking.type,
          created_at: booking.created_at,
        },
      },
      logs: {
        note: 'Check server console for [Test] prefix logs',
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error: any) {
    console.error('[Test] UNEXPECTED ERROR:', {
      error: error.message || String(error),
      stack: error.stack,
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unexpected error during system test',
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
