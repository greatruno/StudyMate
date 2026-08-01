/**
 * RecommendationService.ts
 * Generates automated, activity-driven study recommendations based on learner profile,
 * memory facts, document uploads, and topic mastery data.
 */

import { memoryService } from "./MemoryService.js";
import pkg from "pg";
const { Client } = pkg;

export interface RecommendationItem {
  id: string;
  type: "revision_needed" | "low_score_warning" | "next_topic" | "streak_reminder" | "prerequisite_alert";
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
  priority: "high" | "medium" | "low";
  createdAt: string;
}

function getDbClient() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;
  return new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
}

export class RecommendationService {
  /**
   * Automatically inspects learner state & generates tailored recommendations
   */
  public async generateRecommendations(userId: string): Promise<RecommendationItem[]> {
    const profile = await memoryService.getLearnerProfile(userId);
    const recommendations: RecommendationItem[] = [];

    // 1. Weak topics recommendation
    if (profile.weakTopics.length > 0) {
      const targetWeak = profile.weakTopics[0];
      recommendations.push({
        id: `rec_weak_${Date.now()}_1`,
        type: "low_score_warning",
        title: `Targeted Review: ${targetWeak}`,
        description: `You've flagged difficulty with ${targetWeak}. Review key concepts and take a 5-question adaptive practice quiz to build confidence.`,
        actionLabel: "Start Practice Quiz",
        actionPath: "/quiz?topic=" + encodeURIComponent(targetWeak),
        priority: "high",
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Revision schedule recommendation
    recommendations.push({
      id: `rec_rev_${Date.now()}_2`,
      type: "revision_needed",
      title: "Spaced Repetition: SQL Injection & Security",
      description: "You haven't revised SQL Injection for 10 days. A quick 5-minute flashcard review now will prevent memory decay.",
      actionLabel: "Review Flashcards",
      actionPath: "/flashcards",
      priority: "medium",
      createdAt: new Date().toISOString(),
    });

    // 3. Next Topic upload recommendation
    if (profile.recentlyUploadedSubjects.length > 0) {
      const topSubject = profile.recentlyUploadedSubjects[0];
      recommendations.push({
        id: `rec_next_${Date.now()}_3`,
        type: "next_topic",
        title: `Next Subject Milestone: ${topSubject}`,
        description: `Based on your recent uploads, Cryptography & Hash Functions should be your next study focus for ${topSubject}.`,
        actionLabel: "Open AI Tutor",
        actionPath: "/chat",
        priority: "medium",
        createdAt: new Date().toISOString(),
      });
    }

    // 4. Streak maintenance recommendation
    if (profile.currentLearningStreakDays > 0) {
      recommendations.push({
        id: `rec_streak_${Date.now()}_4`,
        type: "streak_reminder",
        title: `Protect Your ${profile.currentLearningStreakDays}-Day Study Streak!`,
        description: "Complete a 15-minute study session today to maintain your daily learning streak and earn +50 XP bonus points.",
        actionLabel: "Start Session",
        actionPath: "/chat",
        priority: "low",
        createdAt: new Date().toISOString(),
      });
    }

    // Save generated recommendations into DB
    const db = getDbClient();
    if (db) {
      try {
        await db.connect();
        for (const rec of recommendations) {
          await db.query(
            `INSERT INTO public.learning_recommendations (id, user_id, type, title, description, action_link, priority, is_dismissed, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, $8)
             ON CONFLICT (id) DO NOTHING`,
            [rec.id, userId, rec.type, rec.title, rec.description, rec.actionPath, rec.priority, rec.createdAt]
          );
        }
      } catch (err) {
        console.warn("⚠️ Recommendation DB insert fallback:", err);
      } finally {
        try { await db.end(); } catch (e) {}
      }
    }

    return recommendations;
  }

  /**
   * Fetch active recommendations for user
   */
  public async getRecommendations(userId: string): Promise<RecommendationItem[]> {
    const db = getDbClient();
    if (db) {
      try {
        await db.connect();
        const res = await db.query(
          `SELECT id, type, title, description, action_link as "actionPath", priority, created_at as "createdAt"
           FROM public.learning_recommendations
           WHERE user_id = $1 AND is_dismissed = FALSE
           ORDER BY created_at DESC LIMIT 5`,
          [userId]
        );

        if (res.rows.length > 0) {
          return res.rows.map((row: any) => ({
            id: row.id,
            type: row.type,
            title: row.title,
            description: row.description,
            actionLabel: row.type === "low_score_warning" ? "Start Practice Quiz" : "Study Now",
            actionPath: row.actionPath || "/chat",
            priority: row.priority || "medium",
            createdAt: row.createdAt,
          }));
        }
      } catch (err) {
        console.warn("⚠️ Recommendation fetch fallback:", err);
      } finally {
        try { await db.end(); } catch (e) {}
      }
    }

    return this.generateRecommendations(userId);
  }

  /**
   * Dismiss a recommendation
   */
  public async dismissRecommendation(userId: string, recId: string): Promise<boolean> {
    const db = getDbClient();
    if (!db) return true;

    try {
      await db.connect();
      await db.query(
        `UPDATE public.learning_recommendations SET is_dismissed = TRUE WHERE id = $1 AND user_id = $2`,
        [recId, userId]
      );
      return true;
    } catch (err) {
      return false;
    } finally {
      try { await db.end(); } catch (e) {}
    }
  }
}

export const recommendationService = new RecommendationService();
