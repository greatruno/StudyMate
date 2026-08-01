import React, { useState } from "react";
import { 
  Trophy, 
  Award, 
  Flame, 
  Calendar, 
  ShieldAlert, 
  Coins, 
  Check, 
  Sparkles,
  Gift,
  ArrowRight,
  Zap,
  Star
} from "lucide-react";
import { UserAccount } from "../types";

interface AchievementsViewProps {
  currentUser: UserAccount;
  onAddStatsReward: (points: number, contributionReward: string) => void;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  pointsRequired: number;
  category: "streak" | "contributions" | "scores";
  claimed: boolean;
}

export default function AchievementsView({
  currentUser,
  onAddStatsReward
}: AchievementsViewProps) {
  // Stats
  const stats = currentUser?.stats || {
    totalStudyMinutes: 0,
    quizzesTaken: 0,
    averageQuizScore: 0,
    flashcardsReviewed: 0,
    activeStreak: 0,
    level: 1,
    experiencePoints: 0,
    badgesEarned: []
  };

  // State for claimable rewards using XP or contribution points
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);

  const badges: BadgeItem[] = [
    {
      id: "badge-1",
      title: "First Steps",
      description: "Successfully upload and compile your first study document notes.",
      icon: "📚",
      pointsRequired: 0,
      category: "contributions",
      claimed: true
    },
    {
      id: "badge-2",
      title: "Streak Pioneer",
      description: "Maintain a study streak of 3 days or more.",
      icon: "🔥",
      pointsRequired: 3,
      category: "streak",
      claimed: stats.activeStreak >= 3
    },
    {
      id: "badge-3",
      title: "Active Collaborator",
      description: "Publish study materials to the community library.",
      icon: "🤝",
      pointsRequired: 5,
      category: "contributions",
      claimed: stats.experiencePoints >= 200 // Mock trigger
    },
    {
      id: "badge-4",
      title: "Elite Academician",
      description: "Perform 10 perfect practice quizzes with high accuracy.",
      icon: "🏅",
      pointsRequired: 10,
      category: "scores",
      claimed: stats.averageQuizScore >= 90
    },
    {
      id: "badge-5",
      title: "Mentor Persona",
      description: "Help peers resolve Q&A discussions successfully.",
      icon: "🧠",
      pointsRequired: 15,
      category: "contributions",
      claimed: stats.experiencePoints >= 500
    }
  ];

  // Store lists of rewards students can unlock
  const rewardStore = [
    {
      id: "rew-1",
      title: "Gold-Class Badge Frame",
      desc: "Upgrades your avatar icon to golden highlight border.",
      cost: 200,
      icon: "👑"
    },
    {
      id: "rew-2",
      title: "Exclusive AI Coach Voice Toggle",
      desc: "Simulate speech capabilities with synthetic narration.",
      cost: 500,
      icon: "🎙️"
    },
    {
      id: "rew-3",
      title: "StudyMate Scholar Title License",
      desc: "Unlocks 'Syllabus Master' text underneath your profile displayName.",
      cost: 800,
      icon: "📜"
    }
  ];

  const handleClaimReward = (rewardId: string, cost: number, title: string) => {
    if (stats.experiencePoints < cost) {
      alert("Insufficient Experience Points (XP) earned! Complete quizzes, review flashcards, and help peers to earn more.");
      return;
    }

    if (claimedRewards.includes(rewardId)) {
      alert("Reward already claimed!");
      return;
    }

    // Spend points
    onAddStatsReward(-cost, `Claiming reward: ${title}`);
    setClaimedRewards([...claimedRewards, rewardId]);
    alert(`Successfully claimed: ${title}!`);
  };

  // Generate a mock study streak heatmap matrix (representing past 12 weeks)
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  const weeksMatrix = Array.from({ length: 12 }, (_, wIndex) => {
    return Array.from({ length: 7 }, (_, dIndex) => {
      // Mock heat intensity based on some random logic or actual streak
      const active = (wIndex * 7 + dIndex) % 3 === 0 || (wIndex === 11 && dIndex < stats.activeStreak);
      const intensity = active ? Math.floor(Math.random() * 3) + 1 : 0;
      return intensity;
    });
  });

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8 animate-fade-in text-gray-800" id="achievements-root">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">
            Academic Gamification & Streaks
          </span>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mt-1">
            Learning Achievements & Rewards
          </h2>
          <p className="text-xs text-gray-400 font-semibold mt-2">
            Stay highly motivated! Earn experience points (XP) for study milestones and unlock premium customizations.
          </p>
        </div>
        
        {/* Dynamic score tracker */}
        <div className="flex items-center gap-3 bg-indigo-50/75 border border-indigo-100/50 p-3 rounded-2xl">
          <Coins className="h-5 w-5 text-indigo-600 animate-bounce" />
          <div className="text-left text-xs">
            <p className="font-bold text-indigo-900 leading-tight">Current Balances</p>
            <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">
              {stats.experiencePoints} XP Available • Level {stats.level}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT TWO COLUMNS: STREAKS & BADGES */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active study streak showcase */}
          <div className="bg-white p-6 border border-gray-150 rounded-2xl space-y-5 shadow-3xs">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
                Active Study Streak Map
              </h4>
              <span className="text-xs font-black bg-amber-50 text-amber-800 px-3 py-1 rounded-xl">
                {stats.activeStreak} Days Streak
              </span>
            </div>

            {/* Streak Matrix Visual (GitHub commits map style) */}
            <div className="bg-slate-50 border border-gray-100 p-5 rounded-2xl space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Past 12 Weeks Activity Heatmap</p>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {/* Week Column items */}
                <div className="grid grid-flow-col gap-1.5">
                  {weeksMatrix.map((week, wIdx) => (
                    <div key={wIdx} className="grid grid-rows-7 gap-1.5">
                      {week.map((intensity, dIdx) => {
                        // Styling based on intensity level
                        let colorClass = "bg-gray-200/60";
                        if (intensity === 1) colorClass = "bg-indigo-200";
                        if (intensity === 2) colorClass = "bg-indigo-400";
                        if (intensity >= 3) colorClass = "bg-indigo-600";

                        return (
                          <div 
                            key={dIdx} 
                            className={`h-3 w-3 rounded-xs ${colorClass} transition-all hover:scale-125`} 
                            title={`Activity index level: ${intensity}`} 
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend keys */}
              <div className="flex items-center justify-end gap-1.5 text-[9px] text-gray-400 font-bold">
                <span>Less</span>
                <div className="h-2 w-2 rounded-xs bg-gray-200" />
                <div className="h-2 w-2 rounded-xs bg-indigo-200" />
                <div className="h-2 w-2 rounded-xs bg-indigo-400" />
                <div className="h-2 w-2 rounded-xs bg-indigo-600" />
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Badges list */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-1.5">
              <Award className="h-5 w-5 text-indigo-500" />
              Earned Badges & Academic Milestones
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div 
                  key={badge.id} 
                  className={`p-4 border rounded-2xl flex items-center gap-4 transition-all ${
                    badge.claimed 
                      ? "bg-white border-gray-200 shadow-3xs opacity-100" 
                      : "bg-slate-50/50 border-dashed border-gray-200 opacity-60"
                  }`}
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${
                    badge.claimed ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400"
                  }`}>
                    {badge.icon}
                  </div>
                  <div className="space-y-0.5 text-left">
                    <h5 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                      {badge.title}
                      {badge.claimed && (
                        <span className="text-[8px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wide">
                          Claimed
                        </span>
                      )}
                    </h5>
                    <p className="text-[10px] text-gray-400 font-semibold leading-relaxed line-clamp-2">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: REWARD STORE TO CLAIM */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white p-5 rounded-2xl border border-gray-150 space-y-4 shadow-3xs">
            <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="h-4 w-4 text-indigo-600" />
              Syllabus Contribution Rewards Store
            </h4>
            <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
              Redeem your XP for premium collaborative features or cosmetics licenses to showcase your expertise.
            </p>

            <div className="space-y-3">
              {rewardStore.map((rew) => {
                const claimed = claimedRewards.includes(rew.id);
                const canAfford = stats.experiencePoints >= rew.cost;

                return (
                  <div key={rew.id} className="p-4 bg-slate-50 border border-gray-150 rounded-xl space-y-3 text-left">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{rew.icon}</span>
                      <div>
                        <h5 className="font-bold text-xs text-gray-800">{rew.title}</h5>
                        <p className="text-[9px] text-gray-400 font-semibold">Cost: {rew.cost} XP</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{rew.desc}</p>
                    
                    <button
                      onClick={() => handleClaimReward(rew.id, rew.cost, rew.title)}
                      disabled={claimed || !canAfford}
                      className={`w-full py-1.5 text-[10px] uppercase tracking-wider font-black rounded-lg text-center flex items-center justify-center gap-1 transition-all ${
                        claimed 
                          ? "bg-green-100 text-green-700 font-bold"
                          : canAfford
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {claimed ? (
                        <>
                          <Check className="h-3 w-3" /> Unlocked
                        </>
                      ) : (
                        `Redeem Reward`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
