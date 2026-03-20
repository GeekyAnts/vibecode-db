-- ============================================================
-- Seed data for e-learning app
-- ============================================================

-- Deterministic UUIDs for test users
-- alice: 00000000-0000-0000-0000-000000000001
-- bob:   00000000-0000-0000-0000-000000000002
-- carol: 00000000-0000-0000-0000-000000000003

-- ============================================================
-- Profiles
-- ============================================================
insert into public.profiles (id, email, full_name, username, avatar_url, bio) values
  ('00000000-0000-0000-0000-000000000001', 'alice@example.com', 'Alice Johnson', 'alice', 'https://i.pravatar.cc/150?u=alice', 'Full-stack developer passionate about React Native and mobile apps.'),
  ('00000000-0000-0000-0000-000000000002', 'bob@example.com', 'Bob Martinez', 'bob', 'https://i.pravatar.cc/150?u=bob', 'UX designer who loves creating beautiful and intuitive interfaces.'),
  ('00000000-0000-0000-0000-000000000003', 'carol@example.com', 'Carol Chen', 'carol', 'https://i.pravatar.cc/150?u=carol', 'Data scientist and AI enthusiast exploring the future of machine learning.');

-- ============================================================
-- Courses
-- ============================================================

-- Course 1: Programming - React Native
insert into public.courses (id, title, description, instructor_name, instructor_avatar, category, difficulty, duration_hours, image_url, rating, enrolled_count, lessons_count, price, is_published) values
  ('c0000000-0000-0000-0000-000000000001',
   'React Native Masterclass',
   'Build production-ready mobile apps with React Native. Learn navigation, state management, animations, and native modules from scratch.',
   'Sarah Wilson',
   'https://i.pravatar.cc/150?u=sarah',
   'programming', 'intermediate', 24,
   'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
   4.8, 3420, 5, 49.99, true);

-- Course 2: Programming - TypeScript
insert into public.courses (id, title, description, instructor_name, instructor_avatar, category, difficulty, duration_hours, image_url, rating, enrolled_count, lessons_count, price, is_published) values
  ('c0000000-0000-0000-0000-000000000002',
   'TypeScript Deep Dive',
   'Master TypeScript from basic types to advanced generics, decorators, and compiler API. Includes real-world project patterns.',
   'James Park',
   'https://i.pravatar.cc/150?u=james',
   'programming', 'advanced', 18,
   'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
   4.6, 2150, 4, 39.99, true);

-- Course 3: Design - UI/UX Fundamentals
insert into public.courses (id, title, description, instructor_name, instructor_avatar, category, difficulty, duration_hours, image_url, rating, enrolled_count, lessons_count, price, is_published) values
  ('c0000000-0000-0000-0000-000000000003',
   'UI/UX Design Fundamentals',
   'Learn the principles of great user interface and experience design. From wireframes to high-fidelity prototypes using Figma.',
   'Emily Zhang',
   'https://i.pravatar.cc/150?u=emily',
   'design', 'beginner', 12,
   'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
   4.7, 4810, 4, 29.99, true);

-- Course 4: Design - Motion Design
insert into public.courses (id, title, description, instructor_name, instructor_avatar, category, difficulty, duration_hours, image_url, rating, enrolled_count, lessons_count, price, is_published) values
  ('c0000000-0000-0000-0000-000000000004',
   'Motion Design for Apps',
   'Create stunning micro-interactions and animations that delight users. Covers Lottie, Reanimated, and After Effects workflows.',
   'Marcus Rivera',
   'https://i.pravatar.cc/150?u=marcus',
   'design', 'intermediate', 10,
   'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
   4.5, 1890, 3, 34.99, true);

-- Course 5: Business - Product Management
insert into public.courses (id, title, description, instructor_name, instructor_avatar, category, difficulty, duration_hours, image_url, rating, enrolled_count, lessons_count, price, is_published) values
  ('c0000000-0000-0000-0000-000000000005',
   'Product Management Essentials',
   'Learn how to define product strategy, prioritize features, run sprints, and ship products users love. Real case studies from top startups.',
   'David Kim',
   'https://i.pravatar.cc/150?u=david',
   'business', 'beginner', 8,
   'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
   4.4, 3100, 3, 24.99, true);

-- Course 6: Business - Startup Finance
insert into public.courses (id, title, description, instructor_name, instructor_avatar, category, difficulty, duration_hours, image_url, rating, enrolled_count, lessons_count, price, is_published) values
  ('c0000000-0000-0000-0000-000000000006',
   'Startup Finance & Fundraising',
   'Understand financial modeling, unit economics, pitch decks, and fundraising strategies for early-stage startups.',
   'Rachel Adams',
   'https://i.pravatar.cc/150?u=rachel',
   'business', 'intermediate', 14,
   'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
   4.3, 1560, 3, 44.99, true);

