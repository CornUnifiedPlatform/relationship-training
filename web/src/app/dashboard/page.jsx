import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  User,
  MessageCircle,
  Trash2,
  Play,
  Clock,
  ChevronRight,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import ProtectedPage from "../../components/ProtectedPage";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const res = await fetch("/api/profiles");
      if (!res.ok) throw new Error("获取档案失败");
      return res.json();
    },
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await fetch("/api/sessions");
      if (!res.ok) throw new Error("获取训练记录失败");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/profiles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      setDeleteConfirm(null);
    },
  });

  const handleDelete = useCallback(
    (id) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  const recentSessions = sessions.slice(0, 5);

  const statusMap = {
    active: { label: "进行中", color: "bg-green-100 text-green-700" },
    completed: { label: "已完成", color: "bg-gray-100 text-gray-600" },
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-[#FFFBFC]">
        <Navbar />

        <div className="pt-24 pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[#1A1A2E] font-noto-sans-sc">
                  训练中心
                </h1>
                <p className="text-sm text-[#888] mt-1">
                  管理你的 Crush 档案，开始新训练
                </p>
              </div>
              <a
                href="/profile/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] hover:shadow-lg hover:shadow-pink-200/50 transition-all no-underline"
              >
                <Plus size={16} />
                新建档案
              </a>
            </div>

            {/* Profiles Grid */}
            <div className="mb-12">
              <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">
                Crush 档案
              </h2>

              {profilesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-white border border-[#F0E4E8] animate-pulse"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-100 mb-4" />
                      <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-gray-50 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : profiles.length === 0 ? (
                <div className="text-center py-16 px-6 rounded-2xl bg-white border-2 border-dashed border-[#F0E4E8]">
                  <div className="text-4xl mb-4">💌</div>
                  <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">
                    还没有 Crush 档案
                  </h3>
                  <p className="text-sm text-[#888] mb-6">
                    创建你的第一个档案，开始训练之旅
                  </p>
                  <a
                    href="/profile/create"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] no-underline"
                  >
                    <Plus size={16} />
                    创建第一个档案
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profiles.map((p) => (
                    <div
                      key={p.id}
                      className="group p-5 rounded-2xl bg-white border border-[#F0E4E8] hover:shadow-md hover:-translate-y-0.5 transition-all relative"
                    >
                      {/* Delete button */}
                      {deleteConfirm === p.id ? (
                        <div className="absolute top-3 right-3 flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            确认
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B8A] to-[#FF8FA3] flex items-center justify-center text-white text-lg font-bold mb-4">
                        {p.slug[0]}
                      </div>

                      <h3 className="text-base font-semibold text-[#1A1A2E] mb-1">
                        {p.slug}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FFF0F3] text-xs text-[#FF6B8A]">
                          {p.relationship_status || "普通朋友"}
                        </span>
                        {p.session_count > 0 && (
                          <span className="text-xs text-[#999]">
                            {p.session_count} 次训练
                          </span>
                        )}
                      </div>

                      {p.personality_tags && p.personality_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {p.personality_tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full bg-[#F3E8FF] text-xs text-[#7C5CFC]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <a
                        href={`/train/setup?profileId=${p.id}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-[#FF6B8A] bg-[#FFF0F3] hover:bg-[#FFE4EC] transition-colors no-underline"
                      >
                        <Play size={14} />
                        开始训练
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Sessions */}
            {recentSessions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">
                  最近训练
                </h2>
                <div className="space-y-3">
                  {recentSessions.map((s) => {
                    const statusInfo = statusMap[s.status] || statusMap.active;
                    const date = new Date(s.created_at);
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

                    return (
                      <a
                        key={s.id}
                        href={
                          s.status === "completed"
                            ? `/report/${s.id}`
                            : `/train/${s.id}`
                        }
                        className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#F0E4E8] hover:shadow-sm hover:border-[#FFD6E0] transition-all no-underline"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] flex items-center justify-center">
                            <MessageCircle
                              size={18}
                              className="text-[#FF6B8A]"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#1A1A2E]">
                                {s.crush_name}
                              </span>
                              <span className="text-xs text-[#999]">
                                · {s.scene}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Clock size={12} className="text-[#CCC]" />
                              <span className="text-xs text-[#999]">
                                {dateStr}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${statusInfo.color}`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-[#CCC]" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
