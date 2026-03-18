import { supabase } from './client';
import type { Database } from './database.types';

type BookingInsert = Database['public']['Tables']['bookings']['Insert'];

/**
 * Create a new booking in the database
 * @param booking - Booking data from the form
 * @returns The created booking record or error
 */
export async function createBooking(booking: BookingInsert) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single();

  if (error) {
    console.error('Error creating booking:', error);
    throw error;
  }

  return data;
}

/**
 * Get all bookings for a specific therapist on a given date
 * Useful for checking availability
 */
export async function getTherapistBookings(therapistId: string, date: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('time')
    .eq('therapist_id', therapistId)
    .eq('date', date);

  if (error) {
    console.error('Error fetching therapist bookings:', error);
    throw error;
  }

  return data;
}

/**
 * Get all bookings for a customer by email
 */
export async function getCustomerBookings(email: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customer bookings:', error);
    throw error;
  }

  return data;
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }

  return data;
}

/**
 * Update a booking (for cancellations or modifications)
 */
export async function updateBooking(id: string, updates: Database['public']['Tables']['bookings']['Update']) {
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating booking:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a booking
 */
export async function deleteBooking(id: string) {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
}