-- Course 7: Marketing - Growth Hacking
insert into public.courses (id, title, description, instructor_name, instructor_avatar, category, difficulty, duration_hours, image_url, rating, enrolled_count, lessons_count, price, is_published) values
  ('c0000000-0000-0000-0000-000000000007',
   'Growth Hacking Strategies',
   'Master acquisition funnels, viral loops, retention tactics, and data-driven marketing. Learn frameworks used by top growth teams.',
   'Olivia Thompson',
   'https://i.pravatar.cc/150?u=olivia',
   'marketing', 'intermediate', 11,
   'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800',
   4.6, 2780, 3, 34.99, true);

-- Course 8: Data Science - Python for Data Analysis
insert into public.courses (id, title, description, instructor_name, instructor_avatar, category, difficulty, duration_hours, image_url, rating, enrolled_count, lessons_count, price, is_published) values
  ('c0000000-0000-0000-0000-000000000008',
   'Python for Data Analysis',
   'Analyze real-world datasets with Python, Pandas, NumPy, and Matplotlib. Build dashboards and predictive models from scratch.',
   'Alex Nguyen',
   'https://i.pravatar.cc/150?u=alex',
   'data-science', 'beginner', 20,
   'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
   4.7, 5230, 5, 39.99, true);

-- ============================================================
-- Lessons
-- ============================================================

-- Course 1: React Native Masterclass (5 lessons)
insert into public.lessons (id, course_id, title, description, content, duration_minutes, order_index, video_url, is_free) values
  ('l0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
   'Getting Started with React Native',
   'Set up your development environment and create your first app.',
   'In this lesson we cover Expo setup, project structure, and running on simulators.',
   45, 1, 'https://example.com/videos/rn-01.mp4', true),
  ('l0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001',
   'Core Components & Styling',
   'Learn View, Text, Image, ScrollView, and the StyleSheet API.',
   'Deep dive into the core building blocks of React Native UIs and Flexbox layout.',
   60, 2, 'https://example.com/videos/rn-02.mp4', false),
  ('l0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001',
   'Navigation with Expo Router',
   'Implement file-based routing, tabs, stacks, and deep linking.',
   'We build a multi-screen app using Expo Router with nested navigators.',
   55, 3, 'https://example.com/videos/rn-03.mp4', false),
  ('l0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001',
   'State Management Patterns',
   'Compare Context, Zustand, and React Query for different use cases.',
   'Practical examples of local state, global state, and server state management.',
   50, 4, 'https://example.com/videos/rn-04.mp4', false),
  ('l0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001',
   'Animations & Gestures',
   'Create fluid animations with Reanimated and gesture handlers.',
   'Build swipeable cards, shared transitions, and spring-based animations.',
   65, 5, 'https://example.com/videos/rn-05.mp4', false);

-- Course 2: TypeScript Deep Dive (4 lessons)
insert into public.lessons (id, course_id, title, description, content, duration_minutes, order_index, video_url, is_free) values
  ('l0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002',
   'TypeScript Fundamentals',
   'Types, interfaces, enums, and type inference basics.',
   'Start from JavaScript and progressively add type safety to your codebase.',
   50, 1, 'https://example.com/videos/ts-01.mp4', true),
  ('l0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002',
   'Advanced Types & Generics',
   'Conditional types, mapped types, template literals, and generic constraints.',
   'Master the type system to write reusable, type-safe utilities.',
   65, 2, 'https://example.com/videos/ts-02.mp4', false),
  ('l0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000002',
   'Decorators & Metadata',
   'Use experimental decorators for DI, validation, and ORM patterns.',
   'Build a mini dependency injection framework using TypeScript decorators.',
   55, 3, 'https://example.com/videos/ts-03.mp4', false),
  ('l0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000002',
   'Project Patterns & Best Practices',
   'Monorepos, barrel exports, strict config, and migration strategies.',
   'Real-world patterns for large TypeScript codebases.',
   60, 4, 'https://example.com/videos/ts-04.mp4', false);

-- Course 3: UI/UX Design Fundamentals (4 lessons)
insert into public.lessons (id, course_id, title, description, content, duration_minutes, order_index, video_url, is_free) values
  ('l0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000003',
   'Design Thinking Process',
   'Empathize, define, ideate, prototype, and test.',
   'Learn the human-centered design process used by top product teams.',
   40, 1, 'https://example.com/videos/ux-01.mp4', true),
  ('l0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000003',
   'Wireframing & Prototyping',
   'From paper sketches to interactive Figma prototypes.',
   'Hands-on wireframing exercises and Figma prototype building.',
   55, 2, 'https://example.com/videos/ux-02.mp4', false),
  ('l0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000003',
   'Color Theory & Typography',
   'Choose palettes, type scales, and build a design system.',
   'Practical color and typography decisions for digital products.',
   45, 3, 'https://example.com/videos/ux-03.mp4', false),
  ('l0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000003',
   'Usability Testing',
   'Plan, conduct, and analyze user tests to validate designs.',
   'Run moderated and unmoderated usability tests with real users.',
   50, 4, 'https://example.com/videos/ux-04.mp4', false);

