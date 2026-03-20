import { vibecodeTable, col, defineSchema, type DBSpec } from '@vibecode-db/client'

// ============================================================================
// Table Definitions
// ============================================================================

export const profiles = vibecodeTable('profiles', {
  id: col.varchar().primaryKey().comment('Profile ID (same as user ID)'),
  user_id: col.varchar().notNull().unique().index().comment('Auth user ID (UUID)'),
  username: col.varchar({ length: 50 }).comment('Unique username'),
  full_name: col.varchar({ length: 100 }).comment('Full display name'),
  avatar_url: col.varchar({ length: 500 }).comment('Profile picture URL'),
  bio: col.varchar().comment('User biography'),
  created_at: col.timestamp().notNull().comment('Creation timestamp'),
  updated_at: col.timestamp().notNull().comment('Last update timestamp'),
})

export const courses = vibecodeTable('courses', {
  id: col.varchar().primaryKey().comment('Unique course identifier'),
  title: col.varchar({ length: 256 }).notNull().comment('Course title'),
  description: col.varchar().notNull().comment('Course description'),
  instructor_name: col.varchar({ length: 100 }).notNull().comment('Instructor name'),
  instructor_avatar: col.varchar({ length: 500 }).comment('Instructor avatar URL'),
  category: col.varchar({ length: 50 }).notNull().index().comment('Course category'),
  difficulty: col.varchar({ length: 20 }).notNull().comment('beginner | intermediate | advanced'),
  duration_hours: col.integer().notNull().comment('Total course duration in hours'),
  image_url: col.varchar({ length: 500 }).comment('Course cover image'),
  rating: col.integer().comment('Average rating (1-5 scaled by 10)'),
  enrolled_count: col.integer().notNull().comment('Number of enrolled students'),
  lessons_count: col.integer().notNull().comment('Total lessons'),
  price: col.integer().comment('Price in cents (0 = free)'),
  is_published: col.boolean().notNull().comment('Publication status'),
  created_at: col.timestamp().notNull().comment('Creation timestamp'),
  updated_at: col.timestamp().notNull().comment('Last update timestamp'),
})

export const lessons = vibecodeTable('lessons', {
  id: col.varchar().primaryKey().comment('Unique lesson identifier'),
  course_id: col.varchar().notNull().index().comment('Parent course ID'),
  title: col.varchar({ length: 256 }).notNull().comment('Lesson title'),
  description: col.varchar().comment('Lesson description'),
  content: col.varchar().comment('Lesson text content / notes'),
  duration_minutes: col.integer().notNull().comment('Lesson duration in minutes'),
  order_index: col.integer().notNull().comment('Order within the course'),
  video_url: col.varchar({ length: 500 }).comment('Video URL'),
  is_free: col.boolean().notNull().comment('Whether lesson is free preview'),
  created_at: col.timestamp().notNull().comment('Creation timestamp'),
  updated_at: col.timestamp().notNull().comment('Last update timestamp'),
})

export const enrollments = vibecodeTable('enrollments', {
  id: col.varchar().primaryKey().comment('Unique enrollment identifier'),
  user_id: col.varchar().notNull().index().comment('User ID'),
  course_id: col.varchar().notNull().index().comment('Course ID'),
  progress_percentage: col.integer().notNull().comment('Progress 0-100'),
  started_at: col.timestamp().notNull().comment('Enrollment date'),
  completed_at: col.timestamp().comment('Completion date'),
  created_at: col.timestamp().notNull().comment('Creation timestamp'),
  updated_at: col.timestamp().notNull().comment('Last update timestamp'),
})

export const lesson_progress = vibecodeTable('lesson_progress', {
  id: col.varchar().primaryKey().comment('Unique progress identifier'),
  user_id: col.varchar().notNull().index().comment('User ID'),
  lesson_id: col.varchar().notNull().index().comment('Lesson ID'),
  is_completed: col.boolean().notNull().comment('Completion status'),
  watched_seconds: col.integer().notNull().comment('Seconds watched'),
  completed_at: col.timestamp().comment('Completion timestamp'),
  created_at: col.timestamp().notNull().comment('Creation timestamp'),
  updated_at: col.timestamp().notNull().comment('Last update timestamp'),
})

