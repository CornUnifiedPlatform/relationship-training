import { Star } from "lucide-react";

export default function ScenarioCard({
  scenario,
  selected,
  onSelect,
  compact,
}) {
  const stars = [];
  for (let i = 0; i < 4; i++) {
    stars.push(
      <Star
        key={i}
        size={compact ? 10 : 12}
        className={i < scenario.difficulty ? "text-[#F59E0B]" : "text-gray-200"}
        fill={i < scenario.difficulty ? "#F59E0B" : "none"}
      />,
    );
  }

  if (compact) {
    return (
      <button
        onClick={() => onSelect(scenario)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left w-full ${
          selected
            ? "border-[#FF6B8A] bg-[#FFF0F3] shadow-md shadow-pink-100"
            : "border-[#F0E4E8] bg-white hover:border-[#FFB3C6] hover:shadow-sm"
        }`}
      >
        <span className="text-xl">{scenario.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-[#1A1A2E]">
            {scenario.name}
          </div>
          <div className="text-xs text-[#888] mt-0.5 truncate">
            {scenario.description}
          </div>
        </div>
        {scenario.difficulty > 0 && <div className="flex gap-0.5">{stars}</div>}
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect(scenario)}
      className={`group relative p-5 rounded-2xl border-2 transition-all text-left w-full ${
        selected
          ? "border-[#FF6B8A] bg-[#FFF0F3] shadow-lg shadow-pink-100"
          : "border-[#F0E4E8] bg-white hover:border-[#FFB3C6] hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      <div className="text-3xl mb-3">{scenario.emoji}</div>
      <h3 className="text-base font-semibold text-[#1A1A2E] mb-1">
        {scenario.name}
      </h3>
      <p className="text-sm text-[#888] mb-3 leading-relaxed">
        {scenario.description}
      </p>
      {scenario.difficulty > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-[#999] mr-1">难度</span>
          {stars}
        </div>
      )}
    </button>
  );
}
