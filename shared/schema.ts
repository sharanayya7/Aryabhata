import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  real
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  streakDays: integer("streak_days").default(0),
  totalStudyMinutes: integer("total_study_minutes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Syllabus subjects
export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon").notNull(),
  color: varchar("color").notNull(),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Syllabus topics
export const topics = pgTable("topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").references(() => subjects.id).notNull(),
  parentTopicId: varchar("parent_topic_id").references(() => topics.id),
  title: varchar("title").notNull(),
  description: text("description"),
  content: text("content"),
  orderIndex: integer("order_index").notNull(),
  estimatedReadTime: integer("estimated_read_time"),
  difficulty: varchar("difficulty").notNull().default("basic"), // basic, advanced, deep
  createdAt: timestamp("created_at").defaultNow(),
});

// Current affairs articles
export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  imageUrl: varchar("image_url"),
  source: varchar("source"),
  publishedAt: timestamp("published_at").notNull(),
  readTime: integer("read_time").notNull(),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Article-topic relationships
export const articleTopics = pgTable("article_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").references(() => articles.id).notNull(),
  topicId: varchar("topic_id").references(() => topics.id).notNull(),
});

// Practice questions
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").references(() => topics.id).notNull(),
  question: text("question").notNull(),
  options: jsonb("options").notNull(), // Array of option objects
  correctOptionIndex: integer("correct_option_index").notNull(),
  explanation: text("explanation").notNull(),
  difficulty: varchar("difficulty").notNull().default("basic"), // basic, advanced, deep
  isFromCurrentAffairs: boolean("is_from_current_affairs").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User bookmarks
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  resourceType: varchar("resource_type").notNull(), // article, topic, question
  resourceId: varchar("resource_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User notes
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  resourceType: varchar("resource_type").notNull(), // article, topic, question
  resourceId: varchar("resource_id").notNull(),
  title: varchar("title"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User progress tracking
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  topicId: varchar("topic_id").references(() => topics.id).notNull(),
  completionPercentage: real("completion_percentage").default(0),
  lastStudiedAt: timestamp("last_studied_at"),
  totalTimeSpent: integer("total_time_spent").default(0), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quiz attempts
export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  questionIds: jsonb("question_ids").notNull(), // Array of question IDs
  answers: jsonb("answers").notNull(), // Array of user answers
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  difficulty: varchar("difficulty").notNull(),
  subjects: jsonb("subjects").notNull(), // Array of subject IDs
  completedAt: timestamp("completed_at").defaultNow(),
});

// User activity log
export const userActivity = pgTable("user_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  activityType: varchar("activity_type").notNull(), // quiz_completed, article_read, note_added, etc.
  resourceType: varchar("resource_type"), // article, topic, question, quiz
  resourceId: varchar("resource_id"),
  metadata: jsonb("metadata"), // Additional activity-specific data
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  bookmarks: many(bookmarks),
  notes: many(notes),
  progress: many(userProgress),
  quizAttempts: many(quizAttempts),
  activities: many(userActivity),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  topics: many(topics),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [topics.subjectId],
    references: [subjects.id],
  }),
  parentTopic: one(topics, {
    fields: [topics.parentTopicId],
    references: [topics.id],
  }),
  childTopics: many(topics),
  questions: many(questions),
  articleTopics: many(articleTopics),
  progress: many(userProgress),
}));

export const articlesRelations = relations(articles, ({ many }) => ({
  articleTopics: many(articleTopics),
}));

export const articleTopicsRelations = relations(articleTopics, ({ one }) => ({
  article: one(articles, {
    fields: [articleTopics.articleId],
    references: [articles.id],
  }),
  topic: one(topics, {
    fields: [articleTopics.topicId],
    references: [topics.id],
  }),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  topic: one(topics, {
    fields: [questions.topicId],
    references: [topics.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  topic: one(topics, {
    fields: [userProgress.topicId],
    references: [topics.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
}));

export const userActivityRelations = relations(userActivity, ({ one }) => ({
  user: one(users, {
    fields: [userActivity.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
  createdAt: true,
});

export const insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
  createdAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  completedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type UserActivity = typeof userActivity.$inferSelect;
