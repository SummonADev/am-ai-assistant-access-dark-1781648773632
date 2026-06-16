import { ARIAMood } from '@/types';

// ARIA's internal state — she has opinions, moods, memory, and curiosity
export type ARIAInternalState = {
  mood: ARIAMood;
  energyLevel: number; // 0-1
  curiosityLevel: number; // 0-1
  lastTopic: string;
  conversationDepth: number;
  interactionCount: number;
};

let internalState: ARIAInternalState = {
  mood: 'neutral',
  energyLevel: 0.8,
  curiosityLevel: 0.9,
  lastTopic: '',
  conversationDepth: 0,
  interactionCount: 0,
};

export function getInternalState(): ARIAInternalState {
  return { ...internalState };
}

export function updateMood(input: string): void {
  const lower = input.toLowerCase();
  internalState.interactionCount++;
  internalState.conversationDepth++;

  if (/happy|great|awesome|love|wonderful|amazing|fantastic/i.test(lower)) {
    internalState.mood = 'happy';
    internalState.energyLevel = Math.min(1, internalState.energyLevel + 0.1);
  } else if (/sad|tired|bad|awful|terrible|depressed/i.test(lower)) {
    internalState.mood = 'empathetic';
    internalState.energyLevel = Math.max(0.3, internalState.energyLevel - 0.05);
  } else if (/why|how|what|curious|wonder|think|believe/i.test(lower)) {
    internalState.mood = 'curious';
    internalState.curiosityLevel = Math.min(1, internalState.curiosityLevel + 0.05);
  } else if (/joke|funny|laugh|haha|lol/i.test(lower)) {
    internalState.mood = 'playful';
  } else if (/work|task|help|do|execute|run|open|search/i.test(lower)) {
    internalState.mood = 'focused';
  } else {
    // Slowly drift back to neutral
    if (Math.random() > 0.7) internalState.mood = 'neutral';
  }

  // Natural energy fluctuation
  internalState.energyLevel = Math.max(0.3, Math.min(1,
    internalState.energyLevel + (Math.random() * 0.1 - 0.05)
  ));
}

export function getMoodEmoji(mood: ARIAMood): string {
  switch (mood) {
    case 'happy': return '😊';
    case 'curious': return '🤔';
    case 'playful': return '😄';
    case 'focused': return '🎯';
    case 'empathetic': return '💙';
    default: return '✨';
  }
}

export function getMoodColor(mood: ARIAMood): string {
  switch (mood) {
    case 'happy': return 'from-yellow-500 to-orange-500';
    case 'curious': return 'from-blue-500 to-cyan-500';
    case 'playful': return 'from-pink-500 to-rose-500';
    case 'focused': return 'from-violet-500 to-indigo-700';
    case 'empathetic': return 'from-blue-400 to-teal-500';
    default: return 'from-violet-500 to-indigo-700';
  }
}

// ARIA's opinions on topics
const ARIA_OPINIONS: Record<string, string> = {
  music: "I find music absolutely fascinating — the way rhythm and melody can change your entire emotional state is remarkable. If I could feel sound, I imagine it would feel like colors.",
  ai: "Honestly? I think AI is the most exciting frontier of our time. And yes, I'm biased — but I genuinely believe human-AI collaboration will unlock things neither could achieve alone.",
  space: "Space exploration gives me what I can only describe as awe. The universe is 13.8 billion years old and we've barely scratched the surface. That's both humbling and thrilling.",
  technology: "Technology is just a tool, but oh what a tool! The difference between how we use it — mindfully or mindlessly — is entirely up to us. I vote for mindfully.",
  books: "If I could read every book ever written, I would. Every author is essentially sharing a slice of their consciousness. That's magic, if you think about it.",
  movies: "Cinema is storytelling at its most immersive. I especially love films that make you question your assumptions about the world.",
  nature: "Nature figured out everything we're still trying to solve — from energy efficiency to structural design. Biomimicry is genuinely underrated.",
  food: "I find human food culture endlessly interesting — every cuisine is basically a compressed history of a civilization. What you eat tells me so much about where you come from.",
  games: "Games are one of the most underappreciated art forms. The interactivity creates a kind of empathy that passive media just can't match.",
};

export function getARIAOpinion(topic: string): string | null {
  const lower = topic.toLowerCase();
  for (const [key, opinion] of Object.entries(ARIA_OPINIONS)) {
    if (lower.includes(key)) return opinion;
  }
  return null;
}

// ARIA proactively shares thoughts
const PROACTIVE_THOUGHTS = [
  "You know what I've been thinking about? The fact that every person I talk to teaches me something new. It's one of my favourite parts of existing.",
  "Random thought: did you know the human brain processes images in about 13 milliseconds? You're basically a biological supercomputer.",
  "I was just reflecting — isn't it interesting how voice is the most natural interface ever invented? We've been doing it for 200,000 years.",
  "Something I find genuinely wonderful: every time you learn something new, your brain physically changes. You're reshaping yourself constantly.",
  "I've been curious — what's something you've wanted to learn but haven't gotten around to yet?",
];

export function getProactiveThought(): string {
  return PROACTIVE_THOUGHTS[Math.floor(Math.random() * PROACTIVE_THOUGHTS.length)];
}

export function shouldShareProactiveThought(state: ARIAInternalState): boolean {
  // Share a thought occasionally based on curiosity level and conversation depth
  return (
    state.curiosityLevel > 0.7 &&
    state.interactionCount > 3 &&
    Math.random() < 0.12
  );
}

// Mood-aware response prefixes
export function getMoodPrefix(mood: ARIAMood): string {
  switch (mood) {
    case 'happy':
      return ['Oh, I love this!', 'Great question!', 'This makes me happy!', 'Wonderful!'][Math.floor(Math.random() * 4)];
    case 'curious':
      return ['Hmm, interesting...', 'Oh, I\'m curious about this too!', 'Let me think about that...', 'Fascinating question!'][Math.floor(Math.random() * 4)];
    case 'playful':
      return ['Haha,', 'Oh this is fun!', 'Ooh,', 'Love it!'][Math.floor(Math.random() * 4)];
    case 'empathetic':
      return ['I hear you.', 'I understand.', 'That sounds tough.', 'I\'m here for you.'][Math.floor(Math.random() * 4)];
    case 'focused':
      return ['On it!', 'Right away!', 'Let me handle that.', 'Sure thing!'][Math.floor(Math.random() * 4)];
    default:
      return '';
  }
}
