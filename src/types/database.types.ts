export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          streak_count: number;
          last_active_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          streak_count?: number;
          last_active_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          streak_count?: number;
          last_active_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      topics: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          category: string;
          learning_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          category: string;
          learning_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          category?: string;
          learning_path?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      flashcards: {
        Row: {
          id: string;
          topic_id: string;
          front_content: string;
          back_content: string;
          code_snippet: string | null;
          card_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          front_content: string;
          back_content: string;
          code_snippet?: string | null;
          card_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          front_content?: string;
          back_content?: string;
          code_snippet?: string | null;
          card_type?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'flashcards_topic_id_fkey';
            columns: ['topic_id'];
            isOneToOne: false;
            referencedRelation: 'topics';
            referencedColumns: ['id'];
          },
        ];
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          flashcard_id: string;
          repetitions: number;
          interval_days: number;
          ease_factor: number;
          next_review_at: string;
          last_quality: number | null;
          is_mastered: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          flashcard_id: string;
          repetitions?: number;
          interval_days?: number;
          ease_factor?: number;
          next_review_at?: string;
          last_quality?: number | null;
          is_mastered?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          flashcard_id?: string;
          repetitions?: number;
          interval_days?: number;
          ease_factor?: number;
          next_review_at?: string;
          last_quality?: number | null;
          is_mastered?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          studied_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          studied_on: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          studied_on?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      learning_paths: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          slug: string;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          slug: string;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          slug?: string;
          icon?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      path_nodes: {
        Row: {
          id: string;
          path_id: string;
          title: string;
          description: string | null;
          topic_slug: string | null;
          step_order: number;
          position_x: number;
          position_y: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          path_id: string;
          title: string;
          description?: string | null;
          topic_slug?: string | null;
          step_order: number;
          position_x?: number;
          position_y?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          path_id?: string;
          title?: string;
          description?: string | null;
          topic_slug?: string | null;
          step_order?: number;
          position_x?: number;
          position_y?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'path_nodes_path_id_fkey';
            columns: ['path_id'];
            isOneToOne: false;
            referencedRelation: 'learning_paths';
            referencedColumns: ['id'];
          },
        ];
      };
      user_path_progress: {
        Row: {
          id: string;
          user_id: string;
          node_id: string;
          status: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          node_id: string;
          status?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          node_id?: string;
          status?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      user_stats: {
        Row: {
          user_id: string;
          cards_learned_total: number;
          daily_goal_target: number;
          daily_cards_completed: number;
          current_streak: number;
          last_study_date: string | null;
          xp: number;
          last_topic_slug: string | null;
        };
        Insert: {
          user_id: string;
          cards_learned_total?: number;
          daily_goal_target?: number;
          daily_cards_completed?: number;
          current_streak?: number;
          last_study_date?: string | null;
          xp?: number;
          last_topic_slug?: string | null;
        };
        Update: {
          user_id?: string;
          cards_learned_total?: number;
          daily_goal_target?: number;
          daily_cards_completed?: number;
          current_streak?: number;
          last_study_date?: string | null;
          xp?: number;
          last_topic_slug?: string | null;
        };
        Relationships: [];
      };
      blogs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          is_published: boolean;
          author: string;
          created_at: string;
          topic_slug: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          is_published?: boolean;
          author?: string;
          created_at?: string;
          topic_slug?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          is_published?: boolean;
          author?: string;
          created_at?: string;
          topic_slug?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
