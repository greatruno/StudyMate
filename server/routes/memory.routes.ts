/**
 * memory.routes.ts
 * Express routes for AI Memory, Learner Profile, Knowledge Graph, Recommendations, and Analytics.
 */

import { Router, Response } from "express";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { memoryService } from "../services/MemoryService.js";
import { recommendationService } from "../services/RecommendationService.js";
import { knowledgeGraphService } from "../services/KnowledgeGraphService.js";
import { learningAnalyticsService } from "../services/LearningAnalyticsService.js";

const router = Router();

/**
 * GET /api/v1/memory/profile
 * Retrieves full dynamic Learner Memory Profile
 */
router.get("/profile", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const profile = await memoryService.getLearnerProfile(userId);
    return res.json({ success: true, profile });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch learner profile" });
  }
});

/**
 * GET /api/v1/memory/recommendations
 * Retrieves active automated learning recommendations
 */
router.get("/recommendations", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const recommendations = await recommendationService.getRecommendations(userId);
    return res.json({ success: true, count: recommendations.length, recommendations });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch recommendations" });
  }
});

/**
 * GET /api/v1/memory/topic-mastery
 * Retrieves topic mastery scores & knowledge graph concept relations
 */
router.get("/topic-mastery", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const graphData = await knowledgeGraphService.getKnowledgeGraph(userId);
    return res.json({ success: true, ...graphData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch topic mastery" });
  }
});

/**
 * GET /api/v1/memory/dashboard
 * Aggregates complete Personal Learning Dashboard metrics
 */
router.get("/dashboard", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";

    const [profile, recommendations, graphData, analytics] = await Promise.all([
      memoryService.getLearnerProfile(userId),
      recommendationService.getRecommendations(userId),
      knowledgeGraphService.getKnowledgeGraph(userId),
      learningAnalyticsService.getAnalytics(userId)
    ]);

    return res.json({
      success: true,
      dashboard: {
        currentLearningLevel: profile.preferredDifficultyLevel,
        studyStreakDays: profile.currentLearningStreakDays,
        weeklyStudyTimeHours: profile.weeklyStudyTimeHours,
        learningProgressScore: profile.averageQuizScore,
        academicField: profile.academicField,
        primarySubjects: profile.primarySubjects,
        learningGoals: profile.learningGoals,
        strongTopics: profile.strongTopics,
        weakTopics: profile.weakTopics,
        persistentMemoriesCount: profile.persistentMemories.length,
        recommendations,
        topicMasteryNodes: graphData.nodes,
        knowledgeGraphEdges: graphData.edges,
        recommendedPrerequisites: graphData.recommendedPrerequisites,
        analytics,
        upcomingDeadlines: profile.upcomingAcademicDeadlines,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch memory dashboard" });
  }
});

/**
 * POST /api/v1/memory/refresh
 * Forces re-extraction of memories and recommendation generation
 */
router.post("/refresh", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const newRecommendations = await recommendationService.generateRecommendations(userId);
    const updatedProfile = await memoryService.getLearnerProfile(userId);

    return res.json({
      success: true,
      message: "Learner memory profile & recommendations refreshed successfully.",
      profile: updatedProfile,
      recommendations: newRecommendations,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to refresh memory engine" });
  }
});

/**
 * POST /api/v1/memory/facts
 * Add a manual memory fact item
 */
router.post("/facts", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const { memoryType, topic, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Memory content parameter is required." });
    }

    const savedFact = await memoryService.saveMemoryFact(userId, {
      memoryType: memoryType || "fact",
      topic: topic || "General",
      content,
      source: "manual_input",
    });

    return res.status(201).json({ success: true, fact: savedFact });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to save memory fact" });
  }
});

/**
 * DELETE /api/v1/memory/facts/:id
 * Removes a memory fact
 */
router.delete("/facts/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const factId = req.params.id;

    const deleted = await memoryService.deleteMemoryFact(userId, factId);
    return res.json({ success: true, deleted, id: factId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to delete memory fact" });
  }
});

/**
 * POST /api/v1/memory/recommendations/:id/dismiss
 * Dismisses a recommendation
 */
router.post("/recommendations/:id/dismiss", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const recId = req.params.id;

    await recommendationService.dismissRecommendation(userId, recId);
    return res.json({ success: true, dismissedId: recId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to dismiss recommendation" });
  }
});

export default router;
