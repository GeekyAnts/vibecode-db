export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          username: string | null;
          avatar_url: string;
          bio: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          username?: string | null;
          avatar_url?: string;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          username?: string | null;
          avatar_url?: string;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          instructor_name: string;
          instructor_avatar: string;
          category: "programming" | "design" | "business" | "marketing" | "data-science" | "ai-ml";
          difficulty: "beginner" | "intermediate" | "advanced";
          duration_hours: number;
          image_url: string;
          rating: number;
          enrolled_count: number;
          lessons_count: number;
          price: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          instructor_name?: string;
          instructor_avatar?: string;
          category: "programming" | "design" | "business" | "marketing" | "data-science" | "ai-ml";
          difficulty: "beginner" | "intermediate" | "advanced";
          duration_hours?: number;
          image_url?: string;
          rating?: number;
          enrolled_count?: number;
          lessons_count?: number;
          price?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          instructor_name?: string;
          instructor_avatar?: string;
          category?: "programming" | "design" | "business" | "marketing" | "data-science" | "ai-ml";
          difficulty?: "beginner" | "intermediate" | "advanced";
          duration_hours?: number;
          image_url?: string;
          rating?: number;
          enrolled_count?: number;
          lessons_count?: number;
          price?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          content: string;
          duration_minutes: number;
          order_index: number;
          video_url: string;
          is_free: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string;
          content?: string;
          duration_minutes?: number;
          order_index?: number;
          video_url?: string;
          is_free?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string;
          content?: string;
          duration_minutes?: number;
          order_index?: number;
          video_url?: string;
          is_free?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          progress_percentage: number;
          started_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          progress_percentage?: number;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          progress_percentage?: number;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          is_completed: boolean;
          watched_seconds: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          is_completed?: boolean;
          watched_seconds?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          is_completed?: boolean;
          watched_seconds?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          content: string;
          timestamp_seconds: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          content: string;
          timestamp_seconds?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          content?: string;
          timestamp_seconds?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      certificates: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          issued_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          issued_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          issued_at?: string;
          created_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          created_at?: string;
        };
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
  };
}

// ============================================================
// Convenience type aliases
// ============================================================
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type Course = Tables<"courses">;
export type Lesson = Tables<"lessons">;
export type Enrollment = Tables<"enrollments">;
export type LessonProgress = Tables<"lesson_progress">;
export type Note = Tables<"notes">;
export type Certificate = Tables<"certificates">;
export type Bookmark = Tables<"bookmarks">;

export type CourseCategory = Course["category"];
export type CourseDifficulty = Course["difficulty"];
