/**
 * Database types generated from Supabase
 * 
 * To generate these types:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Run: supabase gen types typescript --project-id your_project_id > src/lib/supabase/database.types.ts
 * 
 * Or generate manually in your Supabase dashboard:
 * https://supabase.com/docs/reference/javascript/generating-types
 */

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          name: string;
          email: string;
          therapist_id: string;
          therapist_name: string;
          date: string; // ISO date format
          time: string;
          created_at: string; // ISO timestamp
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          therapist_id: string;
          therapist_name: string;
          date: string;
          time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          therapist_id?: string;
          therapist_name?: string;
          date?: string;
          time?: string;
          created_at?: string;
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
