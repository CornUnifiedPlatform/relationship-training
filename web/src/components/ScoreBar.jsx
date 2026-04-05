export default function ScoreBar({ label, score, maxScore, comment }) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  const getColor = (pct) => {
    if (pct >= 80)
      return { bar: "from-[#34D399] to-[#10B981]", text: "text-[#059669]" };
    if (pct >= 60)
      return { bar: "from-[#FBBF24] to-[#F59E0B]", text: "text-[#D97706]" };
    return { bar: "from-[#FB7185] to-[#F43F5E]", text: "text-[#E11D48]" };
  };

  const colors = getColor(percentage);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-[#1A1A2E]">{label}</span>
        <span className={`text-sm font-bold ${colors.text}`}>
          {score}/{maxScore}
        </span>
      </div>
      <div className="w-full h-2.5 bg-[#F3F0F5] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {comment && (
        <p className="text-xs text-[#888] mt-1.5 leading-relaxed">{comment}</p>
      )}
    </div>
  );
}