-- Course 4: Motion Design for Apps (3 lessons)
insert into public.lessons (id, course_id, title, description, content, duration_minutes, order_index, video_url, is_free) values
  ('l0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000004',
   'Principles of Motion',
   'Timing, easing, and the 12 principles of animation applied to UI.',
   'Understand why motion matters and how to make it feel natural.',
   45, 1, 'https://example.com/videos/md-01.mp4', true),
  ('l0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000004',
   'Lottie Animations',
   'Export from After Effects, integrate in React Native with lottie-react-native.',
   'Create and embed complex vector animations in your mobile app.',
   50, 2, 'https://example.com/videos/md-02.mp4', false),
  ('l0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000004',
   'Reanimated Shared Transitions',
   'Build shared element transitions and layout animations.',
   'Advanced Reanimated patterns for seamless screen transitions.',
   55, 3, 'https://example.com/videos/md-03.mp4', false);

-- Course 5: Product Management Essentials (3 lessons)
insert into public.lessons (id, course_id, title, description, content, duration_minutes, order_index, video_url, is_free) values
  ('l0000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000005',
   'What Is Product Management?',
   'Role overview, skills, and the product lifecycle.',
   'Understand where PM fits in an organization and what great PMs do.',
   35, 1, 'https://example.com/videos/pm-01.mp4', true),
  ('l0000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000005',
   'Roadmapping & Prioritization',
   'Build roadmaps using RICE, MoSCoW, and opportunity scoring.',
   'Practical frameworks for deciding what to build next.',
   45, 2, 'https://example.com/videos/pm-02.mp4', false),
  ('l0000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000005',
   'Agile & Sprint Planning',
   'Run effective sprints, standups, and retrospectives.',
   'Agile methodology applied to real product teams.',
   40, 3, 'https://example.com/videos/pm-03.mp4', false);

-- Course 6: Startup Finance & Fundraising (3 lessons)
insert into public.lessons (id, course_id, title, description, content, duration_minutes, order_index, video_url, is_free) values
  ('l0000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000006',
   'Financial Modeling Basics',
   'Build a startup financial model from scratch in a spreadsheet.',
   'Revenue projections, cost structures, and break-even analysis.',
   50, 1, 'https://example.com/videos/sf-01.mp4', true),
  ('l0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000006',
   'Unit Economics & Metrics',
   'CAC, LTV, burn rate, and the metrics investors care about.',
   'Calculate and present key financial metrics for your startup.',
   55, 2, 'https://example.com/videos/sf-02.mp4', false),
  ('l0000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000006',
   'Pitch Deck & Fundraising',
   'Structure a compelling pitch and navigate the fundraising process.',
   'Template-driven approach to creating investor-ready presentations.',
   60, 3, 'https://example.com/videos/sf-03.mp4', false);

-- Course 7: Growth Hacking Strategies (3 lessons)
insert into public.lessons (id, course_id, title, description, content, duration_minutes, order_index, video_url, is_free) values
  ('l0000000-0000-0000-0000-000000000023', 'c0000000-0000-0000-0000-000000000007',
   'The Growth Framework',
   'AARRR pirate metrics and the growth experiment loop.',
   'Set up a systematic approach to growth with measurable experiments.',
   40, 1, 'https://example.com/videos/gh-01.mp4', true),
  ('l0000000-0000-0000-0000-000000000024', 'c0000000-0000-0000-0000-000000000007',
   'Viral Loops & Referrals',
   'Design referral programs and viral mechanics that scale.',
   'Case studies from Dropbox, Airbnb, and other viral products.',
   45, 2, 'https://example.com/videos/gh-02.mp4', false),
  ('l0000000-0000-0000-0000-000000000025', 'c0000000-0000-0000-0000-000000000007',
   'Retention & Engagement',
   'Cohort analysis, push notifications, and re-engagement campaigns.',
   'Keep users coming back with data-driven retention strategies.',
   50, 3, 'https://example.com/videos/gh-03.mp4', false);

