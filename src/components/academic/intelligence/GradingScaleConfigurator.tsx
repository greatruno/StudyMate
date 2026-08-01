import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Shield, Check, Info, RefreshCw } from "lucide-react";
import { GradingScale } from "../../../types";

interface GradingScaleConfiguratorProps {
  currentScaleName: string;
  maxPoint: number;
  onUpdateScale: (scaleType: "5.0" | "4.0" | "custom", customScale?: any) => Promise<void>;
}

export const GradingScaleConfigurator: React.FC<GradingScaleConfiguratorProps> = ({
  currentScaleName,
  maxPoint,
  onUpdateScale,
}) => {
  const [selectedType, setSelectedType] = useState<"5.0" | "4.0">(
    maxPoint === 4.0 ? "4.0" : "5.0"
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleScaleSelect = async (type: "5.0" | "4.0") => {
    setSelectedType(type);
    setIsUpdating(true);
    try {
      await onUpdateScale(type);
    } catch (err) {
      console.error("Error updating scale:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Configurable Institutional Grading System
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active Scale: <strong className="text-slate-900 dark:text-white">{currentScaleName} ({maxPoint.toFixed(1)} Max)</strong>
          </p>
        </div>

        {isUpdating && <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
        {/* 5.0 POINT SCALE OPTION */}
        <div
          onClick={() => handleScaleSelect("5.0")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedType === "5.0"
              ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 dark:border-indigo-700 shadow-sm"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              5.0 Point Grading System
            </span>
            {selectedType === "5.0" && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            A (70-100% = 5.0), B (60-69% = 4.0), C (50-59% = 3.0), D (45-49% = 2.0), E (40-44% = 1.0), F (&lt;40% = 0.0)
          </p>
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            Standard Nigerian & African University Framework
          </span>
        </div>

        {/* 4.0 POINT SCALE OPTION */}
        <div
          onClick={() => handleScaleSelect("4.0")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedType === "4.0"
              ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 dark:border-indigo-700 shadow-sm"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              4.0 Point Grading System
            </span>
            {selectedType === "4.0" && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            A (90-100% = 4.0), B (80-89% = 3.0), C (70-79% = 2.0), D (60-69% = 1.0), F (&lt;60% = 0.0)
          </p>
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            Standard US & Global Higher Education Framework
          </span>
        </div>
      </div>
    </div>
  );
};