export const notes = vibecodeTable('notes', {
  id: col.varchar().primaryKey().comment('Unique note identifier'),
  user_id: col.varchar().notNull().index().comment('User ID'),
  lesson_id: col.varchar().notNull().index().comment('Lesson ID'),
  content: col.varchar().notNull().comment('Note content'),
  timestamp_seconds: col.integer().comment('Video timestamp for this note'),
  created_at: col.timestamp().notNull().comment('Creation timestamp'),
  updated_at: col.timestamp().notNull().comment('Last update timestamp'),
})

export const certificates = vibecodeTable('certificates', {
  id: col.varchar().primaryKey().comment('Unique certificate identifier'),
  user_id: col.varchar().notNull().index().comment('User ID'),
  course_id: col.varchar().notNull().index().comment('Course ID'),
  issued_at: col.timestamp().notNull().comment('Issue date'),
  created_at: col.timestamp().notNull().comment('Creation timestamp'),
})

export const bookmarks = vibecodeTable('bookmarks', {
  id: col.varchar().primaryKey().comment('Unique bookmark identifier'),
  user_id: col.varchar().notNull().index().comment('User ID'),
  course_id: col.varchar().notNull().index().comment('Course ID'),
  created_at: col.timestamp().notNull().comment('Creation timestamp'),
})

// ============================================================================
// Schema Definition
// ============================================================================

export const db = defineSchema({
  profiles,
  courses,
  lessons,
  enrollments,
  lesson_progress,
  notes,
  certificates,
  bookmarks,
})

export const dbSpec: DBSpec<typeof db.zodBundle.shape> = {
  schema: db.zodBundle,
  relations: db.relations,
  seed: {
    profiles: [],
    courses: [],
    lessons: [],
    enrollments: [],
    lesson_progress: [],
    notes: [],
    certificates: [],
    bookmarks: [],
  },
}

export const migrations = db.migrations

// ============================================================================
// Type Exports
// ============================================================================

export type Profile = {
  id: string
  user_id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string | Date
  updated_at: string | Date
}

export type Course = {
  id: string
  title: string
  description: string
  instructor_name: string
  instructor_avatar: string | null
  category: string
  difficulty: string
  duration_hours: number
  image_url: string | null
  rating: number | null
  enrolled_count: number
  lessons_count: number
  price: number | null
  is_published: boolean
  created_at: string | Date
  updated_at: string | Date
}

export type Lesson = {
  id: string
  course_id: string
  title: string
  description: string | null
  content: string | null
  duration_minutes: number
  order_index: number
  video_url: string | null
  is_free: boolean
  created_at: string | Date
  updated_at: string | Date
}

export type Enrollment = {
  id: string
  user_id: string
  course_id: string
  progress_percentage: number
  started_at: string | Date
  completed_at: string | Date | null
  created_at: string | Date
  updated_at: string | Date
}

export type LessonProgress = {
  id: string
  user_id: string
  lesson_id: string
  is_completed: boolean
  watched_seconds: number
  completed_at: string | Date | null
  created_at: string | Date
  updated_at: string | Date
}

export type Note = {
  id: string
  user_id: string
  lesson_id: string
  content: string
  timestamp_seconds: number | null
  created_at: string | Date
  updated_at: string | Date
}

export type Certificate = {
  id: string
  user_id: string
  course_id: string
  issued_at: string | Date
  created_at: string | Date
}

export type Bookmark = {
  id: string
  user_id: string
  course_id: string
  created_at: string | Date
}

export type User = {
  id: string
  email: string
  emailVerified?: boolean
  name?: string
  avatarUrl?: string
  createdAt?: Date
  updatedAt?: Date
  metadata?: Record<string, unknown>
}
