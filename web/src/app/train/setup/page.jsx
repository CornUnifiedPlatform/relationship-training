import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Play, Loader2, Zap, FileText } from "lucide-react";
import Navbar from "../../../components/Navbar";
import ScenarioCard from "../../../components/ScenarioCard";
import scenarios from "../../../data/scenarios";
import ProtectedPage from "../../../components/ProtectedPage";

export default function TrainSetupPage() {
  const [profileId, setProfileId] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [feedbackMode, setFeedbackMode] = useState("实时提示");
  const [customGoal, setCustomGoal] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("profileId");
      if (id) setProfileId(id);
    }
  }, []);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: async () => {
      const res = await fetch(`/api/profiles/${profileId}`);
      if (!res.ok) throw new Error("档案不存在");
      return res.json();
    },
    enabled: !!profileId,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "创建训练失败");
      }
      return res.json();
    },
    onSuccess: (session) => {
      window.location.href = `/train/${session.id}`;
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleStart = useCallback(() => {
    if (!selectedScenario) {
      setError("请选择训练场景");
      return;
    }
    setError(null);
    createSessionMutation.mutate({
      profile_id: parseInt(profileId),
      scene: selectedScenario.name,
      feedback_mode: feedbackMode,
    });
  }, [selectedScenario, profileId, feedbackMode, createSessionMutation]);

  if (!profileId) {
    return (
      <ProtectedPage>
        <div className="min-h-screen bg-[#FFFBFC] flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#888] mb-4">缺少 Crush 档案</p>
            <a href="/dashboard" className="text-[#FF6B8A] no-underline">
              返回训练中心
            </a>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-[#FFFBFC]">
        <Navbar />

        <div className="pt-24 pb-16 px-6">
          <div className="max-w-3xl mx-auto">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-[#888] hover:text-[#1A1A2E] mb-6 no-underline"
            >
              <ArrowLeft size={16} />
              返回训练中心
            </a>

            {profileLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="text-[#FF6B8A]" />
              </div>
            ) : profile ? (
              <>
                {/* Profile header */}
                <div className="flex items-center gap-4 mb-8 p-4 rounded-2xl bg-white border border-[#F0E4E8]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B8A] to-[#FF8FA3] flex items-center justify-center text-white text-lg font-bold">
                    {profile.slug[0]}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1A1A2E]">
                      {profile.slug}
                    </h2>
                    <span className="text-sm text-[#FF6B8A]">
                      {profile.relationship_status}
                    </span>
                  </div>
                </div>

                {/* Scenario selection */}
                <h3 className="text-lg font-semibold text-[#1A1A2E] mb-4">
                  选择训练场景
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {scenarios.map((s) => (
                    <ScenarioCard
                      key={s.id}
                      scenario={s}
                      selected={selectedScenario?.id === s.id}
                      onSelect={setSelectedScenario}
                      compact
                    />
                  ))}
                </div>

                {/* Custom scenario input */}
                {selectedScenario?.id === "custom" && (
                  <div className="mb-8 p-4 rounded-2xl bg-white border border-[#F0E4E8]">
                    <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">
                      描述你的场景
                    </label>
                    <textarea
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      placeholder="例如：我们吵架了，ta 已经两天没理我了，我想打破僵局..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#FF6B8A] focus:ring-2 focus:ring-[#FF6B8A]/20 transition-all resize-none"
                    />
                  </div>
                )}

                {/* Feedback mode */}
                <h3 className="text-lg font-semibold text-[#1A1A2E] mb-4">
                  选择反馈模式
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  <button
                    onClick={() => setFeedbackMode("实时提示")}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      feedbackMode === "实时提示"
                        ? "border-[#FF6B8A] bg-[#FFF0F3] shadow-md"
                        : "border-[#F0E4E8] bg-white hover:border-[#FFB3C6]"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Zap size={20} className="text-[#FF6B8A]" />
                      <span className="font-semibold text-[#1A1A2E]">
                        🔴 实时提示
                      </span>
                    </div>
                    <p className="text-sm text-[#888]">
                      每轮对话后 Coach 附上提醒，边练边学
                    </p>
                  </button>
                  <button
                    onClick={() => setFeedbackMode("事后复盘")}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      feedbackMode === "事后复盘"
                        ? "border-[#7C5CFC] bg-[#F3E8FF] shadow-md"
                        : "border-[#F0E4E8] bg-white hover:border-[#C4B5FD]"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <FileText size={20} className="text-[#7C5CFC]" />
                      <span className="font-semibold text-[#1A1A2E]">
                        🔵 事后复盘
                      </span>
                    </div>
                    <p className="text-sm text-[#888]">
                      沉浸式模拟，结束后生成完整训练报告
                    </p>
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Start */}
                <button
                  onClick={handleStart}
                  disabled={
                    !selectedScenario || createSessionMutation.isPending
                  }
                  className="w-full py-4 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] hover:shadow-xl hover:shadow-pink-200/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {createSessionMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      准备中...
                    </>
                  ) : (
                    <>
                      <Play size={18} fill="white" />
                      开始训练
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-[#888]">档案不存在</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