-- Course 8: Python for Data Analysis (5 lessons)
insert into public.lessons (id, course_id, title, description, content, duration_minutes, order_index, video_url, is_free) values
  ('l0000000-0000-0000-0000-000000000026', 'c0000000-0000-0000-0000-000000000008',
   'Python & Jupyter Setup',
   'Install Python, set up virtual environments, and launch Jupyter notebooks.',
   'Get your data science environment ready in minutes.',
   30, 1, 'https://example.com/videos/py-01.mp4', true),
  ('l0000000-0000-0000-0000-000000000027', 'c0000000-0000-0000-0000-000000000008',
   'Pandas Essentials',
   'DataFrames, Series, indexing, filtering, and aggregation.',
   'Master the most important library for tabular data manipulation.',
   55, 2, 'https://example.com/videos/py-02.mp4', false),
  ('l0000000-0000-0000-0000-000000000028', 'c0000000-0000-0000-0000-000000000008',
   'Data Cleaning & Wrangling',
   'Handle missing values, duplicates, outliers, and data type issues.',
   'Real-world data is messy - learn how to tame it.',
   50, 3, 'https://example.com/videos/py-03.mp4', false),
  ('l0000000-0000-0000-0000-000000000029', 'c0000000-0000-0000-0000-000000000008',
   'Visualization with Matplotlib',
   'Create bar charts, scatter plots, histograms, and custom dashboards.',
   'Tell compelling stories with data through effective visualizations.',
   45, 4, 'https://example.com/videos/py-04.mp4', false),
  ('l0000000-0000-0000-0000-000000000030', 'c0000000-0000-0000-0000-000000000008',
   'Intro to Predictive Modeling',
   'Linear regression, train/test split, and model evaluation basics.',
   'Build your first predictive model using scikit-learn.',
   60, 5, 'https://example.com/videos/py-05.mp4', false);

-- ============================================================
-- Enrollments for Alice (4 courses at various progress)
-- ============================================================
insert into public.enrollments (id, user_id, course_id, progress_percentage, started_at, completed_at) values
  ('e0000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000001',
   100, '2025-11-01T10:00:00Z', '2025-12-15T14:30:00Z'),
  ('e0000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000003',
   75, '2025-12-01T09:00:00Z', null),
  ('e0000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000005',
   33, '2026-01-10T11:00:00Z', null),
  ('e0000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000008',
   20, '2026-02-15T08:00:00Z', null);

-- ============================================================
-- Lesson progress for Alice
-- ============================================================

-- React Native Masterclass: all 5 completed
insert into public.lesson_progress (id, user_id, lesson_id, is_completed, watched_seconds, completed_at) values
  ('lp000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000001', true, 2700, '2025-11-05T12:00:00Z'),
  ('lp000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000002', true, 3600, '2025-11-12T14:00:00Z'),
  ('lp000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000003', true, 3300, '2025-11-20T10:00:00Z'),
  ('lp000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000004', true, 3000, '2025-12-01T16:00:00Z'),
  ('lp000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000005', true, 3900, '2025-12-15T14:30:00Z');

-- UI/UX Design: 3 of 4 completed
insert into public.lesson_progress (id, user_id, lesson_id, is_completed, watched_seconds, completed_at) values
  ('lp000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000010', true, 2400, '2025-12-05T09:30:00Z'),
  ('lp000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000011', true, 3300, '2025-12-12T11:00:00Z'),
  ('lp000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000012', true, 2700, '2025-12-20T15:00:00Z');

-- Product Management: 1 of 3 completed
insert into public.lesson_progress (id, user_id, lesson_id, is_completed, watched_seconds, completed_at) values
  ('lp000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000017', true, 2100, '2026-01-15T10:00:00Z');

-- Python for Data Analysis: 1 of 5 completed
insert into public.lesson_progress (id, user_id, lesson_id, is_completed, watched_seconds, completed_at) values
  ('lp000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000026', true, 1800, '2026-02-20T09:00:00Z');

-- ============================================================
-- Notes for Alice (3 notes)
-- ============================================================
insert into public.notes (id, user_id, lesson_id, content, timestamp_seconds) values
  ('n0000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'l0000000-0000-0000-0000-000000000003',
   'Expo Router uses file-based routing similar to Next.js. Remember to wrap nested navigators in a _layout.tsx file.',
   1250),
  ('n0000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'l0000000-0000-0000-0000-000000000004',
   'Zustand is great for simple global state. Use React Query for server state to avoid stale data issues.',
   980),
  ('n0000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000001',
   'l0000000-0000-0000-0000-000000000010',
   'The five stages of design thinking: Empathize, Define, Ideate, Prototype, Test. Always start with user research.',
   600);

-- ============================================================
-- Certificate for Alice (completed React Native course)
-- ============================================================
insert into public.certificates (id, user_id, course_id, issued_at) values
  ('ct000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000001',
   '2025-12-15T14:30:00Z');

-- ============================================================
-- Bookmarks for Alice (2 bookmarks)
-- ============================================================
insert into public.bookmarks (id, user_id, course_id) values
  ('b0000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000007');
