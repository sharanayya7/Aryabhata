import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./agentAuth";
import { 
  insertArticleSchema,
  insertSubjectSchema,
  insertTopicSchema,
  insertQuestionSchema,
  insertBookmarkSchema,
  insertNoteSchema,
  insertQuizAttemptSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Subject routes
  app.get('/api/subjects', async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.post('/api/subjects', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(validatedData);
      res.status(201).json(subject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  // Topic routes
  app.get('/api/subjects/:subjectId/topics', async (req, res) => {
    try {
      const topics = await storage.getTopicsBySubject(req.params.subjectId);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  app.get('/api/topics/:id', async (req, res) => {
    try {
      const topic = await storage.getTopic(req.params.id);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      res.json(topic);
    } catch (error) {
      console.error("Error fetching topic:", error);
      res.status(500).json({ message: "Failed to fetch topic" });
    }
  });

  app.post('/api/topics', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTopicSchema.parse(req.body);
      const topic = await storage.createTopic(validatedData);
      res.status(201).json(topic);
    } catch (error) {
      console.error("Error creating topic:", error);
      res.status(500).json({ message: "Failed to create topic" });
    }
  });

  // Article routes
  app.get('/api/articles', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const articles = await storage.getArticles(limit, offset);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get('/api/articles/featured', async (req, res) => {
    try {
      const articles = await storage.getFeaturedArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching featured articles:", error);
      res.status(500).json({ message: "Failed to fetch featured articles" });
    }
  });

  app.get('/api/articles/:id', async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.get('/api/topics/:topicId/articles', async (req, res) => {
    try {
      const articles = await storage.getArticlesByTopic(req.params.topicId);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching topic articles:", error);
      res.status(500).json({ message: "Failed to fetch topic articles" });
    }
  });

  app.post('/api/articles', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(validatedData);
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  // Question routes
  app.get('/api/topics/:topicId/questions', async (req, res) => {
    try {
      const difficulty = req.query.difficulty as string;
      const questions = await storage.getQuestionsByTopic(req.params.topicId, difficulty);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post('/api/questions/random', async (req, res) => {
    try {
      const { topicIds, difficulty, limit } = req.body;
      if (!topicIds || !difficulty || !limit) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const questions = await storage.getRandomQuestions(topicIds, difficulty, limit);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching random questions:", error);
      res.status(500).json({ message: "Failed to fetch random questions" });
    }
  });

  app.get('/api/questions/:id', async (req, res) => {
    try {
      const question = await storage.getQuestion(req.params.id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json(question);
    } catch (error) {
      console.error("Error fetching question:", error);
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  // Bookmark routes
  app.get('/api/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookmarks = await storage.getUserBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  app.post('/api/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertBookmarkSchema.parse({ ...req.body, userId });
      const bookmark = await storage.createBookmark(validatedData);
      await storage.logActivity(userId, 'bookmark_added', req.body.resourceType, req.body.resourceId);
      res.status(201).json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      res.status(500).json({ message: "Failed to create bookmark" });
    }
  });

  app.delete('/api/bookmarks/:resourceType/:resourceId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.removeBookmark(userId, req.params.resourceType, req.params.resourceId);
      await storage.logActivity(userId, 'bookmark_removed', req.params.resourceType, req.params.resourceId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing bookmark:", error);
      res.status(500).json({ message: "Failed to remove bookmark" });
    }
  });

  app.get('/api/bookmarks/:resourceType/:resourceId/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const isBookmarked = await storage.isBookmarked(userId, req.params.resourceType, req.params.resourceId);
      res.json({ isBookmarked });
    } catch (error) {
      console.error("Error checking bookmark:", error);
      res.status(500).json({ message: "Failed to check bookmark status" });
    }
  });

  // Notes routes
  app.get('/api/notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notes = await storage.getUserNotes(userId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get('/api/notes/:resourceType/:resourceId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notes = await storage.getNotesByResource(userId, req.params.resourceType, req.params.resourceId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching resource notes:", error);
      res.status(500).json({ message: "Failed to fetch resource notes" });
    }
  });

  app.post('/api/notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertNoteSchema.parse({ ...req.body, userId });
      const note = await storage.createNote(validatedData);
      await storage.logActivity(userId, 'note_added', req.body.resourceType, req.body.resourceId);
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.put('/api/notes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { content, title } = req.body;
      const updatedNote = await storage.updateNote(req.params.id, content, title);
      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(updatedNote);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ message: "Failed to update note" });
    }
  });

  app.delete('/api/notes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteNote(req.params.id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Progress routes
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.put('/api/progress/:topicId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { completionPercentage, timeSpent } = req.body;
      const progress = await storage.updateTopicProgress(userId, req.params.topicId, completionPercentage, timeSpent);
      await storage.updateUserStats(userId, timeSpent);
      await storage.logActivity(userId, 'study_progress', 'topic', req.params.topicId, { timeSpent, completionPercentage });
      res.json(progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Quiz routes
  app.post('/api/quiz/attempt', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertQuizAttemptSchema.parse({ ...req.body, userId });
      const attempt = await storage.createQuizAttempt(validatedData);
      await storage.logActivity(userId, 'quiz_completed', 'quiz', attempt.id, {
        score: req.body.score,
        totalQuestions: req.body.totalQuestions,
        difficulty: req.body.difficulty
      });
      res.status(201).json(attempt);
    } catch (error) {
      console.error("Error saving quiz attempt:", error);
      res.status(500).json({ message: "Failed to save quiz attempt" });
    }
  });

  app.get('/api/quiz/attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const attempts = await storage.getUserQuizAttempts(userId, limit);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res.status(500).json({ message: "Failed to fetch quiz attempts" });
    }
  });

  // Activity routes
  app.get('/api/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const activities = await storage.getUserActivity(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // Search routes
  app.get('/api/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const results = await storage.searchContent(query, userId);
      res.json(results);
    } catch (error) {
      console.error("Error searching content:", error);
      res.status(500).json({ message: "Failed to search content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
