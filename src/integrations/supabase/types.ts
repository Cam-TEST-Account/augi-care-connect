export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_type: string
          chief_complaint: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          organization_id: string | null
          patient_id: string
          provider_id: string
          scheduled_date: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          telehealth_enabled: boolean | null
          telehealth_link: string | null
          updated_at: string | null
          visit_summary: string | null
        }
        Insert: {
          appointment_type: string
          chief_complaint?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          patient_id: string
          provider_id: string
          scheduled_date: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          telehealth_enabled?: boolean | null
          telehealth_link?: string | null
          updated_at?: string | null
          visit_summary?: string | null
        }
        Update: {
          appointment_type?: string
          chief_complaint?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          patient_id?: string
          provider_id?: string
          scheduled_date?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          telehealth_enabled?: boolean | null
          telehealth_link?: string | null
          updated_at?: string | null
          visit_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          id: string
          ip_address: string | null
          patient_id: string | null
          provider_id: string | null
          resource_id: string | null
          resource_type: string
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          patient_id?: string | null
          provider_id?: string | null
          resource_id?: string | null
          resource_type: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          patient_id?: string | null
          provider_id?: string | null
          resource_id?: string | null
          resource_type?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_notes: {
        Row: {
          appointment_id: string | null
          content: string
          created_at: string | null
          id: string
          is_signed: boolean | null
          note_type: string
          organization_id: string | null
          patient_id: string
          provider_id: string
          signed_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_signed?: boolean | null
          note_type: string
          organization_id?: string | null
          patient_id: string
          provider_id: string
          signed_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_signed?: boolean | null
          note_type?: string
          organization_id?: string | null
          patient_id?: string
          provider_id?: string
          signed_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ehr_connections: {
        Row: {
          access_token: string | null
          created_at: string | null
          ehr_facility_name: string | null
          ehr_system: Database["public"]["Enums"]["ehr_system"]
          encounter_id: string | null
          id: string
          is_active: boolean | null
          last_sync_date: string | null
          organization_id: string | null
          patient_id: string
          provider_external_id: string
          provider_name: string
          refresh_token: string | null
          specialty: string | null
          token_expires_at: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          ehr_facility_name?: string | null
          ehr_system: Database["public"]["Enums"]["ehr_system"]
          encounter_id?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_date?: string | null
          organization_id?: string | null
          patient_id: string
          provider_external_id: string
          provider_name: string
          refresh_token?: string | null
          specialty?: string | null
          token_expires_at?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          ehr_facility_name?: string | null
          ehr_system?: Database["public"]["Enums"]["ehr_system"]
          encounter_id?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_date?: string | null
          organization_id?: string | null
          patient_id?: string
          provider_external_id?: string
          provider_name?: string
          refresh_token?: string | null
          specialty?: string | null
          token_expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ehr_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ehr_connections_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      ehr_oauth_sessions: {
        Row: {
          created_at: string
          ehr_system: string
          expires_at: string
          id: string
          patient_id: string
          state: string
        }
        Insert: {
          created_at?: string
          ehr_system: string
          expires_at: string
          id?: string
          patient_id: string
          state: string
        }
        Update: {
          created_at?: string
          ehr_system?: string
          expires_at?: string
          id?: string
          patient_id?: string
          state?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          admin_type: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by_user_id: string
          invited_role: Database["public"]["Enums"]["user_role"]
          organization_id: string
          specialties: string[] | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          admin_type?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by_user_id: string
          invited_role: Database["public"]["Enums"]["user_role"]
          organization_id: string
          specialties?: string[] | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          admin_type?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by_user_id?: string
          invited_role?: Database["public"]["Enums"]["user_role"]
          organization_id?: string
          specialties?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_results: {
        Row: {
          abnormal_flag: boolean | null
          collected_date: string | null
          created_at: string | null
          id: string
          lab_facility: string | null
          notes: string | null
          ordered_by_provider_id: string | null
          organization_id: string | null
          patient_id: string
          reference_range: string | null
          result_value: string | null
          resulted_date: string | null
          status: string | null
          test_code: string | null
          test_name: string
          unit: string | null
        }
        Insert: {
          abnormal_flag?: boolean | null
          collected_date?: string | null
          created_at?: string | null
          id?: string
          lab_facility?: string | null
          notes?: string | null
          ordered_by_provider_id?: string | null
          organization_id?: string | null
          patient_id: string
          reference_range?: string | null
          result_value?: string | null
          resulted_date?: string | null
          status?: string | null
          test_code?: string | null
          test_name: string
          unit?: string | null
        }
        Update: {
          abnormal_flag?: boolean | null
          collected_date?: string | null
          created_at?: string | null
          id?: string
          lab_facility?: string | null
          notes?: string | null
          ordered_by_provider_id?: string | null
          organization_id?: string | null
          patient_id?: string
          reference_range?: string | null
          result_value?: string | null
          resulted_date?: string | null
          status?: string | null
          test_code?: string | null
          test_name?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_ordered_by_provider_id_fkey"
            columns: ["ordered_by_provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          organization_id: string | null
          read: boolean | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          organization_id?: string | null
          read?: boolean | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          organization_id?: string | null
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          address_line1: string | null
          address_line2: string | null
          billing_email: string | null
          city: string | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
          state: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          account_type: Database["public"]["Enums"]["account_type"]
          address_line1?: string | null
          address_line2?: string | null
          billing_email?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          state?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          address_line1?: string | null
          address_line2?: string | null
          billing_email?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          external_patient_id: string | null
          first_name: string
          gender: string | null
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          last_name: string
          last_visit_date: string | null
          mrn: string | null
          next_appointment_date: string | null
          organization_id: string | null
          phone: string | null
          primary_provider_id: string | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          risk_score: number | null
          state: string | null
          status: Database["public"]["Enums"]["patient_status"] | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          external_patient_id?: string | null
          first_name: string
          gender?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name: string
          last_visit_date?: string | null
          mrn?: string | null
          next_appointment_date?: string | null
          organization_id?: string | null
          phone?: string | null
          primary_provider_id?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_score?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["patient_status"] | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          external_patient_id?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name?: string
          last_visit_date?: string | null
          mrn?: string | null
          next_appointment_date?: string | null
          organization_id?: string | null
          phone?: string | null
          primary_provider_id?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_score?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["patient_status"] | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_primary_provider_id_fkey"
            columns: ["primary_provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string | null
          dea_schedule: string | null
          dosage: string
          end_date: string | null
          external_prescription_id: string | null
          frequency: string
          id: string
          instructions: string | null
          is_controlled: boolean | null
          medication_name: string
          ndc_code: string | null
          organization_id: string | null
          patient_id: string
          pharmacy_name: string | null
          pharmacy_phone: string | null
          prescribed_date: string | null
          provider_id: string
          quantity: number | null
          refills: number | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          dea_schedule?: string | null
          dosage: string
          end_date?: string | null
          external_prescription_id?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          is_controlled?: boolean | null
          medication_name: string
          ndc_code?: string | null
          organization_id?: string | null
          patient_id: string
          pharmacy_name?: string | null
          pharmacy_phone?: string | null
          prescribed_date?: string | null
          provider_id: string
          quantity?: number | null
          refills?: number | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          dea_schedule?: string | null
          dosage?: string
          end_date?: string | null
          external_prescription_id?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          is_controlled?: boolean | null
          medication_name?: string
          ndc_code?: string | null
          organization_id?: string | null
          patient_id?: string
          pharmacy_name?: string | null
          pharmacy_phone?: string | null
          prescribed_date?: string | null
          provider_id?: string
          quantity?: number | null
          refills?: number | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_profiles: {
        Row: {
          admin_type: string | null
          created_at: string | null
          department: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          license_number: string | null
          license_state: string | null
          npi_number: string | null
          onboarding_completed: boolean | null
          organization_id: string | null
          organization_name: string | null
          phone: string | null
          professional_email: string | null
          professional_phone: string | null
          role: Database["public"]["Enums"]["provider_role"]
          specialties: string[] | null
          specialty: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_type?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          license_number?: string | null
          license_state?: string | null
          npi_number?: string | null
          onboarding_completed?: boolean | null
          organization_id?: string | null
          organization_name?: string | null
          phone?: string | null
          professional_email?: string | null
          professional_phone?: string | null
          role?: Database["public"]["Enums"]["provider_role"]
          specialties?: string[] | null
          specialty?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_type?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          license_number?: string | null
          license_state?: string | null
          npi_number?: string | null
          onboarding_completed?: boolean | null
          organization_id?: string | null
          organization_name?: string | null
          phone?: string | null
          professional_email?: string | null
          professional_phone?: string | null
          role?: Database["public"]["Enums"]["provider_role"]
          specialties?: string[] | null
          specialty?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_messages: {
        Row: {
          created_at: string | null
          ehr_source: Database["public"]["Enums"]["ehr_system"] | null
          external_message_id: string | null
          id: string
          is_read: boolean | null
          is_urgent: boolean | null
          message_body: string
          message_type: Database["public"]["Enums"]["message_type"] | null
          organization_id: string | null
          parent_message_id: string | null
          patient_id: string
          read_date: string | null
          recipient_provider_id: string | null
          sender_provider_id: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          ehr_source?: Database["public"]["Enums"]["ehr_system"] | null
          external_message_id?: string | null
          id?: string
          is_read?: boolean | null
          is_urgent?: boolean | null
          message_body: string
          message_type?: Database["public"]["Enums"]["message_type"] | null
          organization_id?: string | null
          parent_message_id?: string | null
          patient_id: string
          read_date?: string | null
          recipient_provider_id?: string | null
          sender_provider_id: string
          subject: string
        }
        Update: {
          created_at?: string | null
          ehr_source?: Database["public"]["Enums"]["ehr_system"] | null
          external_message_id?: string | null
          id?: string
          is_read?: boolean | null
          is_urgent?: boolean | null
          message_body?: string
          message_type?: Database["public"]["Enums"]["message_type"] | null
          organization_id?: string | null
          parent_message_id?: string | null
          patient_id?: string
          read_date?: string | null
          recipient_provider_id?: string | null
          sender_provider_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "secure_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "secure_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_messages_recipient_provider_id_fkey"
            columns: ["recipient_provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_messages_sender_provider_id_fkey"
            columns: ["sender_provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          administrator_price_per_seat: number
          administrator_seats: number
          billing_cycle: string
          created_at: string | null
          id: string
          next_billing_date: string | null
          organization_id: string
          physician_price_per_seat: number
          physician_seats: number
          super_admin_price_per_seat: number
          super_admin_seats: number
          updated_at: string | null
        }
        Insert: {
          account_type: Database["public"]["Enums"]["account_type"]
          administrator_price_per_seat: number
          administrator_seats?: number
          billing_cycle?: string
          created_at?: string | null
          id?: string
          next_billing_date?: string | null
          organization_id: string
          physician_price_per_seat: number
          physician_seats?: number
          super_admin_price_per_seat: number
          super_admin_seats?: number
          updated_at?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          administrator_price_per_seat?: number
          administrator_seats?: number
          billing_cycle?: string
          created_at?: string | null
          id?: string
          next_billing_date?: string | null
          organization_id?: string
          physician_price_per_seat?: number
          physician_seats?: number
          super_admin_price_per_seat?: number
          super_admin_seats?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          granted_by_user_id: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          granted_by_user_id?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          granted_by_user_id?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vital_signs: {
        Row: {
          blood_glucose: number | null
          bmi: number | null
          created_at: string | null
          diastolic_bp: number | null
          heart_rate: number | null
          height_cm: number | null
          id: string
          notes: string | null
          organization_id: string | null
          oxygen_saturation: number | null
          patient_id: string
          recorded_by_provider_id: string | null
          recorded_date: string | null
          respiratory_rate: number | null
          systolic_bp: number | null
          temperature_c: number | null
          weight_kg: number | null
        }
        Insert: {
          blood_glucose?: number | null
          bmi?: number | null
          created_at?: string | null
          diastolic_bp?: number | null
          heart_rate?: number | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          oxygen_saturation?: number | null
          patient_id: string
          recorded_by_provider_id?: string | null
          recorded_date?: string | null
          respiratory_rate?: number | null
          systolic_bp?: number | null
          temperature_c?: number | null
          weight_kg?: number | null
        }
        Update: {
          blood_glucose?: number | null
          bmi?: number | null
          created_at?: string | null
          diastolic_bp?: number | null
          heart_rate?: number | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          oxygen_saturation?: number | null
          patient_id?: string
          recorded_by_provider_id?: string | null
          recorded_date?: string | null
          respiratory_rate?: number | null
          systolic_bp?: number | null
          temperature_c?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vital_signs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vital_signs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vital_signs_recorded_by_provider_id_fkey"
            columns: ["recorded_by_provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { _token: string; _user_id: string }
        Returns: Json
      }
      can_access_patient_data: {
        Args: { _organization_id: string; _user_id: string }
        Returns: boolean
      }
      cleanup_expired_oauth_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_account_pricing: {
        Args: { _account_type: Database["public"]["Enums"]["account_type"] }
        Returns: {
          administrator_price: number
          max_administrators: number
          max_physicians: number
          max_super_admins: number
          physician_price: number
          super_admin_price: number
        }[]
      }
      get_user_organization: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_organization_safe: {
        Args: { _user_id: string }
        Returns: string
      }
      has_organization_role: {
        Args: {
          _organization_id: string
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_organization_role_safe: {
        Args: {
          _organization_id: string
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      remove_test_patients: {
        Args: { _organization_id: string }
        Returns: undefined
      }
      seed_test_patients: {
        Args: { _organization_id: string; _primary_provider_id: string }
        Returns: undefined
      }
    }
    Enums: {
      account_type: "small_practice" | "enterprise_practice" | "hospital"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      ehr_system:
        | "epic"
        | "cerner"
        | "athena"
        | "allscripts"
        | "nextgen"
        | "other"
      message_type: "clinical" | "administrative" | "system" | "alert"
      patient_status: "active" | "inactive" | "deceased" | "transferred"
      provider_role: "physician" | "nurse" | "pa" | "np" | "admin" | "tech"
      risk_level: "low" | "medium" | "high" | "critical"
      subscription_status: "active" | "suspended" | "cancelled" | "trial"
      user_role: "super_admin" | "physician" | "administrator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["small_practice", "enterprise_practice", "hospital"],
      appointment_status: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      ehr_system: [
        "epic",
        "cerner",
        "athena",
        "allscripts",
        "nextgen",
        "other",
      ],
      message_type: ["clinical", "administrative", "system", "alert"],
      patient_status: ["active", "inactive", "deceased", "transferred"],
      provider_role: ["physician", "nurse", "pa", "np", "admin", "tech"],
      risk_level: ["low", "medium", "high", "critical"],
      subscription_status: ["active", "suspended", "cancelled", "trial"],
      user_role: ["super_admin", "physician", "administrator"],
    },
  },
} as const
