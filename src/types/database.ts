export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          locale: string;
          timezone: string;
          onboarding_completed: boolean;
          local_data_migrated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      cycles: {
        Row: {
          id: string;
          user_id: string;
          period_start: string;
          average_cycle_length: number;
          minimum_cycle_length: number;
          maximum_cycle_length: number;
          regularity: string;
          ovulation_method: string;
          known_ovulation_date: string | null;
          lh_surge_date: string | null;
          lh_result: string | null;
          body_signals: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cycles"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["cycles"]["Insert"]>;
        Relationships: [];
      };
      daily_logs: {
        Row: {
          id: string;
          user_id: string;
          cycle_id: string | null;
          log_date: string;
          note: string | null;
          symptoms: string | null;
          bbt: number | null;
          lh_result: string | null;
          mucus: string | null;
          cervix_position: string | null;
          sex_methods: string[];
          exposure_note: string | null;
          stress_level: string | null;
          sleep_quality: string | null;
          travel_or_illness: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["daily_logs"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["daily_logs"]["Insert"]>;
        Relationships: [];
      };
      exposures: {
        Row: {
          id: string;
          user_id: string;
          cycle_id: string | null;
          exposure_date: string;
          methods: string[];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["exposures"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["exposures"]["Insert"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          stripe_product_id: string | null;
          status: string;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          trial_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [];
      };
      stripe_events: {
        Row: {
          stripe_event_id: string;
          event_type: string;
          livemode: boolean;
          processed_at: string;
          payload_version: string | null;
          processing_error: string | null;
        };
        Insert: Database["public"]["Tables"]["stripe_events"]["Row"];
        Update: Partial<Database["public"]["Tables"]["stripe_events"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      claim_stripe_event: {
        Args: { p_event_id: string; p_event_type: string; p_livemode: boolean; p_payload_version: string | null };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
