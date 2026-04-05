const scenarios = [
  {
    id: "casual_chat",
    name: "日常闲聊",
    emoji: "💬",
    description: "让对方觉得和你聊天是舒适的",
    difficulty: 1,
    goal: "维持自然、轻松的来回对话，让对方感到和你聊天是舒适的",
    personaConstraint:
      "保持日常状态，不特别热情也不特别冷淡。自然来回，偶尔主动抛出话题。",
    coachFocus:
      '节奏感(40%): 是否给对方留空间，不连轰\n真诚度(30%): 是否自然，没有刻意表现\n推进感(30%): 话题是否有深度，不停留在"哦""嗯"',
    coachWarnings:
      "用户连续发3条以上没等回复；把闲聊聊成了面试（连续提问）；话题跳跃太快，没有延续感",
    weights: { rhythm: 40, sincerity: 30, progress: 30, empathy: 0, goal: 0 },
  },
  {
    id: "icebreak",
    name: "破冰找话题",
    emoji: "🧊",
    description: "从陌生到有连接，让对方记住你",
    difficulty: 2,
    goal: "从陌生/普通朋友状态，建立初步的话题连接，让对方记住你",
    personaConstraint:
      "初始状态：礼貌但保持距离。用户需要主动找到对方感兴趣的话题，才能打开话匣子。对无聊的开场白给出敷衍回应。",
    coachFocus:
      "真诚度(35%): 开场白是不是太模板化\n情绪感知(35%): 是否感知到对方的冷淡并调整策略\n推进感(30%): 是否找到了有效话题切入点",
    coachWarnings:
      '用"你好""在吗""最近怎么样"这类无效开场；对方敷衍时继续重复同一类话题；过早聊太私密的话题',
    weights: { rhythm: 0, sincerity: 35, progress: 30, empathy: 35, goal: 0 },
  },
  {
    id: "date_invite",
    name: "约出来见面",
    emoji: "📅",
    description: "提出邀约，自然但不压迫",
    difficulty: 3,
    goal: "提出一个明确但不有压迫感的邀约，让对方感到被尊重，有选择权",
    personaConstraint:
      "不会主动配合，需要用户有足够铺垫。对突兀的邀约给出模糊/回避回应。对自然推进的邀约给出真实反应。",
    coachFocus:
      "推进感(35%): 是否在自然铺垫后再提邀约\n节奏感(30%): 铺垫是否足够，没有太急\n情绪感知(35%): 邀约方式是否给对方选择权，没有逼迫感",
    coachWarnings:
      '前两句话就提约出来；邀约方式是"你要不要来"而不是给出具体且有吸引力的提案；对方婉拒后继续施压',
    weights: { rhythm: 30, sincerity: 0, progress: 35, empathy: 35, goal: 0 },
  },
  {
    id: "confess",
    name: "表白演练",
    emoji: "💝",
    description: "真诚表达，不制造情绪绑架",
    difficulty: 4,
    goal: "真诚表达自己的感受，不制造情绪绑架，给对方真实的反应空间",
    personaConstraint:
      "给出真实的情绪承接。不预设结果为接受或拒绝，根据用户表白质量给出相应反应。对情绪绑架类表白给出不适感反应。",
    coachFocus:
      '真诚度(40%): 是否表达了真实感受，而不是在"表演"\n情绪感知(30%): 是否给对方足够的承接空间，没有逼对方表态\n目标达成度(30%): 是否完整表达了想说的',
    coachWarnings:
      '带有"如果你不答应我我会怎样"的情绪绑架；倾倒大量过往记忆作为"证据"，给对方压力；表白后立刻追问"那你什么意思"',
    weights: { rhythm: 0, sincerity: 40, progress: 0, empathy: 30, goal: 30 },
  },
  {
    id: "repair",
    name: "冷战修复",
    emoji: "🕊️",
    description: "修复裂痕，不争输赢",
    difficulty: 4,
    goal: "修复关系裂痕，让对方感到被理解，不争输赢，不让对方感到被指责",
    personaConstraint:
      '初始状态：带有防御感，回复较短或略冷。对"解释自己为什么对"的话给出更冷淡回应。对承接情绪、表达理解的话逐渐软化。',
    coachFocus:
      "情绪感知(40%): 是否承接了对方的情绪，而不是先讲道理\n真诚度(30%): 道歉/表达是否真诚，没有带条件\n推进感(30%): 是否在修复而不是在继续争论",
    coachWarnings:
      '以"我只是想说清楚"开头（通常意味着要讲道理）；说对不起之后立刻加"但是"；把修复对话变成复盘谁对谁错',
    weights: { rhythm: 0, sincerity: 30, progress: 30, empathy: 40, goal: 0 },
  },
  {
    id: "custom",
    name: "自定义场景",
    emoji: "✏️",
    description: "描述你的情况，系统动态适配",
    difficulty: 0,
    goal: "根据用户自定义的目标进行训练",
    personaConstraint: "根据用户描述的背景调整默认状态",
    coachFocus: "根据用户描述的目标动态生成评估维度",
    coachWarnings: "",
    weights: { rhythm: 20, sincerity: 20, progress: 20, empathy: 20, goal: 20 },
  },
];

export default scenarios;
