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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          cart_items: Json
          cart_value: number
          converted: boolean | null
          converted_at: string | null
          created_at: string
          discount_code_used: string | null
          email: string
          email_opened: boolean | null
          email_sent_at: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          cart_items: Json
          cart_value: number
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string
          discount_code_used?: string | null
          email: string
          email_opened?: boolean | null
          email_sent_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          cart_items?: Json
          cart_value?: number
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string
          discount_code_used?: string | null
          email?: string
          email_opened?: boolean | null
          email_sent_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_user_id: string
          created_at: string
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_user_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_products: {
        Row: {
          active: boolean | null
          affiliate_link: string
          amazon_asin: string
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          priority: number | null
          product_name: string
          recommended_for: string[] | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          affiliate_link: string
          amazon_asin: string
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: number | null
          product_name: string
          recommended_for?: string[] | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          affiliate_link?: string
          amazon_asin?: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: number | null
          product_name?: string
          recommended_for?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_assessment_ratings: {
        Row: {
          created_at: string | null
          expert_user_id: string | null
          healing_progress_id: string | null
          healing_stage_accuracy: number | null
          id: string
          notes: string | null
          overall_accuracy: number | null
          progress_score_accuracy: number | null
          recommendations_accuracy: number | null
        }
        Insert: {
          created_at?: string | null
          expert_user_id?: string | null
          healing_progress_id?: string | null
          healing_stage_accuracy?: number | null
          id?: string
          notes?: string | null
          overall_accuracy?: number | null
          progress_score_accuracy?: number | null
          recommendations_accuracy?: number | null
        }
        Update: {
          created_at?: string | null
          expert_user_id?: string | null
          healing_progress_id?: string | null
          healing_stage_accuracy?: number | null
          id?: string
          notes?: string | null
          overall_accuracy?: number | null
          progress_score_accuracy?: number | null
          recommendations_accuracy?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_assessment_ratings_healing_progress_id_fkey"
            columns: ["healing_progress_id"]
            isOneToOne: false
            referencedRelation: "healing_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_custom_instructions: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          created_by: string | null
          id: string
          instruction_text: string
          priority: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          instruction_text: string
          priority?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          instruction_text?: string
          priority?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_response_logs: {
        Row: {
          anomaly_score: number | null
          baseline_deviation_score: number | null
          created_at: string
          fallback_used: boolean | null
          healing_progress_id: string | null
          healing_stage: string | null
          id: string
          model_used: string
          model_version: string | null
          request_hash: string
          response_hash: string
          response_signature: string | null
          response_time_ms: number | null
          risk_level: string | null
          user_id: string | null
        }
        Insert: {
          anomaly_score?: number | null
          baseline_deviation_score?: number | null
          created_at?: string
          fallback_used?: boolean | null
          healing_progress_id?: string | null
          healing_stage?: string | null
          id?: string
          model_used: string
          model_version?: string | null
          request_hash: string
          response_hash: string
          response_signature?: string | null
          response_time_ms?: number | null
          risk_level?: string | null
          user_id?: string | null
        }
        Update: {
          anomaly_score?: number | null
          baseline_deviation_score?: number | null
          created_at?: string
          fallback_used?: boolean | null
          healing_progress_id?: string | null
          healing_stage?: string | null
          id?: string
          model_used?: string
          model_version?: string | null
          request_hash?: string
          response_hash?: string
          response_signature?: string | null
          response_time_ms?: number | null
          risk_level?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_response_logs_healing_progress_id_fkey"
            columns: ["healing_progress_id"]
            isOneToOne: false
            referencedRelation: "healing_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_response_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          ip_address: string | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data: Json
          event_type: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_executions: {
        Row: {
          automation_id: string
          completed_at: string | null
          created_at: string
          current_step: number | null
          error_message: string | null
          execution_logs: Json | null
          id: string
          order_id: string | null
          started_at: string
          status: string
          trigger_data: Json
        }
        Insert: {
          automation_id: string
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          error_message?: string | null
          execution_logs?: Json | null
          id?: string
          order_id?: string | null
          started_at?: string
          status?: string
          trigger_data: Json
        }
        Update: {
          automation_id?: string
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          error_message?: string | null
          execution_logs?: Json | null
          id?: string
          order_id?: string | null
          started_at?: string
          status?: string
          trigger_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "automation_executions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_executions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string
          workflow_steps: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string
          workflow_steps: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string
          workflow_steps?: Json
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          backlink_sources: string[] | null
          canonical_url: string
          categories: string[] | null
          content_markdown: string
          created_at: string
          created_by: string | null
          cta_text: string | null
          cta_url: string | null
          excerpt: string
          featured_image: string
          featured_image_alt: string
          id: string
          meta_description: string
          meta_title: string | null
          publish_date: string
          publish_status: string
          related_post_ids: string[] | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          video_embed_url: string | null
        }
        Insert: {
          author: string
          backlink_sources?: string[] | null
          canonical_url: string
          categories?: string[] | null
          content_markdown: string
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          cta_url?: string | null
          excerpt: string
          featured_image: string
          featured_image_alt: string
          id?: string
          meta_description: string
          meta_title?: string | null
          publish_date: string
          publish_status?: string
          related_post_ids?: string[] | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          video_embed_url?: string | null
        }
        Update: {
          author?: string
          backlink_sources?: string[] | null
          canonical_url?: string
          categories?: string[] | null
          content_markdown?: string
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          cta_url?: string | null
          excerpt?: string
          featured_image?: string
          featured_image_alt?: string
          id?: string
          meta_description?: string
          meta_title?: string | null
          publish_date?: string
          publish_status?: string
          related_post_ids?: string[] | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          video_embed_url?: string | null
        }
        Relationships: []
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
          message: string
          name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          subject: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          message: string
          name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          subject: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          subject?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_funnel: {
        Row: {
          conversion_rate: number | null
          count: number
          created_at: string
          date: string
          id: string
          step_name: string
        }
        Insert: {
          conversion_rate?: number | null
          count?: number
          created_at?: string
          date: string
          id?: string
          step_name: string
        }
        Update: {
          conversion_rate?: number | null
          count?: number
          created_at?: string
          date?: string
          id?: string
          step_name?: string
        }
        Relationships: []
      }
      customer_reviews: {
        Row: {
          approved: boolean
          content: string
          created_at: string
          email: string
          id: string
          name: string
          rating: number
          title: string | null
          updated_at: string
        }
        Insert: {
          approved?: boolean
          content: string
          created_at?: string
          email: string
          id?: string
          name: string
          rating: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          approved?: boolean
          content?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          rating?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      expert_assessments: {
        Row: {
          common_mistakes_corrected: string | null
          created_at: string | null
          expert_notes: string | null
          expert_user_id: string | null
          healing_progress_id: string | null
          healing_stage: string
          id: string
          key_indicators: string[] | null
          product_recommendations: string[] | null
          progress_score: number | null
          recommendations: string[]
          risk_assessment: string | null
          updated_at: string | null
        }
        Insert: {
          common_mistakes_corrected?: string | null
          created_at?: string | null
          expert_notes?: string | null
          expert_user_id?: string | null
          healing_progress_id?: string | null
          healing_stage: string
          id?: string
          key_indicators?: string[] | null
          product_recommendations?: string[] | null
          progress_score?: number | null
          recommendations?: string[]
          risk_assessment?: string | null
          updated_at?: string | null
        }
        Update: {
          common_mistakes_corrected?: string | null
          created_at?: string | null
          expert_notes?: string | null
          expert_user_id?: string | null
          healing_progress_id?: string | null
          healing_stage?: string
          id?: string
          key_indicators?: string[] | null
          product_recommendations?: string[] | null
          progress_score?: number | null
          recommendations?: string[]
          risk_assessment?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_assessments_healing_progress_id_fkey"
            columns: ["healing_progress_id"]
            isOneToOne: true
            referencedRelation: "healing_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_knowledge_base: {
        Row: {
          common_causes: string[] | null
          condition_description: string
          condition_name: string
          created_at: string | null
          created_by: string | null
          healing_stage: string
          id: string
          last_used: string | null
          product_recommendations: string[] | null
          recommended_actions: string[]
          reference_images: string[] | null
          severity_level: string | null
          timeline_expectations: string | null
          times_referenced: number | null
          updated_at: string | null
          visual_indicators: string[]
        }
        Insert: {
          common_causes?: string[] | null
          condition_description: string
          condition_name: string
          created_at?: string | null
          created_by?: string | null
          healing_stage: string
          id?: string
          last_used?: string | null
          product_recommendations?: string[] | null
          recommended_actions?: string[]
          reference_images?: string[] | null
          severity_level?: string | null
          timeline_expectations?: string | null
          times_referenced?: number | null
          updated_at?: string | null
          visual_indicators?: string[]
        }
        Update: {
          common_causes?: string[] | null
          condition_description?: string
          condition_name?: string
          created_at?: string | null
          created_by?: string | null
          healing_stage?: string
          id?: string
          last_used?: string | null
          product_recommendations?: string[] | null
          recommended_actions?: string[]
          reference_images?: string[] | null
          severity_level?: string | null
          timeline_expectations?: string | null
          times_referenced?: number | null
          updated_at?: string | null
          visual_indicators?: string[]
        }
        Relationships: []
      }
      healaid_activation_codes: {
        Row: {
          activated_by: string | null
          activation_date: string | null
          code: string
          code_expiration_date: string | null
          created_at: string | null
          duration_days: number
          email: string | null
          expiration_date: string | null
          id: string
          redeemed: boolean | null
          tier: string | null
          updated_at: string | null
          upgraded: boolean | null
        }
        Insert: {
          activated_by?: string | null
          activation_date?: string | null
          code: string
          code_expiration_date?: string | null
          created_at?: string | null
          duration_days?: number
          email?: string | null
          expiration_date?: string | null
          id?: string
          redeemed?: boolean | null
          tier?: string | null
          updated_at?: string | null
          upgraded?: boolean | null
        }
        Update: {
          activated_by?: string | null
          activation_date?: string | null
          code?: string
          code_expiration_date?: string | null
          created_at?: string | null
          duration_days?: number
          email?: string | null
          expiration_date?: string | null
          id?: string
          redeemed?: boolean | null
          tier?: string | null
          updated_at?: string | null
          upgraded?: boolean | null
        }
        Relationships: []
      }
      healaid_subscriptions: {
        Row: {
          activation_code: string | null
          analyses_count: number | null
          created_at: string | null
          daily_uploads_count: number | null
          email: string
          expiration_date: string
          id: string
          is_active: boolean | null
          last_upload_date: string | null
          start_date: string | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activation_code?: string | null
          analyses_count?: number | null
          created_at?: string | null
          daily_uploads_count?: number | null
          email: string
          expiration_date: string
          id?: string
          is_active?: boolean | null
          last_upload_date?: string | null
          start_date?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activation_code?: string | null
          analyses_count?: number | null
          created_at?: string | null
          daily_uploads_count?: number | null
          email?: string
          expiration_date?: string
          id?: string
          is_active?: boolean | null
          last_upload_date?: string | null
          start_date?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "healyn_subscriptions_activation_code_fkey"
            columns: ["activation_code"]
            isOneToOne: false
            referencedRelation: "healaid_activation_codes"
            referencedColumns: ["code"]
          },
        ]
      }
      healaid_upgrade_history: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          new_tier: string
          old_tier: string | null
          stripe_payment_id: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          new_tier: string
          old_tier?: string | null
          stripe_payment_id?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          new_tier?: string
          old_tier?: string | null
          stripe_payment_id?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "healyn_upgrade_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "healaid_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      healaid_usage_tracking: {
        Row: {
          analyses_count: number | null
          created_at: string | null
          date: string
          id: string
          subscription_id: string | null
          uploads_count: number | null
          user_id: string
        }
        Insert: {
          analyses_count?: number | null
          created_at?: string | null
          date?: string
          id?: string
          subscription_id?: string | null
          uploads_count?: number | null
          user_id: string
        }
        Update: {
          analyses_count?: number | null
          created_at?: string | null
          date?: string
          id?: string
          subscription_id?: string | null
          uploads_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "healaid_usage_tracking_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "healaid_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      healing_progress: {
        Row: {
          analysis_result: Json
          created_at: string
          fever_symptoms: boolean | null
          has_tenderness: boolean | null
          healing_stage: string
          hot_to_touch: boolean | null
          id: string
          medical_references_used: Json | null
          photo_url: string
          photo_urls: string[] | null
          progress_score: number | null
          rash_description: string | null
          recommendations: string[]
          sensitive_to_touch: boolean | null
          user_id: string | null
          visible_rashes: boolean | null
        }
        Insert: {
          analysis_result: Json
          created_at?: string
          fever_symptoms?: boolean | null
          has_tenderness?: boolean | null
          healing_stage: string
          hot_to_touch?: boolean | null
          id?: string
          medical_references_used?: Json | null
          photo_url: string
          photo_urls?: string[] | null
          progress_score?: number | null
          rash_description?: string | null
          recommendations?: string[]
          sensitive_to_touch?: boolean | null
          user_id?: string | null
          visible_rashes?: boolean | null
        }
        Update: {
          analysis_result?: Json
          created_at?: string
          fever_symptoms?: boolean | null
          has_tenderness?: boolean | null
          healing_stage?: string
          hot_to_touch?: boolean | null
          id?: string
          medical_references_used?: Json | null
          photo_url?: string
          photo_urls?: string[] | null
          progress_score?: number | null
          rash_description?: string | null
          recommendations?: string[]
          sensitive_to_touch?: boolean | null
          user_id?: string | null
          visible_rashes?: boolean | null
        }
        Relationships: []
      }
      healing_qa_interactions: {
        Row: {
          analysis_context: Json
          answer_text: string
          created_at: string
          healing_progress_id: string | null
          id: string
          question_category: string | null
          question_text: string
          user_id: string | null
        }
        Insert: {
          analysis_context: Json
          answer_text: string
          created_at?: string
          healing_progress_id?: string | null
          id?: string
          question_category?: string | null
          question_text: string
          user_id?: string | null
        }
        Update: {
          analysis_context?: Json
          answer_text?: string
          created_at?: string
          healing_progress_id?: string | null
          id?: string
          question_category?: string | null
          question_text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "healing_qa_interactions_healing_progress_id_fkey"
            columns: ["healing_progress_id"]
            isOneToOne: false
            referencedRelation: "healing_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      healing_reminders: {
        Row: {
          action_url: string | null
          created_at: string | null
          delivery_method: string
          healing_progress_id: string | null
          id: string
          message: string
          metadata: Json | null
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          delivery_method?: string
          healing_progress_id?: string | null
          id?: string
          message: string
          metadata?: Json | null
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          delivery_method?: string
          healing_progress_id?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "healing_reminders_healing_progress_id_fkey"
            columns: ["healing_progress_id"]
            isOneToOne: false
            referencedRelation: "healing_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          created_at: string
          email: string
          failure_reason: string | null
          id: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      medical_references: {
        Row: {
          condition_category: string
          condition_name: string
          created_at: string | null
          created_by: string | null
          detailed_explanation: string
          evidence_strength: string | null
          id: string
          key_symptoms: string[]
          last_verified: string | null
          reference_title: string
          reference_url: string
          severity_level: string
          source_type: string
          visual_examples_url: string[] | null
          when_to_seek_care: string | null
        }
        Insert: {
          condition_category: string
          condition_name: string
          created_at?: string | null
          created_by?: string | null
          detailed_explanation: string
          evidence_strength?: string | null
          id?: string
          key_symptoms: string[]
          last_verified?: string | null
          reference_title: string
          reference_url: string
          severity_level: string
          source_type: string
          visual_examples_url?: string[] | null
          when_to_seek_care?: string | null
        }
        Update: {
          condition_category?: string
          condition_name?: string
          created_at?: string | null
          created_by?: string | null
          detailed_explanation?: string
          evidence_strength?: string | null
          id?: string
          key_symptoms?: string[]
          last_verified?: string | null
          reference_title?: string
          reference_url?: string
          severity_level?: string
          source_type?: string
          visual_examples_url?: string[] | null
          when_to_seek_care?: string | null
        }
        Relationships: []
      }
      mfa_sessions: {
        Row: {
          challenge_code: string
          created_at: string | null
          expires_at: string
          id: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          challenge_code: string
          created_at?: string | null
          expires_at: string
          id?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          challenge_code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      newsletter_signups: {
        Row: {
          active: boolean
          email: string
          id: string
          subscribed_at: string
        }
        Insert: {
          active?: boolean
          email: string
          id?: string
          subscribed_at?: string
        }
        Update: {
          active?: boolean
          email?: string
          id?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
          order_id: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
          order_id?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          email: string
          id: string
          is_guest: boolean | null
          product_id: string | null
          shipping_info: Json | null
          status: string | null
          stripe_session_id: string | null
          subscription_discount: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          email: string
          id?: string
          is_guest?: boolean | null
          product_id?: string | null
          shipping_info?: Json | null
          status?: string | null
          stripe_session_id?: string | null
          subscription_discount?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          email?: string
          id?: string
          is_guest?: boolean | null
          product_id?: string | null
          shipping_info?: Json | null
          status?: string | null
          stripe_session_id?: string | null
          subscription_discount?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      pii_access_log: {
        Row: {
          access_reason: string
          accessed_user_id: string
          admin_user_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          pii_type: string
        }
        Insert: {
          access_reason: string
          accessed_user_id: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          pii_type: string
        }
        Update: {
          access_reason?: string
          accessed_user_id?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          pii_type?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          most_popular: boolean | null
          name: string
          original_price: number | null
          popular: boolean | null
          price: number
          size: string | null
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          most_popular?: boolean | null
          name: string
          original_price?: number | null
          popular?: boolean | null
          price: number
          size?: string | null
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          most_popular?: boolean | null
          name?: string
          original_price?: number | null
          popular?: boolean | null
          price?: number
          size?: string | null
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          backup_codes: Json | null
          created_at: string | null
          email: string | null
          failed_mfa_attempts: number | null
          first_name: string | null
          id: string
          last_name: string | null
          mfa_enabled: boolean | null
          mfa_enforced_at: string | null
          mfa_locked_until: string | null
          mfa_secret: string | null
          updated_at: string | null
        }
        Insert: {
          backup_codes?: Json | null
          created_at?: string | null
          email?: string | null
          failed_mfa_attempts?: number | null
          first_name?: string | null
          id: string
          last_name?: string | null
          mfa_enabled?: boolean | null
          mfa_enforced_at?: string | null
          mfa_locked_until?: string | null
          mfa_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          backup_codes?: Json | null
          created_at?: string | null
          email?: string | null
          failed_mfa_attempts?: number | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          mfa_enabled?: boolean | null
          mfa_enforced_at?: string | null
          mfa_locked_until?: string | null
          mfa_secret?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          active: boolean
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh_key: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh_key: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh_key?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rate_limit_violations: {
        Row: {
          action_type: string
          blocked_until: string | null
          first_violation_at: string
          id: string
          identifier: string
          last_violation_at: string
          violation_count: number
        }
        Insert: {
          action_type: string
          blocked_until?: string | null
          first_violation_at?: string
          id?: string
          identifier: string
          last_violation_at?: string
          violation_count?: number
        }
        Update: {
          action_type?: string
          blocked_until?: string | null
          first_violation_at?: string
          id?: string
          identifier?: string
          last_violation_at?: string
          violation_count?: number
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      reminder_templates: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          hours_after_tattoo: number
          id: string
          message_template: string
          priority: number | null
          reminder_type: string
          requires_conditions: Json | null
          template_name: string
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          hours_after_tattoo: number
          id?: string
          message_template: string
          priority?: number | null
          reminder_type: string
          requires_conditions?: Json | null
          template_name: string
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          hours_after_tattoo?: number
          id?: string
          message_template?: string
          priority?: number | null
          reminder_type?: string
          requires_conditions?: Json | null
          template_name?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      shipment_reminders: {
        Row: {
          created_at: string
          email_recipient: string
          id: string
          message_template: string | null
          metadata: Json | null
          order_id: string
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          shipment_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_recipient: string
          id?: string
          message_template?: string | null
          metadata?: Json | null
          order_id: string
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          shipment_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_recipient?: string
          id?: string
          message_template?: string | null
          metadata?: Json | null
          order_id?: string
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          shipment_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_reminders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_reminders_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          carrier: string | null
          created_at: string
          currency: string | null
          delivered_at: string | null
          id: string
          label_url: string | null
          order_id: string | null
          service_level: string | null
          shipped_at: string | null
          shipping_cost: number | null
          shippo_tracking_number: string | null
          shippo_transaction_id: string | null
          tracking_status: string | null
          tracking_url: string | null
          updated_at: string
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          currency?: string | null
          delivered_at?: string | null
          id?: string
          label_url?: string | null
          order_id?: string | null
          service_level?: string | null
          shipped_at?: string | null
          shipping_cost?: number | null
          shippo_tracking_number?: string | null
          shippo_transaction_id?: string | null
          tracking_status?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Update: {
          carrier?: string | null
          created_at?: string
          currency?: string | null
          delivered_at?: string | null
          id?: string
          label_url?: string | null
          order_id?: string | null
          service_level?: string | null
          shipped_at?: string | null
          shipping_cost?: number | null
          shippo_tracking_number?: string | null
          shippo_transaction_id?: string | null
          tracking_status?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_addresses: {
        Row: {
          city: string
          company: string | null
          country: string
          created_at: string
          email: string | null
          id: string
          is_validated: boolean | null
          name: string
          order_id: string | null
          phone: string | null
          shippo_address_id: string | null
          state: string
          street1: string
          street2: string | null
          zip: string
        }
        Insert: {
          city: string
          company?: string | null
          country?: string
          created_at?: string
          email?: string | null
          id?: string
          is_validated?: boolean | null
          name: string
          order_id?: string | null
          phone?: string | null
          shippo_address_id?: string | null
          state: string
          street1: string
          street2?: string | null
          zip: string
        }
        Update: {
          city?: string
          company?: string | null
          country?: string
          created_at?: string
          email?: string | null
          id?: string
          is_validated?: boolean | null
          name?: string
          order_id?: string | null
          phone?: string | null
          shippo_address_id?: string | null
          state?: string
          street1?: string
          street2?: string | null
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_addresses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_rates: {
        Row: {
          amount: number
          carrier: string
          created_at: string
          currency: string | null
          estimated_days: number | null
          id: string
          order_id: string | null
          rate_id: string
          service_level: string
        }
        Insert: {
          amount: number
          carrier: string
          created_at?: string
          currency?: string | null
          estimated_days?: number | null
          id?: string
          order_id?: string | null
          rate_id: string
          service_level: string
        }
        Update: {
          amount?: number
          carrier?: string
          created_at?: string
          currency?: string | null
          estimated_days?: number | null
          id?: string
          order_id?: string | null
          rate_id?: string
          service_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_rates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          created_at: string | null
          id: string
          key: string
          type: string | null
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          type?: string | null
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          type?: string | null
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tts_settings: {
        Row: {
          id: string
          pitch: number
          rate: number
          updated_at: string
          updated_by: string | null
          voice_name: string | null
          volume: number
        }
        Insert: {
          id?: string
          pitch?: number
          rate?: number
          updated_at?: string
          updated_by?: string | null
          voice_name?: string | null
          volume?: number
        }
        Update: {
          id?: string
          pitch?: number
          rate?: number
          updated_at?: string
          updated_by?: string | null
          voice_name?: string | null
          volume?: number
        }
        Relationships: []
      }
      user_demographics: {
        Row: {
          age_group: string | null
          count: number
          created_at: string
          date: string
          gender: string | null
          id: string
          region: string | null
          source: string | null
        }
        Insert: {
          age_group?: string | null
          count?: number
          created_at?: string
          date: string
          gender?: string | null
          id?: string
          region?: string | null
          source?: string | null
        }
        Update: {
          age_group?: string | null
          count?: number
          created_at?: string
          date?: string
          gender?: string | null
          id?: string
          region?: string | null
          source?: string | null
        }
        Relationships: []
      }
      user_reminder_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          reminder_types: Json | null
          snooze_duration_hours: number | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_types?: Json | null
          snooze_duration_hours?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_types?: Json | null
          snooze_duration_hours?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      website_metrics: {
        Row: {
          created_at: string
          date: string
          id: string
          metadata: Json | null
          metric_type: string
          value: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          metadata?: Json | null
          metric_type: string
          value: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          value?: number
        }
        Relationships: []
      }
    }
    Views: {
      approved_customer_reviews: {
        Row: {
          content: string | null
          created_at: string | null
          id: string | null
          name: string | null
          rating: number | null
          title: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          rating?: number | null
          title?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          rating?: number | null
          title?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_approved_reviews: {
        Args: Record<PropertyKey, never>
        Returns: {
          content: string
          created_at: string
          id: string
          name: string
          rating: number
          title: string
        }[]
      }
      has_active_healaid_subscription: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      increment_daily_metric: {
        Args: { metric_date: string; metric_name: string }
        Returns: undefined
      }
      is_account_locked: {
        Args: { check_email: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      log_login_attempt: {
        Args: {
          attempt_email: string
          attempt_failure_reason?: string
          attempt_ip: string
          attempt_success: boolean
          attempt_user_agent: string
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "user"
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
      user_role: ["admin", "user"],
    },
  },
} as const
