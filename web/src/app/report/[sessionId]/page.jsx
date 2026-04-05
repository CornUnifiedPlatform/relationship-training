import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  RotateCcw,
  Shuffle,
  Trophy,
  Lightbulb,
  PenLine,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import ScoreBar from "../../../components/ScoreBar";
import ProtectedPage from "../../../components/ProtectedPage";

export default function ReportPage({ params }) {
  const { sessionId } = params;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) throw new Error("训练不存在");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFBFC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={24} className="text-[#FF6B8A] mx-auto mb-3" />
          <p className="text-sm text-[#888]">加载报告中...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#FFFBFC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#888] mb-4">训练不存在</p>
          <a href="/dashboard" className="text-[#FF6B8A] no-underline">
            返回训练中心
          </a>
        </div>
      </div>
    );
  }

  const report = session.report;
  if (!report) {
    return (
      <div className="min-h-screen bg-[#FFFBFC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#888] mb-4">此训练还没有生成报告</p>
          <a
            href={`/train/${sessionId}`}
            className="text-[#FF6B8A] no-underline"
          >
            回到训练
          </a>
        </div>
      </div>
    );
  }

  const crushName = session.crush_name || session.slug || "对方";
  const totalScore = report.total_score || 0;

  const getScoreColor = (score) => {
    if (score >= 80) return "from-[#34D399] to-[#10B981]";
    if (score >= 60) return "from-[#FBBF24] to-[#F59E0B]";
    return "from-[#FB7185] to-[#F43F5E]";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "非常棒！";
    if (score >= 80) return "很不错";
    if (score >= 70) return "继续加油";
    if (score >= 60) return "还有提升空间";
    return "需要多练习";
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-[#FFFBFC]">
        <Navbar />

        <div className="pt-24 pb-16 px-6">
          <div className="max-w-2xl mx-auto">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-[#888] hover:text-[#1A1A2E] mb-6 no-underline"
            >
              <ArrowLeft size={16} />
              返回训练中心
            </a>

            {/* Report Header */}
            <div
              className={`text-center mb-8 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transition: "all 0.5s ease" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF0F3] text-xs text-[#FF6B8A] mb-4">
                📋 训练复盘报告
              </div>
              <h1 className="text-xl font-bold text-[#1A1A2E] mb-1 font-noto-sans-sc">
                {crushName} · {session.scene}
              </h1>
              <p className="text-sm text-[#999]">
                {session.feedback_mode === "实时提示"
                  ? "🔴 实时提示模式"
                  : "🔵 事后复盘模式"}
              </p>
            </div>

            {/* Total Score */}
            <div
              className={`p-8 rounded-2xl bg-white border border-[#F0E4E8] text-center mb-6 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transition: "all 0.5s ease 0.1s" }}
            >
              <div className="mb-2">
                <span
                  className={`text-5xl font-bold bg-gradient-to-r ${getScoreColor(totalScore)} bg-clip-text text-transparent`}
                >
                  {totalScore}
                </span>
                <span className="text-lg text-[#999]">/100</span>
              </div>
              <p className="text-sm text-[#888]">{getScoreLabel(totalScore)}</p>
            </div>

            {/* Dimensions */}
            <div
              className={`p-6 rounded-2xl bg-white border border-[#F0E4E8] mb-6 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transition: "all 0.5s ease 0.2s" }}
            >
              <h3 className="text-base font-semibold text-[#1A1A2E] mb-5">
                维度评分
              </h3>
              {(report.dimensions || []).map((d, i) => (
                <ScoreBar
                  key={i}
                  label={d.name}
                  score={d.score}
                  maxScore={d.max_score || 20}
                  comment={d.comment}
                />
              ))}
            </div>

            {/* Highlights */}
            {report.highlights && report.highlights.length > 0 && (
              <div
                className={`p-6 rounded-2xl bg-white border border-[#F0E4E8] mb-6 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transition: "all 0.5s ease 0.3s" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={18} className="text-[#F59E0B]" />
                  <h3 className="text-base font-semibold text-[#1A1A2E]">
                    本次亮点
                  </h3>
                </div>
                <div className="space-y-2">
                  {report.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-[#10B981] mt-0.5">✦</span>
                      <span className="text-[#555] leading-relaxed">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {report.improvements && report.improvements.length > 0 && (
              <div
                className={`p-6 rounded-2xl bg-white border border-[#F0E4E8] mb-6 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transition: "all 0.5s ease 0.35s" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={18} className="text-[#7C5CFC]" />
                  <h3 className="text-base font-semibold text-[#1A1A2E]">
                    改进建议
                  </h3>
                </div>
                <div className="space-y-2">
                  {report.improvements.map((imp, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-[#7C5CFC] mt-0.5">→</span>
                      <span className="text-[#555] leading-relaxed">{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rewrite Examples */}
            {report.rewrite_examples && report.rewrite_examples.length > 0 && (
              <div
                className={`p-6 rounded-2xl bg-white border border-[#F0E4E8] mb-6 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transition: "all 0.5s ease 0.4s" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <PenLine size={18} className="text-[#FF6B8A]" />
                  <h3 className="text-base font-semibold text-[#1A1A2E]">
                    改写示例
                  </h3>
                </div>
                <div className="space-y-4">
                  {report.rewrite_examples.map((ex, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[#FFFBFC] border border-[#F0E4E8]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-400 text-xs">
                          原句
                        </span>
                        <span className="text-sm text-[#888] line-through">
                          {ex.original}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs">
                          改进
                        </span>
                        <span className="text-sm text-[#1A1A2E] font-medium">
                          {ex.improved}
                        </span>
                      </div>
                      <p className="text-xs text-[#999] mt-2 pl-1">
                        {ex.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coach Summary */}
            {report.coach_summary && (
              <div
                className={`p-6 rounded-2xl bg-gradient-to-r from-[#FFF8E1] to-[#FFF3CD] border border-[#FFE082] mb-6 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transition: "all 0.5s ease 0.45s" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">💬</span>
                  <span className="text-sm font-semibold text-[#F59E0B]">
                    Coach 总结
                  </span>
                </div>
                <p className="text-sm text-[#92400E] leading-relaxed">
                  {report.coach_summary}
                </p>
                {report.next_suggestion && (
                  <div className="mt-4 pt-4 border-t border-[#FFE082]/50">
                    <p className="text-xs text-[#B45309]">
                      <strong>下次建议：</strong>
                      {report.next_suggestion}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div
              className={`flex flex-col sm:flex-row gap-3 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transition: "all 0.5s ease 0.5s" }}
            >
              <a
                href={`/train/setup?profileId=${session.profile_id}`}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] hover:shadow-lg transition-all no-underline"
              >
                <RotateCcw size={16} />
                再来一次
              </a>
              <a
                href="/dashboard"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium text-[#666] bg-[#F5F3F7] hover:bg-[#E5E2E9] transition-all no-underline"
              >
                <Shuffle size={16} />
                换个场景
              </a>
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
