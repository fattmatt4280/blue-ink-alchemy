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
          created_at: string | null
          email: string
          expiration_date: string
          id: string
          is_active: boolean | null
          start_date: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activation_code?: string | null
          created_at?: string | null
          email: string
          expiration_date: string
          id?: string
          is_active?: boolean | null
          start_date?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activation_code?: string | null
          created_at?: string | null
          email?: string
          expiration_date?: string
          id?: string
          is_active?: boolean | null
          start_date?: string | null
          stripe_customer_id?: string | null
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
      healing_progress: {
        Row: {
          analysis_result: Json
          created_at: string
          healing_stage: string
          id: string
          photo_url: string
          photo_urls: string[] | null
          progress_score: number | null
          recommendations: string[]
          user_id: string | null
        }
        Insert: {
          analysis_result: Json
          created_at?: string
          healing_stage: string
          id?: string
          photo_url: string
          photo_urls?: string[] | null
          progress_score?: number | null
          recommendations?: string[]
          user_id?: string | null
        }
        Update: {
          analysis_result?: Json
          created_at?: string
          healing_stage?: string
          id?: string
          photo_url?: string
          photo_urls?: string[] | null
          progress_score?: number | null
          recommendations?: string[]
          user_id?: string | null
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
          created_at: string | null
          email: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
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
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
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
