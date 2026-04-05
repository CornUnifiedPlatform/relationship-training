export default function ChatBubble({ role, content, crushName }) {
  const isUser = role === "user";
  const isCoach = role === "coach";

  if (isCoach) {
    return (
      <div className="flex justify-center my-3 px-4">
        <div className="max-w-md bg-gradient-to-r from-[#FFF8E1] to-[#FFF3CD] border border-[#FFE082] rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">💬</span>
            <span className="text-xs font-semibold text-[#F59E0B]">Coach</span>
          </div>
          <p className="text-sm text-[#92400E] leading-relaxed m-0">
            {content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 px-4`}
    >
      <div
        className={`flex items-end gap-2 max-w-[75%] ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            isUser
              ? "bg-gradient-to-br from-[#7C5CFC] to-[#5B3FD9] text-white"
              : "bg-gradient-to-br from-[#FF6B8A] to-[#FF8FA3] text-white"
          }`}
        >
          {isUser ? "我" : crushName ? crushName[0] : "❤"}
        </div>

        {/* Bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-gradient-to-br from-[#7C5CFC] to-[#6D4AFF] text-white rounded-br-md"
              : "bg-white border border-[#F0E4E8] text-[#1A1A2E] rounded-bl-md shadow-sm"
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
