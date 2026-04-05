import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Loader2,
  ChevronRight,
  User,
  Heart,
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import ProtectedPage from "../../../components/ProtectedPage";

const PERSONALITY_OPTIONS = [
  "温柔",
  "活泼",
  "内敛",
  "幽默",
  "理性",
  "感性",
  "慢热",
  "直接",
  "细腻",
  "独立",
  "粘人",
  "高冷",
];
const RELATIONSHIP_OPTIONS = ["刚认识", "普通朋友", "暧昧", "好朋友", "前任"];

export default function CreateProfilePage() {
  const [step, setStep] = useState(1);
  const [slug, setSlug] = useState("");
  const [basicInfo, setBasicInfo] = useState("");
  const [personalityTags, setPersonalityTags] = useState([]);
  const [relationshipStatus, setRelationshipStatus] = useState("普通朋友");
  const [chatText, setChatText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  // Analyze mutation
  const analyzeMutation = useMutation({
    mutationFn: async (text) => {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_text: text }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "分析失败");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      if (data.personality_tags) {
        setPersonalityTags(data.personality_tags);
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Create profile mutation
  const createMutation = useMutation({
    mutationFn: async (profile) => {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "创建失败");
      }
      return res.json();
    },
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleAnalyze = useCallback(() => {
    if (!chatText.trim()) return;
    setError(null);
    analyzeMutation.mutate(chatText);
  }, [chatText, analyzeMutation]);

  const handleSubmit = useCallback(() => {
    if (!slug.trim()) {
      setError("请输入花名/代号");
      return;
    }
    setError(null);
    createMutation.mutate({
      slug: slug.trim(),
      basic_info: basicInfo || null,
      personality_tags: personalityTags.length > 0 ? personalityTags : null,
      relationship_status: relationshipStatus,
      raw_chat_text: chatText || null,
      message_length: analysis?.message_length || "中等",
      word_style: analysis?.word_style || "随意",
      emotion_style: analysis?.emotion_style || "内敛",
      reply_pace: analysis?.reply_pace || "看心情",
      topic_sensitivity: analysis?.topic_sensitivity || null,
      persona_summary: analysis?.persona_summary || null,
    });
  }, [
    slug,
    basicInfo,
    personalityTags,
    relationshipStatus,
    chatText,
    analysis,
    createMutation,
  ]);

  const toggleTag = useCallback((tag) => {
    setPersonalityTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-[#FFFBFC]">
        <Navbar />

        <div className="pt-24 pb-16 px-6">
          <div className="max-w-2xl mx-auto">
            {/* Back */}
            <a
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-[#888] hover:text-[#1A1A2E] mb-6 no-underline"
            >
              <ArrowLeft size={16} />
              返回训练中心
            </a>

            <h1 className="text-2xl font-bold text-[#1A1A2E] mb-2 font-noto-sans-sc">
              创建 Crush 档案
            </h1>
            <p className="text-sm text-[#888] mb-8">
              填写基本信息，上传聊天记录，系统自动构建 ta 的模拟人格
            </p>

            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === s
                        ? "bg-gradient-to-br from-[#FF6B8A] to-[#C084FC] text-white"
                        : step > s
                          ? "bg-[#10B981] text-white"
                          : "bg-[#F0E4E8] text-[#999]"
                    }`}
                  >
                    {step > s ? "✓" : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-12 h-0.5 ${step > s ? "bg-[#10B981]" : "bg-[#F0E4E8]"}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white border border-[#F0E4E8]">
                  <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">
                    花名 / 代号 <span className="text-[#FF6B8A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="给 ta 起一个代号，例如：小月亮"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#FF6B8A] focus:ring-2 focus:ring-[#FF6B8A]/20 transition-all"
                  />
                </div>

                <div className="p-6 rounded-2xl bg-white border border-[#F0E4E8]">
                  <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">
                    基本信息{" "}
                    <span className="text-xs text-[#999]">（可选）</span>
                  </label>
                  <textarea
                    value={basicInfo}
                    onChange={(e) => setBasicInfo(e.target.value)}
                    placeholder="年龄、职业、爱好等，帮助 AI 更准确地模拟"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#FF6B8A] focus:ring-2 focus:ring-[#FF6B8A]/20 transition-all resize-none"
                  />
                </div>

                <div className="p-6 rounded-2xl bg-white border border-[#F0E4E8]">
                  <label className="block text-sm font-semibold text-[#1A1A2E] mb-3">
                    当前关系
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setRelationshipStatus(opt)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          relationshipStatus === opt
                            ? "bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] text-white shadow-md"
                            : "bg-[#F5F3F7] text-[#666] hover:bg-[#F0E4E8]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-[#F0E4E8]">
                  <label className="block text-sm font-semibold text-[#1A1A2E] mb-3">
                    性格标签{" "}
                    <span className="text-xs text-[#999]">
                      （可选，可多选）
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PERSONALITY_OPTIONS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          personalityTags.includes(tag)
                            ? "bg-[#7C5CFC] text-white"
                            : "bg-[#F3E8FF] text-[#7C5CFC] hover:bg-[#E9DDFF]"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!slug.trim()) {
                      setError("请输入花名/代号");
                      return;
                    }
                    setError(null);
                    setStep(2);
                  }}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  下一步
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Step 2: Chat Upload */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white border border-[#F0E4E8]">
                  <div className="flex items-center gap-3 mb-4">
                    <Upload size={20} className="text-[#FF6B8A]" />
                    <div>
                      <label className="block text-sm font-semibold text-[#1A1A2E]">
                        上传聊天记录
                      </label>
                      <p className="text-xs text-[#999] mt-0.5">
                        粘贴你和 {slug} 的聊天内容，AI 会自动分析 ta 的性格
                      </p>
                    </div>
                  </div>
                  <textarea
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    placeholder={`粘贴聊天记录，例如：\n\n我：最近在看什么剧？\n${slug}：在追一个日剧，超好看\n我：哪个？推荐一下\n${slug}：重启人生，你也看看，特别治愈`}
                    rows={12}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#FF6B8A] focus:ring-2 focus:ring-[#FF6B8A]/20 transition-all resize-none font-mono"
                  />

                  {chatText.trim().length > 20 && (
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzeMutation.isPending}
                      className="mt-4 w-full py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#7C5CFC] to-[#A855F7] hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {analyzeMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          AI 正在分析...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          AI 分析性格
                        </>
                      )}
                    </button>
                  )}

                  {/* Analysis Result */}
                  {analysis && (
                    <div className="mt-6 p-4 rounded-xl bg-[#F3E8FF]/50 border border-[#DDD6FE]">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={14} className="text-[#7C5CFC]" />
                        <span className="text-sm font-semibold text-[#7C5CFC]">
                          AI 分析结果
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex gap-2">
                          <span className="text-[#999] w-20 flex-shrink-0">
                            说话风格
                          </span>
                          <span className="text-[#1A1A2E]">
                            {analysis.word_style}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[#999] w-20 flex-shrink-0">
                            情绪表达
                          </span>
                          <span className="text-[#1A1A2E]">
                            {analysis.emotion_style}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[#999] w-20 flex-shrink-0">
                            回复节奏
                          </span>
                          <span className="text-[#1A1A2E]">
                            {analysis.reply_pace}
                          </span>
                        </div>
                        {analysis.personality_tags && (
                          <div className="flex gap-2 flex-wrap mt-2">
                            <span className="text-[#999] w-20 flex-shrink-0">
                              性格标签
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {analysis.personality_tags.map((t, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-full bg-[#7C5CFC] text-white text-xs"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {analysis.persona_summary && (
                          <div className="mt-3 pt-3 border-t border-[#DDD6FE]">
                            <p className="text-[#555] leading-relaxed">
                              {analysis.persona_summary}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 rounded-xl text-sm text-[#666] bg-[#F5F3F7] hover:bg-[#E5E2E9] transition-all"
                  >
                    上一步
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {chatText.trim() ? "下一步" : "跳过，直接下一步"}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white border border-[#F0E4E8]">
                  <h3 className="text-base font-semibold text-[#1A1A2E] mb-4">
                    确认档案信息
                  </h3>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B8A] to-[#FF8FA3] flex items-center justify-center text-white text-2xl font-bold">
                      {slug[0]}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#1A1A2E]">
                        {slug}
                      </div>
                      <div className="text-sm text-[#FF6B8A]">
                        {relationshipStatus}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    {basicInfo && (
                      <div className="flex gap-2">
                        <span className="text-[#999] w-20 flex-shrink-0">
                          基本信息
                        </span>
                        <span className="text-[#1A1A2E]">{basicInfo}</span>
                      </div>
                    )}
                    {personalityTags.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[#999] w-20 flex-shrink-0">
                          性格
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {personalityTags.map((t, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full bg-[#F3E8FF] text-[#7C5CFC] text-xs"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {analysis && (
                      <>
                        <div className="flex gap-2">
                          <span className="text-[#999] w-20 flex-shrink-0">
                            说话风格
                          </span>
                          <span className="text-[#1A1A2E]">
                            {analysis.word_style}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[#999] w-20 flex-shrink-0">
                            情绪表达
                          </span>
                          <span className="text-[#1A1A2E]">
                            {analysis.emotion_style}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex gap-2">
                      <span className="text-[#999] w-20 flex-shrink-0">
                        聊天记录
                      </span>
                      <span className="text-[#1A1A2E]">
                        {chatText.trim() ? "已上传" : "未上传"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3.5 rounded-xl text-sm text-[#666] bg-[#F5F3F7] hover:bg-[#E5E2E9] transition-all"
                  >
                    上一步
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={createMutation.isPending}
                    className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        创建中...
                      </>
                    ) : (
                      <>
                        <Heart size={16} fill="white" />
                        完成创建
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
