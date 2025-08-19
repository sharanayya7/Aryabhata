import {
  users,
  subjects,
  topics,
  articles,
  articleTopics,
  questions,
  bookmarks,
  notes,
  userProgress,
  quizAttempts,
  userActivity,
  type User,
  type UpsertUser,
  type Subject,
  type InsertSubject,
  type Topic,
  type InsertTopic,
  type Article,
  type InsertArticle,
  type Question,
  type InsertQuestion,
  type Bookmark,
  type InsertBookmark,
  type Note,
  type InsertNote,
  type UserProgress,
  type QuizAttempt,
  type InsertQuizAttempt,
  type UserActivity,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, inArray, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStats(userId: string, studyMinutes: number): Promise<void>;
  
  // Subject operations
  getSubjects(): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  
  // Topic operations
  getTopicsBySubject(subjectId: string): Promise<Topic[]>;
  getTopic(id: string): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  
  // Article operations
  getArticles(limit?: number, offset?: number): Promise<Article[]>;
  getFeaturedArticles(): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  getArticlesByTopic(topicId: string): Promise<Article[]>;
  
  // Question operations
  getQuestionsByTopic(topicId: string, difficulty?: string): Promise<Question[]>;
  getRandomQuestions(topicIds: string[], difficulty: string, limit: number): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  
  // Bookmark operations
  getUserBookmarks(userId: string): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  removeBookmark(userId: string, resourceType: string, resourceId: string): Promise<void>;
  isBookmarked(userId: string, resourceType: string, resourceId: string): Promise<boolean>;
  
  // Note operations
  getUserNotes(userId: string): Promise<Note[]>;
  getNotesByResource(userId: string, resourceType: string, resourceId: string): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: string, content: string, title?: string): Promise<Note | undefined>;
  deleteNote(id: string, userId: string): Promise<void>;
  
  // Progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getTopicProgress(userId: string, topicId: string): Promise<UserProgress | undefined>;
  updateTopicProgress(userId: string, topicId: string, completionPercentage: number, timeSpent: number): Promise<UserProgress>;
  
  // Quiz operations
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getUserQuizAttempts(userId: string, limit?: number): Promise<QuizAttempt[]>;
  
  // Activity operations
  logActivity(userId: string, activityType: string, resourceType?: string, resourceId?: string, metadata?: any): Promise<UserActivity>;
  getUserActivity(userId: string, limit?: number): Promise<UserActivity[]>;
  
  // Search operations
  searchContent(query: string, userId: string): Promise<{
    articles: Article[];
    topics: Topic[];
    questions: Question[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStats(userId: string, studyMinutes: number): Promise<void> {
    await db
      .update(users)
      .set({
        totalStudyMinutes: sql`${users.totalStudyMinutes} + ${studyMinutes}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Subject operations
  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects).orderBy(subjects.orderIndex);
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const [newSubject] = await db.insert(subjects).values(subject).returning();
    return newSubject;
  }

  // Topic operations
  async getTopicsBySubject(subjectId: string): Promise<Topic[]> {
    return await db
      .select()
      .from(topics)
      .where(eq(topics.subjectId, subjectId))
      .orderBy(topics.orderIndex);
  }

  async getTopic(id: string): Promise<Topic | undefined> {
    const [topic] = await db.select().from(topics).where(eq(topics.id, id));
    return topic;
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    const [newTopic] = await db.insert(topics).values(topic).returning();
    return newTopic;
  }

  // Article operations
  async getArticles(limit = 20, offset = 0): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);
  }

  async getFeaturedArticles(): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.isFeatured, true))
      .orderBy(desc(articles.publishedAt))
      .limit(5);
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }

  async getArticlesByTopic(topicId: string): Promise<Article[]> {
    return await db
      .select({
        id: articles.id,
        title: articles.title,
        content: articles.content,
        summary: articles.summary,
        imageUrl: articles.imageUrl,
        source: articles.source,
        publishedAt: articles.publishedAt,
        readTime: articles.readTime,
        isFeatured: articles.isFeatured,
        createdAt: articles.createdAt,
      })
      .from(articles)
      .innerJoin(articleTopics, eq(articles.id, articleTopics.articleId))
      .where(eq(articleTopics.topicId, topicId))
      .orderBy(desc(articles.publishedAt));
  }

  // Question operations
  async getQuestionsByTopic(topicId: string, difficulty?: string): Promise<Question[]> {
    const conditions = [eq(questions.topicId, topicId)];
    if (difficulty) {
      conditions.push(eq(questions.difficulty, difficulty));
    }
    
    return await db
      .select()
      .from(questions)
      .where(and(...conditions));
  }

  async getRandomQuestions(topicIds: string[], difficulty: string, limit: number): Promise<Question[]> {
    const conditions = [
      inArray(questions.topicId, topicIds),
      eq(questions.difficulty, difficulty)
    ];

    return await db
      .select()
      .from(questions)
      .where(and(...conditions))
      .orderBy(sql`RANDOM()`)
      .limit(limit);
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  // Bookmark operations
  async getUserBookmarks(userId: string): Promise<Bookmark[]> {
    return await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
  }

  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const [newBookmark] = await db.insert(bookmarks).values(bookmark).returning();
    return newBookmark;
  }

  async removeBookmark(userId: string, resourceType: string, resourceId: string): Promise<void> {
    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.resourceType, resourceType),
          eq(bookmarks.resourceId, resourceId)
        )
      );
  }

  async isBookmarked(userId: string, resourceType: string, resourceId: string): Promise<boolean> {
    const [bookmark] = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.resourceType, resourceType),
          eq(bookmarks.resourceId, resourceId)
        )
      );
    return !!bookmark;
  }

  // Note operations
  async getUserNotes(userId: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.updatedAt));
  }

  async getNotesByResource(userId: string, resourceType: string, resourceId: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, userId),
          eq(notes.resourceType, resourceType),
          eq(notes.resourceId, resourceId)
        )
      )
      .orderBy(desc(notes.updatedAt));
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db.insert(notes).values(note).returning();
    return newNote;
  }

  async updateNote(id: string, content: string, title?: string): Promise<Note | undefined> {
    const updateData: any = { content, updatedAt: new Date() };
    if (title) updateData.title = title;

    const [updatedNote] = await db
      .update(notes)
      .set(updateData)
      .where(eq(notes.id, id))
      .returning();
    return updatedNote;
  }

  async deleteNote(id: string, userId: string): Promise<void> {
    await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)));
  }

  // Progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
  }

  async getTopicProgress(userId: string, topicId: string): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.topicId, topicId)
        )
      );
    return progress;
  }

  async updateTopicProgress(
    userId: string, 
    topicId: string, 
    completionPercentage: number, 
    timeSpent: number
  ): Promise<UserProgress> {
    const existing = await this.getTopicProgress(userId, topicId);
    
    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set({
          completionPercentage,
          totalTimeSpent: existing.totalTimeSpent + timeSpent,
          lastStudiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values({
          userId,
          topicId,
          completionPercentage,
          totalTimeSpent: timeSpent,
          lastStudiedAt: new Date(),
        })
        .returning();
      return created;
    }
  }

  // Quiz operations
  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [newAttempt] = await db.insert(quizAttempts).values(attempt).returning();
    return newAttempt;
  }

  async getUserQuizAttempts(userId: string, limit = 20): Promise<QuizAttempt[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.completedAt))
      .limit(limit);
  }

  // Activity operations
  async logActivity(
    userId: string, 
    activityType: string, 
    resourceType?: string, 
    resourceId?: string, 
    metadata?: any
  ): Promise<UserActivity> {
    const [activity] = await db
      .insert(userActivity)
      .values({
        userId,
        activityType,
        resourceType,
        resourceId,
        metadata,
      })
      .returning();
    return activity;
  }

  async getUserActivity(userId: string, limit = 20): Promise<UserActivity[]> {
    return await db
      .select()
      .from(userActivity)
      .where(eq(userActivity.userId, userId))
      .orderBy(desc(userActivity.createdAt))
      .limit(limit);
  }

  // Search operations
  async searchContent(query: string, userId: string): Promise<{
    articles: Article[];
    topics: Topic[];
    questions: Question[];
  }> {
    const searchTerm = `%${query}%`;

    const [searchArticles, searchTopics, searchQuestions] = await Promise.all([
      db
        .select()
        .from(articles)
        .where(or(
          sql`${articles.title} ILIKE ${searchTerm}`,
          sql`${articles.summary} ILIKE ${searchTerm}`
        ))
        .limit(10),
      
      db
        .select()
        .from(topics)
        .where(or(
          sql`${topics.title} ILIKE ${searchTerm}`,
          sql`${topics.description} ILIKE ${searchTerm}`
        ))
        .limit(10),
      
      db
        .select()
        .from(questions)
        .where(sql`${questions.question} ILIKE ${searchTerm}`)
        .limit(10)
    ]);

    return {
      articles: searchArticles,
      topics: searchTopics,
      questions: searchQuestions,
    };
  }
}

export const storage = new DatabaseStorage();
