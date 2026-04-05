import { useState, useEffect } from "react";
import {
  Heart,
  Upload,
  MessageCircle,
  BarChart3,
  ChevronRight,
  Star,
  Sparkles,
  Shield,
} from "lucide-react";
import Navbar from "../components/Navbar";
import scenarios from "../data/scenarios";
import ProtectedPage from "../components/ProtectedPage";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const demoScenarios = scenarios.filter((s) => s.id !== "custom");

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-[#FFFBFC]">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-28 pb-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFF0F3] via-[#FDE8F0] to-[#F3E8FF] opacity-80" />
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-[#FF6B8A]/10 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-60 h-60 rounded-full bg-[#C084FC]/10 blur-3xl" />

          <div className="relative max-w-3xl mx-auto text-center">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-[#FFD6E0] mb-8 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transition: "all 0.6s ease" }}
            >
              <Sparkles size={14} className="text-[#FF6B8A]" />
              <span className="text-sm text-[#FF6B8A] font-medium">
                AI 驱动的安全训练沙盒
              </span>
            </div>

            <h1
              className={`text-4xl md:text-5xl font-bold text-[#1A1A2E] leading-tight mb-6 font-noto-sans-sc ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transition: "all 0.6s ease 0.1s" }}
            >
              喜欢一个人
              <br />
              <span className="bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] bg-clip-text text-transparent">
                却不知道怎么开口？
              </span>
            </h1>

            <p
              className={`text-lg text-[#666] leading-relaxed mb-4 max-w-xl mx-auto ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transition: "all 0.6s ease 0.2s" }}
            >
              上传你们的聊天记录，AI 模拟 ta 的性格
              <br />
              在安全的沙盒里，反复练习，找到属于你的方式
            </p>

            <p
              className={`text-sm text-[#999] mb-10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transition: "all 0.6s ease 0.25s" }}
            >
              不是教你套路，是帮你成为更好的自己 💌
            </p>

            <div
              className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transition: "all 0.6s ease 0.3s" }}
            >
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-200/60 hover:-translate-y-0.5 transition-all no-underline"
              >
                开始训练
                <ChevronRight size={18} />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-base text-[#666] hover:text-[#1A1A2E] hover:bg-white/60 transition-all no-underline"
              >
                了解更多
              </a>
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="py-16 px-6 bg-white/50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-[#1A1A2E] mb-8 font-noto-sans-sc">
              你有没有这样的时刻——
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {[
                "想找话题，却脑子一片空白",
                "好不容易约出来，不知道说什么",
                'ta 回了一句"哦"，你不知道是好是坏',
                '鼓起勇气想表白，却说成了"我们做朋友吧"',
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#F0E4E8] text-left"
                >
                  <span className="text-[#FF6B8A] mt-0.5 text-lg">💭</span>
                  <span className="text-sm text-[#555] leading-relaxed">
                    {text}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-lg font-semibold text-[#1A1A2E]">
              <span className="bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] bg-clip-text text-transparent">
                恋爱训练
              </span>
              就是为这些时刻而生的。
            </p>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-[#1A1A2E] mb-4 font-noto-sans-sc">
              它能做什么
            </h2>
            <p className="text-center text-[#888] mb-12 text-sm">
              三步开始，AI 全程陪练
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Upload size={24} />,
                  title: "上传聊天记录",
                  desc: "系统自动分析 ta 的性格、说话风格和情绪模式，构建模拟人格",
                  color: "from-[#FF6B8A] to-[#FF8FA3]",
                },
                {
                  icon: <MessageCircle size={24} />,
                  title: "沙盒练习对话",
                  desc: '在安全环境里和"ta"聊天，想怎么练就怎么练，不怕说错',
                  color: "from-[#C084FC] to-[#A855F7]",
                },
                {
                  icon: <BarChart3 size={24} />,
                  title: "Coach 实时反馈",
                  desc: "每轮对话后获得专业点评，或训练结束后获得完整复盘报告",
                  color: "from-[#F59E0B] to-[#EAB308]",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="relative p-6 rounded-2xl bg-white border border-[#F0E4E8] hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#FFF0F3] border-2 border-white flex items-center justify-center text-xs font-bold text-[#FF6B8A] shadow">
                    {i + 1}
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-4`}
                  >
                    {step.icon}
                  </div>
                  <h3 className="text-base font-semibold text-[#1A1A2E] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#888] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Flow diagram */}
            <div className="mt-12 flex items-center justify-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-[#F0E4E8] text-sm text-[#666]">
                <span>你说话</span>
                <span className="text-[#FF6B8A]">→</span>
                <span>AI 模拟 crush 回应</span>
                <span className="text-[#C084FC]">→</span>
                <span>Coach 给出点评</span>
                <span className="text-[#F59E0B]">→</span>
                <span className="font-semibold text-[#1A1A2E]">
                  你越来越自然
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback Modes */}
        <section className="py-16 px-6 bg-gradient-to-b from-white/50 to-[#FFFBFC]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-[#1A1A2E] mb-10 font-noto-sans-sc">
              两种反馈模式
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white border-2 border-[#FFD6E0] shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-lg">
                    🔴
                  </div>
                  <h3 className="text-base font-semibold text-[#1A1A2E]">
                    实时提示
                  </h3>
                </div>
                <p className="text-sm text-[#666] leading-relaxed">
                  每轮对话后 Coach
                  附上一句提醒，边练边学。适合初次训练和快速提升。
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white border-2 border-[#DDD6FE] shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-lg">
                    🔵
                  </div>
                  <h3 className="text-base font-semibold text-[#1A1A2E]">
                    事后复盘
                  </h3>
                </div>
                <p className="text-sm text-[#666] leading-relaxed">
                  对话结束后生成完整训练报告，沉浸式模拟。适合有经验的训练者。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Training Scenarios */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-[#1A1A2E] mb-4 font-noto-sans-sc">
              训练场景
            </h2>
            <p className="text-center text-[#888] mb-12 text-sm">
              从轻松闲聊到勇敢表白，循序渐进
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoScenarios.map((s) => {
                const difficultyStars = [];
                for (let i = 0; i < 4; i++) {
                  difficultyStars.push(
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < s.difficulty ? "text-[#F59E0B]" : "text-gray-200"
                      }
                      fill={i < s.difficulty ? "#F59E0B" : "none"}
                    />,
                  );
                }
                return (
                  <div
                    key={s.id}
                    className="p-5 rounded-2xl bg-white border border-[#F0E4E8] hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className="text-2xl mb-3">{s.emoji}</div>
                    <h3 className="text-base font-semibold text-[#1A1A2E] mb-1">
                      {s.name}
                    </h3>
                    <p className="text-sm text-[#888] mb-3">{s.description}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[#999] mr-1">难度</span>
                      {difficultyStars}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sample Report */}
        <section className="py-16 px-6 bg-gradient-to-b from-[#FFFBFC] to-[#FFF0F3]/30">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-[#1A1A2E] mb-10 font-noto-sans-sc">
              复盘报告示例
            </h2>
            <div className="bg-white rounded-2xl border border-[#F0E4E8] p-6 shadow-sm font-mono text-sm">
              <div className="text-center mb-4 pb-4 border-b border-[#F0E4E8]">
                <div className="text-xs text-[#999] mb-1">📋 训练复盘报告</div>
                <div className="text-sm font-semibold text-[#1A1A2E]">
                  场景：约出来
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] bg-clip-text text-transparent">
                    78
                  </span>
                  <span className="text-sm text-[#999]">/100</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  {
                    name: "节奏感",
                    score: 16,
                    comment: "给对方留了空间，不错",
                  },
                  { name: "真诚度", score: 14, comment: "有一句话略显刻意" },
                  { name: "推进感", score: 16, comment: "铺垫充分，推进自然" },
                  { name: "情绪感知", score: 12, comment: "错过了一个小信号" },
                  {
                    name: "目标达成",
                    score: 16,
                    comment: "邀约提出了，对方没拒绝",
                  },
                ].map((d) => {
                  const pct = (d.score / 20) * 100;
                  return (
                    <div key={d.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#555]">{d.name}</span>
                        <span className="text-[#999]">{d.score}/20</span>
                      </div>
                      <div className="w-full h-2 bg-[#F3F0F5] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF6B8A] to-[#C084FC]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-xs text-[#999] mt-0.5">
                        {d.comment}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-[#F0E4E8] text-xs text-[#666] leading-relaxed">
                <strong className="text-[#1A1A2E]">Coach：</strong>
                铺垫做得很好，但最后邀约的方式可以更具体一点。"要不要出来"不如"周六下午茶怎么样"更容易得到回应。
              </div>
            </div>
          </div>
        </section>

        {/* Safety */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Shield size={20} className="text-[#10B981]" />
              <h2 className="text-xl font-bold text-[#1A1A2E] font-noto-sans-sc">
                安全边界
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {[
                "仅用于个人沟通练习与自我成长",
                "Coach 不提供操控或 PUA 类话术",
                "Persona 有硬性规则，不模拟不现实的反转",
                "所有数据安全存储，保护你的隐私",
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5]"
                >
                  <span className="text-[#10B981] mt-0.5">✅</span>
                  <span className="text-sm text-[#065F46]">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-md mx-auto text-center">
            <p className="text-lg text-[#666] mb-6">准备好了吗？</p>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] shadow-lg shadow-pink-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all no-underline"
            >
              <Heart size={18} fill="white" />
              开始训练
            </a>
            <p className="mt-6 text-sm text-[#999]">祝你顺利。Good luck. 💌</p>
          </div>
        </section>
      </div>
    </ProtectedPage>
  );
}
