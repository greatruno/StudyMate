/**
 * KnowledgeGraphService.ts
 * Builds structured relationships between study topics, concept prerequisites, and topic mastery.
 */

import pkg from "pg";
const { Client } = pkg;

export interface GraphNode {
  id: string;
  label: string;
  category: string;
  masteryScore: number; // 0-100
  status: "mastered" | "learning" | "struggling" | "unvisited";
  prerequisites: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: "prerequisite" | "subtopic" | "related";
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  recommendedPrerequisites: { topic: string; prerequisiteFor: string; reason: string }[];
}

function getDbClient() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;
  return new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
}

export class KnowledgeGraphService {
  /**
   * Retrieves interactive knowledge graph for a user's academic domain
   */
  public async getKnowledgeGraph(userId: string): Promise<KnowledgeGraphData> {
    const nodes: GraphNode[] = [
      { id: "net", label: "Networking Fundamentals", category: "Computer Science", masteryScore: 85, status: "mastered", prerequisites: [] },
      { id: "osi", label: "OSI 7-Layer Model", category: "Computer Science", masteryScore: 90, status: "mastered", prerequisites: ["net"] },
      { id: "ip", label: "IP Addressing & Subnetting", category: "Computer Science", masteryScore: 42, status: "struggling", prerequisites: ["osi"] },
      { id: "cidr", label: "CIDR & VLSM Masks", category: "Computer Science", masteryScore: 35, status: "struggling", prerequisites: ["ip"] },
      { id: "tcp", label: "TCP / UDP Transport Protocols", category: "Computer Science", masteryScore: 78, status: "learning", prerequisites: ["osi"] },
      { id: "handshake", label: "TCP 3-Way Handshake", category: "Computer Science", masteryScore: 88, status: "mastered", prerequisites: ["tcp"] },
      { id: "congestion", label: "TCP Congestion Control", category: "Computer Science", masteryScore: 50, status: "struggling", prerequisites: ["tcp"] },
      { id: "sec", label: "Cybersecurity Fundamentals", category: "Cybersecurity", masteryScore: 75, status: "learning", prerequisites: ["net"] },
      { id: "crypto", label: "Cryptography & Encryption", category: "Cybersecurity", masteryScore: 68, status: "learning", prerequisites: ["sec"] },
      { id: "firewall", label: "Firewalls & Packet Filtering", category: "Cybersecurity", masteryScore: 82, status: "mastered", prerequisites: ["sec", "ip"] }
    ];

    const edges: GraphEdge[] = [
      { source: "net", target: "osi", relation: "subtopic" },
      { source: "osi", target: "ip", relation: "prerequisite" },
      { source: "ip", target: "cidr", relation: "subtopic" },
      { source: "osi", target: "tcp", relation: "prerequisite" },
      { source: "tcp", target: "handshake", relation: "subtopic" },
      { source: "tcp", target: "congestion", relation: "subtopic" },
      { source: "net", target: "sec", relation: "prerequisite" },
      { source: "sec", target: "crypto", relation: "subtopic" },
      { source: "sec", target: "firewall", relation: "subtopic" },
      { source: "ip", target: "firewall", relation: "prerequisite" }
    ];

    const db = getDbClient();
    if (db) {
      try {
        await db.connect();
        const masteryRes = await db.query(
          `SELECT topic, mastery_score FROM public.topic_mastery WHERE user_id = $1`,
          [userId]
        );

        if (masteryRes.rows.length > 0) {
          const scoreMap = new Map<string, number>();
          for (const row of masteryRes.rows) {
            scoreMap.set(row.topic.toLowerCase(), row.mastery_score);
          }

          nodes.forEach((node) => {
            const matchedScore = scoreMap.get(node.label.toLowerCase());
            if (matchedScore !== undefined) {
              node.masteryScore = matchedScore;
              if (matchedScore >= 80) node.status = "mastered";
              else if (matchedScore < 55) node.status = "struggling";
              else node.status = "learning";
            }
          });
        }
      } catch (err) {
        console.warn("⚠️ Knowledge graph DB update fallback:", err);
      } finally {
        try { await db.end(); } catch (e) {}
      }
    }

    const recommendedPrerequisites = [
      {
        topic: "IP Addressing & Subnetting",
        prerequisiteFor: "CIDR & VLSM Masks",
        reason: "Mastering binary host masks will make VLSM subnets 3x easier to solve."
      },
      {
        topic: "TCP / UDP Transport Protocols",
        prerequisiteFor: "TCP Congestion Control",
        reason: "Review TCP segment headers before learning AIMD congestion windows."
      }
    ];

    return {
      nodes,
      edges,
      recommendedPrerequisites,
    };
  }
}

export const knowledgeGraphService = new KnowledgeGraphService();
