/**
 * Database types for Supabase
 * Updated: 2026-03-21 — Full schema with dashboards, founder role, new columns
 */

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'client' | 'therapist' | 'founder';
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'client' | 'therapist' | 'founder';
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'client' | 'therapist' | 'founder';
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string;
          country: string;
          therapist_id: string;
          therapist_name: string;
          therapist_user_id: string | null;
          date: string;
          time: string;
          type: 'consultation' | 'program' | 'free_consultation';
          program_id: string | null;
          meeting_link: string | null;
          status: 'confirmed' | 'cancelled' | 'completed';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          phone?: string;
          country?: string;
          therapist_id: string;
          therapist_name: string;
          therapist_user_id?: string | null;
          date: string;
          time: string;
          type?: 'consultation' | 'program' | 'free_consultation';
          program_id?: string | null;
          meeting_link?: string | null;
          status?: 'confirmed' | 'cancelled' | 'completed';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          email?: string;
          phone?: string;
          country?: string;
          therapist_id?: string;
          therapist_name?: string;
          therapist_user_id?: string | null;
          date?: string;
          time?: string;
          type?: 'consultation' | 'program' | 'free_consultation';
          program_id?: string | null;
          meeting_link?: string | null;
          status?: 'confirmed' | 'cancelled' | 'completed';
          created_at?: string;
        };
        Relationships: [];
      };
      programs: {
        Row: {
          id: string;
          user_id: string | null;
          total_sessions: number;
          used_sessions: number;
          sessions_completed: number;
          status: 'active' | 'completed' | 'cancelled';
          payment_id: string;
          therapist_user_id: string | null;
          therapist_name: string | null;
          program_type: 'private' | 'group' | null;
          price_paid: number | null;
          client_name: string | null;
          client_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          total_sessions: number;
          used_sessions?: number;
          sessions_completed?: number;
          status?: 'active' | 'completed' | 'cancelled';
          payment_id: string;
          therapist_user_id?: string | null;
          therapist_name?: string | null;
          program_type?: 'private' | 'group' | null;
          price_paid?: number | null;
          client_name?: string | null;
          client_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          total_sessions?: number;
          used_sessions?: number;
          sessions_completed?: number;
          status?: 'active' | 'completed' | 'cancelled';
          payment_id?: string;
          therapist_user_id?: string | null;
          therapist_name?: string | null;
          program_type?: 'private' | 'group' | null;
          price_paid?: number | null;
          client_name?: string | null;
          client_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assessments: {
        Row: {
          id: string;
          user_id: string | null;
          email: string | null;
          full_name: string | null;
          assessment_type: string;
          raw_responses_json: Record<string, unknown>;
          nervous_system_score: number;
          emotional_pattern_score: number;
          family_imprint_score: number;
          incident_load_score: number;
          body_symptom_score: number;
          current_stress_score: number;
          overall_dysregulation_score: number;
          overall_severity_band: string;
          nervous_system_type: string | null;
          primary_core_wound: string | null;
          secondary_core_wound: string | null;
          dominant_parental_influence: string | null;
          possible_origin_period: string | null;
          recommended_phase_primary: string | null;
          recommended_phase_secondary: string | null;
          therapist_notes: string | null;
          status: string;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email?: string | null;
          full_name?: string | null;
          assessment_type?: string;
          raw_responses_json: Record<string, unknown>;
          nervous_system_score?: number;
          emotional_pattern_score?: number;
          family_imprint_score?: number;
          incident_load_score?: number;
          body_symptom_score?: number;
          current_stress_score?: number;
          overall_dysregulation_score?: number;
          overall_severity_band?: string;
          nervous_system_type?: string | null;
          primary_core_wound?: string | null;
          secondary_core_wound?: string | null;
          dominant_parental_influence?: string | null;
          possible_origin_period?: string | null;
          recommended_phase_primary?: string | null;
          recommended_phase_secondary?: string | null;
          therapist_notes?: string | null;
          status?: string;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string | null;
          full_name?: string | null;
          assessment_type?: string;
          raw_responses_json?: Record<string, unknown>;
          nervous_system_score?: number;
          emotional_pattern_score?: number;
          family_imprint_score?: number;
          incident_load_score?: number;
          body_symptom_score?: number;
          current_stress_score?: number;
          overall_dysregulation_score?: number;
          overall_severity_band?: string;
          nervous_system_type?: string | null;
          primary_core_wound?: string | null;
          secondary_core_wound?: string | null;
          dominant_parental_influence?: string | null;
          possible_origin_period?: string | null;
          recommended_phase_primary?: string | null;
          recommended_phase_secondary?: string | null;
          therapist_notes?: string | null;
          status?: string;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          name: string;
          mobile: string;
          email: string;
          country: string;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          mobile: string;
          email: string;
          country: string;
          source?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          mobile?: string;
          email?: string;
          country?: string;
          source?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          user_id: string | null;
          amount: number;
          currency: string;
          type: 'full_program' | 'single_session';
          status: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_reference: string | null;
          program_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          amount: number;
          currency?: string;
          type: 'full_program' | 'single_session';
          status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_reference?: string | null;
          program_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          amount?: number;
          currency?: string;
          type?: 'full_program' | 'single_session';
          status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_reference?: string | null;
          program_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          program_id: string;
          booking_id: string | null;
          session_number: number;
          date: string | null;
          time: string | null;
          status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          booking_id?: string | null;
          session_number: number;
          date?: string | null;
          time?: string | null;
          status?: 'scheduled' | 'completed' | 'cancelled' | 'pending';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          program_id?: string;
          booking_id?: string | null;
          session_number?: number;
          date?: string | null;
          time?: string | null;
          status?: 'scheduled' | 'completed' | 'cancelled' | 'pending';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sessions_program_id_fkey';
            columns: ['program_id'];
            referencedRelation: 'programs';
            referencedColumns: ['id'];
          }
        ];
      };
      therapist_clients: {
        Row: {
          id: string;
          therapist_id: string;
          client_id: string;
          assigned_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          therapist_id: string;
          client_id: string;
          assigned_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          therapist_id?: string;
          client_id?: string;
          assigned_at?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
