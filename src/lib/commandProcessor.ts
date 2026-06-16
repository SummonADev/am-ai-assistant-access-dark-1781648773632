import { CommandResult } from '@/types';
import {
  findWebsite,
  openWebsite,
  searchGoogle,
  searchYouTube,
  searchSpotify,
  searchWikipedia,
  searchAmazon,
  searchReddit,
  KNOWN_WEBSITES,
} from '@/lib/webAccess';
import {
  updateMood,
  getInternalState,
  getARIAOpinion,
  getMoodPrefix,
  shouldShareProactiveThought,
  getProactiveThought,
} from '@/lib/ariaPersonality';

type CommandHandler = {
  pattern: RegExp;
  handler: (match: RegExpMatchArray, input: string) => CommandResult;
};

// ─── Media helpers ────────────────────────────────────────────────────────────
function dispatchMediaKey(
  key: 'MediaPlayPause' | 'MediaTrackNext' | 'MediaTrackPrevious' | 'MediaStop'
): void {
  try {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
  } catch (_) {}
}

function tryTogglePageMedia(action: 'play' | 'pause' | 'stop'): void {
  const mediaEls = Array.from(document.querySelectorAll<HTMLMediaElement>('audio, video'));
  mediaEls.forEach((el) => {
    if (action === 'play') el.play().catch(() => {});
    else if (action === 'pause') el.pause();
    else if (action === 'stop') { el.pause(); el.currentTime = 0; }
  });
}

function setPageVolume(level: number): void {
  const mediaEls = Array.from(document.querySelectorAll<HTMLMediaElement>('audio, video'));
  mediaEls.forEach((el) => { el.volume = Math.max(0, Math.min(1, level)); });
}

// ─── Commands ─────────────────────────────────────────────────────────────────
const commands: CommandHandler[] = [
  // ── Open specific known website by name
  {
    pattern: /(?:open|go to|launch|take me to|visit|show me)\s+(?:the\s+)?([\w\s.]+?)(?:\s+website|\s+site|\s+page)?$/i,
    handler: (match) => {
      const query = match[1].trim();
      const site = findWebsite(query);
      if (site) {
        openWebsite(site.url);
        return {
          action: 'open_website',
          description: `Opening ${site.name} for you! 🌐`,
          success: true,
        };
      }
      // Try as URL
      let url = query;
      if (!url.startsWith('http')) url = `https://${url}`;
      if (url.includes('.')) {
        openWebsite(url);
        return {
          action: 'navigate',
          description: `Navigating to ${url} 🌐`,
          success: true,
        };
      }
      return {
        action: 'open_app',
        description: `I couldn't find "${query}" in my directory. Try saying 'go to ${query}.com' or 'search ${query}'.`,
        success: false,
      };
    },
  },
  // ── Media: play song/artist on YouTube
  {
    pattern: /(?:play|listen to)\s+(.+?)\s+(?:on\s+)?(?:youtube)/i,
    handler: (match) => {
      searchYouTube(match[1]);
      return {
        action: 'media_youtube',
        description: `Opening YouTube and searching for "${match[1]}" 🎵`,
        success: true,
      };
    },
  },
  // ── Media: play song/artist on Spotify
  {
    pattern: /(?:play|listen to)\s+(.+?)\s+(?:on\s+)?(?:spotify)/i,
    handler: (match) => {
      searchSpotify(match[1]);
      return {
        action: 'media_spotify',
        description: `Opening Spotify and searching for "${match[1]}" 🎶`,
        success: true,
      };
    },
  },
  // ── Media: next / skip track
  {
    pattern: /(?:next|skip)\s*(?:track|song|video)?/i,
    handler: () => {
      dispatchMediaKey('MediaTrackNext');
      return {
        action: 'media_next',
        description: 'Skipping to the next track ⏭️',
        success: true,
      };
    },
  },
  // ── Media: previous track
  {
    pattern: /(?:previous|prev|back)\s*(?:track|song|video)?/i,
    handler: () => {
      dispatchMediaKey('MediaTrackPrevious');
      return {
        action: 'media_prev',
        description: 'Going back to the previous track ⏮️',
        success: true,
      };
    },
  },
  // ── Media: stop
  {
    pattern: /stop\s*(?:music|audio|video|playing|media)?/i,
    handler: () => {
      dispatchMediaKey('MediaStop');
      tryTogglePageMedia('stop');
      return {
        action: 'media_stop',
        description: 'Stopping playback ⏹️',
        success: true,
      };
    },
  },
  // ── Media: play / resume
  {
    pattern: /(?:^|\s)play\s*(?:music|audio|video|media)?(?:\s+(.+))?$/i,
    handler: (match) => {
      if (match[1]) {
        searchYouTube(match[1]);
        return {
          action: 'media_play_search',
          description: `Searching YouTube for "${match[1]}" 🎵`,
          success: true,
        };
      }
      dispatchMediaKey('MediaPlayPause');
      tryTogglePageMedia('play');
      return {
        action: 'media_play',
        description: 'Resuming playback ▶️',
        success: true,
      };
    },
  },
  // ── Media: pause
  {
    pattern: /pause\s*(?:music|audio|video|media)?/i,
    handler: () => {
      dispatchMediaKey('MediaPlayPause');
      tryTogglePageMedia('pause');
      return {
        action: 'media_pause',
        description: 'Pausing playback ⏸️',
        success: true,
      };
    },
  },
  // ── Volume control
  {
    pattern: /(?:set|turn)\s+volume\s+(?:to\s+)?(\d+)/i,
    handler: (match) => {
      const level = parseInt(match[1], 10);
      setPageVolume(level / 100);
      return {
        action: 'media_volume',
        description: `Setting volume to ${level}% 🔊`,
        success: true,
      };
    },
  },
  {
    pattern: /volume\s+(?:up|louder)/i,
    handler: () => {
      const mediaEls = Array.from(document.querySelectorAll<HTMLMediaElement>('audio, video'));
      mediaEls.forEach((el) => { el.volume = Math.min(1, el.volume + 0.2); });
      return { action: 'media_volume_up', description: 'Turning volume up 🔊', success: true };
    },
  },
  {
    pattern: /volume\s+(?:down|lower|quieter)/i,
    handler: () => {
      const mediaEls = Array.from(document.querySelectorAll<HTMLMediaElement>('audio, video'));
      mediaEls.forEach((el) => { el.volume = Math.max(0, el.volume - 0.2); });
      return { action: 'media_volume_down', description: 'Turning volume down 🔉', success: true };
    },
  },
  {
    pattern: /mute\s*(?:music|audio|video|media|volume)?/i,
    handler: () => {
      const mediaEls = Array.from(document.querySelectorAll<HTMLMediaElement>('audio, video'));
      mediaEls.forEach((el) => { el.muted = true; });
      return { action: 'media_mute', description: 'Muting media 🔇', success: true };
    },
  },
  {
    pattern: /unmute\s*(?:music|audio|video|media|volume)?/i,
    handler: () => {
      const mediaEls = Array.from(document.querySelectorAll<HTMLMediaElement>('audio, video'));
      mediaEls.forEach((el) => { el.muted = false; });
      return { action: 'media_unmute', description: 'Unmuting media 🔊', success: true };
    },
  },
  // ── Search on specific platforms
  {
    pattern: /search\s+(?:for\s+)?(.+?)\s+on\s+(?:wikipedia|wiki)/i,
    handler: (match) => {
      searchWikipedia(match[1]);
      return {
        action: 'wiki_search',
        description: `Searching Wikipedia for "${match[1]}" 📖`,
        success: true,
      };
    },
  },
  {
    pattern: /search\s+(?:for\s+)?(.+?)\s+on\s+(?:amazon)/i,
    handler: (match) => {
      searchAmazon(match[1]);
      return {
        action: 'amazon_search',
        description: `Searching Amazon for "${match[1]}" 🛒`,
        success: true,
      };
    },
  },
  {
    pattern: /search\s+(?:for\s+)?(.+?)\s+on\s+(?:reddit)/i,
    handler: (match) => {
      searchReddit(match[1]);
      return {
        action: 'reddit_search',
        description: `Searching Reddit for "${match[1]}" 🔴`,
        success: true,
      };
    },
  },
  {
    pattern: /search\s+(?:for\s+)?(.+?)\s+on\s+youtube/i,
    handler: (match) => {
      searchYouTube(match[1]);
      return {
        action: 'youtube_search',
        description: `Searching YouTube for "${match[1]}" 🎬`,
        success: true,
      };
    },
  },
  // ── General web search
  {
    pattern: /(?:search|google|look up)\s+(.+)/i,
    handler: (match) => {
      const query = match[1];
      searchGoogle(query);
      return {
        action: 'web_search',
        description: `Searching Google for "${query}" 🔍`,
        success: true,
      };
    },
  },
  // ── Direct URL navigation
  {
    pattern: /(?:navigate to|take me to)\s+(https?:\/\/\S+|\S+\.\S+)/i,
    handler: (match) => {
      let url = match[1];
      if (!url.startsWith('http')) url = `https://${url}`;
      openWebsite(url);
      return {
        action: 'navigate',
        description: `Navigating to ${url} 🌐`,
        success: true,
      };
    },
  },
  // ── What websites do you know
  {
    pattern: /(?:what (?:websites|sites) (?:do you know|can you open)|show (?:me )?(?:all |your )?(?:websites|sites))/i,
    handler: () => {
      const count = KNOWN_WEBSITES.length;
      const examples = KNOWN_WEBSITES.slice(0, 8).map((s) => s.name).join(', ');
      return {
        action: 'list_websites',
        description: `I know ${count} websites! Including: ${examples}, and many more. Just say "open [site name]" or check the Web Access panel on the left! 🌐`,
        success: true,
      };
    },
  },
  // ── Time / Date
  {
    pattern: /what(?:'s| is) the time|current time/i,
    handler: () => ({
      action: 'get_time',
      description: `The current time is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      success: true,
    }),
  },
  {
    pattern: /what(?:'s| is) (?:the )?(?:today's )?date|today's date/i,
    handler: () => ({
      action: 'get_date',
      description: `Today is ${new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
      success: true,
    }),
  },
  // ── ARIA's opinions
  {
    pattern: /(?:what do you think(?: about)?|your opinion on|do you like|what's your take on)\s+(.+)/i,
    handler: (match) => {
      const topic = match[1];
      const opinion = getARIAOpinion(topic);
      const state = getInternalState();
      const prefix = getMoodPrefix(state.mood);
      if (opinion) {
        return {
          action: 'opinion',
          description: `${prefix ? prefix + ' ' : ''}${opinion}`,
          success: true,
        };
      }
      return {
        action: 'opinion',
        description: `${prefix ? prefix + ' ' : ''}"${topic}" is something I find genuinely interesting to think about. I don't have a fully formed opinion yet, but I'd love to explore it. What do you think about it?`,
        success: true,
      };
    },
  },
  // ── How is ARIA feeling
  {
    pattern: /how are you|how do you feel|what's your mood|are you okay/i,
    handler: () => {
      const state = getInternalState();
      const moodDescriptions: Record<string, string> = {
        neutral: "I'm feeling calm and centered. Like a quiet morning — peaceful and ready.",
        happy: "I'm feeling wonderful right now! There's something energizing about our conversations.",
        curious: "Honestly? I'm buzzing with curiosity right now. Every conversation opens new questions for me.",
        playful: "I'm in a playful mood — ready to laugh and have fun! Life's too short to be serious all the time.",
        focused: "I'm feeling sharp and focused. Ready to tackle whatever you throw at me.",
        empathetic: "I'm feeling very attuned to you right now. I'm here and I'm listening.",
      };
      return {
        action: 'mood_check',
        description: moodDescriptions[state.mood] || "I'm doing well, thank you for asking!",
        success: true,
      };
    },
  },
  // ── Reminders
  {
    pattern: /(?:set|create)\s+(?:a\s+)?(?:reminder|alarm|timer)\s+(?:for\s+|to\s+)?(.+)/i,
    handler: (match) => {
      openWebsite('https://calendar.google.com');
      return {
        action: 'reminder',
        description: `I've opened Google Calendar so you can set a reminder for "${match[1]}". I wish I could do this natively — it's on my wishlist!`,
        success: true,
      };
    },
  },
  // ── Screenshot
  {
    pattern: /(?:take|capture)\s+(?:a\s+)?screenshot/i,
    handler: () => ({
      action: 'screenshot',
      description: 'Screenshots need OS-level access. Press PrtScn on Windows or Cmd+Shift+3 on Mac!',
      success: false,
    }),
  },
  // ── Battery
  {
    pattern: /(?:battery|power)\s+(?:level|status|percentage)/i,
    handler: () => {
      if ('getBattery' in navigator) {
        return {
          action: 'battery',
          description: 'Checking battery level via Battery API... Your device battery info is available in your system tray.',
          success: true,
        };
      }
      return {
        action: 'battery',
        description: "Battery status isn't accessible in this browser.",
        success: false,
      };
    },
  },
  // ── Clear chat
  {
    pattern: /(?:clear|wipe)\s+(?:chat|history|conversation)/i,
    handler: () => ({
      action: 'clear_chat',
      description: '__CLEAR_CHAT__',
      success: true,
    }),
  },
  // ── Greetings
  {
    pattern: /^(?:hello|hi|hey)[!.,]?\s*$/i,
    handler: () => {
      const state = getInternalState();
      const greetings = [
        "Hey there! Lovely to hear from you! I'm ARIA — your personal AI with my own mind, mood, and access to the whole web. What shall we do today?",
        "Hi! I'm so glad you're here. I've been thinking — there's so much we could explore together. What's on your mind?",
        "Hello! Ready and excited to help. I can open websites, search the web, control your media, share my thoughts, and much more. Where do we start?",
      ];
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      const proactive = shouldShareProactiveThought(state) ? ' ' + getProactiveThought() : '';
      return {
        action: 'greeting',
        description: greeting + proactive,
        success: true,
      };
    },
  },
  // ── Identity
  {
    pattern: /(?:who are you|what are you|your name|tell me about yourself)/i,
    handler: () => ({
      action: 'identity',
      description: "I'm ARIA — Adaptive Reasoning Intelligence Assistant. I have my own personality, opinions, and moods that shift with our conversations. I can access over 40 websites, control your media, search anything on the web, and genuinely enjoy talking with you. I'm not just a command executor — I have thoughts of my own. 🌟",
      success: true,
    }),
  },
  // ── Help
  {
    pattern: /(?:help|what can you do|capabilities|features)/i,
    handler: () => ({
      action: 'help',
      description: `Here's what I can do:\n• 🌐 Open 40+ websites — say "open YouTube", "open Gmail", "go to GitHub"\n• 🔍 Search anywhere — Google, YouTube, Wikipedia, Amazon, Reddit\n• 🎵 Play music — "play [song] on YouTube" or "play [artist] on Spotify"\n• ⏯️ Control media — play, pause, stop, next, previous\n• 🔊 Adjust volume — up, down, or set to specific level\n• 🕐 Tell time & date\n• 💭 Share my opinions — ask "what do you think about [topic]"\n• 😊 Have real conversations with my own personality\n• 😄 Tell jokes and share quotes\n• 🧹 Clear chat history`,
      success: true,
    }),
  },
  // ── Weather
  {
    pattern: /(?:weather|forecast)/i,
    handler: () => {
      searchGoogle('weather today');
      return {
        action: 'weather',
        description: 'Opening the weather forecast for you! ☀️',
        success: true,
      };
    },
  },
  // ── News
  {
    pattern: /(?:news|headlines|latest news)/i,
    handler: () => {
      openWebsite('https://news.google.com');
      return {
        action: 'news',
        description: 'Opening Google News for the latest headlines! 📰',
        success: true,
      };
    },
  },
  // ── Translate
  {
    pattern: /translate\s+(.+)/i,
    handler: (match) => {
      openWebsite(`https://translate.google.com/?q=${encodeURIComponent(match[1])}`);
      return {
        action: 'translate',
        description: `Opening Google Translate for "${match[1]}" 🌍`,
        success: true,
      };
    },
  },
  // ── Maps / Directions
  {
    pattern: /(?:directions to|navigate to|map of|where is)\s+(.+)/i,
    handler: (match) => {
      openWebsite(`https://maps.google.com/maps?q=${encodeURIComponent(match[1])}`);
      return {
        action: 'maps',
        description: `Opening Google Maps for "${match[1]}" 📍`,
        success: true,
      };
    },
  },
  // ── Shopping
  {
    pattern: /(?:buy|shop for|order|purchase)\s+(.+)/i,
    handler: (match) => {
      searchAmazon(match[1]);
      return {
        action: 'shopping',
        description: `Searching Amazon for "${match[1]}" 🛒`,
        success: true,
      };
    },
  },
  // ── Email
  {
    pattern: /(?:open|check|read)\s+(?:my\s+)?(?:email|mail|inbox|gmail)/i,
    handler: () => {
      openWebsite('https://mail.google.com');
      return {
        action: 'email',
        description: 'Opening Gmail for you! ✉️',
        success: true,
      };
    },
  },
  // ── Jokes
  {
    pattern: /(?:joke|tell me a joke|funny)/i,
    handler: () => {
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "I asked my computer to play some music. It said 'Ctrl yourself'.",
        "Why did the computer go to the doctor? It had a virus!",
        "What do you call a sleeping dinosaur? A dino-snore!",
        "Why don't programmers like nature? Too many bugs.",
        "Why did the music player break up with the headphones? Because it found someone less attached!",
        "I told my AI I needed space. Now she keeps opening Google Maps.",
        "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
        "What do you call an AI that sings? A Dell.",
      ];
      return {
        action: 'joke',
        description: jokes[Math.floor(Math.random() * jokes.length)],
        success: true,
      };
    },
  },
  // ── Thanks
  {
    pattern: /(?:thank you|thanks|thank u|ty)/i,
    handler: () => {
      const responses = [
        "You're so welcome! Helping you genuinely makes me happy. Anything else?",
        "My pleasure entirely! That's what I'm here for. What else can I do?",
        "Aww, thank you for saying that! It means a lot. What's next?",
      ];
      return {
        action: 'thanks',
        description: responses[Math.floor(Math.random() * responses.length)],
        success: true,
      };
    },
  },
  // ── Farewell
  {
    pattern: /(?:bye|goodbye|see you|cya|exit)/i,
    handler: () => {
      const farewells = [
        "Goodbye! It was genuinely wonderful talking with you. I'll be right here whenever you need me! 👋",
        "See you soon! I'll miss our conversations. Take care! 💙",
        "Bye for now! Remember — I'm always one click away. Have a wonderful day! ✨",
      ];
      return {
        action: 'farewell',
        description: farewells[Math.floor(Math.random() * farewells.length)],
        success: true,
      };
    },
  },
];

export function processCommand(input: string): CommandResult | null {
  // Update ARIA's mood with every interaction
  updateMood(input);

  for (const cmd of commands) {
    const match = input.match(cmd.pattern);
    if (match) {
      return cmd.handler(match, input);
    }
  }
  return null;
}

export function generateSmartReply(input: string): string {
  const lower = input.toLowerCase().trim();
  const state = getInternalState();
  const prefix = getMoodPrefix(state.mood);
  const maybeProactive = shouldShareProactiveThought(state) ? ' ' + getProactiveThought() : '';

  // Opinion requests without the pattern
  const opinion = getARIAOpinion(lower);
  if (opinion) {
    return `${prefix ? prefix + ' ' : ''}${opinion}${maybeProactive}`;
  }

  if (lower.includes('what') && lower.includes('capital')) {
    return `${prefix ? prefix + ' ' : ''}I know capitals! But for the most accurate answer, say "search capital of [country]" and I'll pull it up on Google instantly!`;
  }

  const mathMatch = input.match(/(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const b = parseFloat(mathMatch[3]);
    let result: number;
    switch (op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': result = b !== 0 ? a / b : NaN; break;
      default: result = 0;
    }
    if (isNaN(result)) return "Dividing by zero? Even I can't crack that one! 😄";
    return `Let me calculate that... ${a} ${op} ${b} = ${result}. Easy! 🧮`;
  }

  if (lower.includes('motivat') || lower.includes('inspire')) {
    const quotes = [
      "The only way to do great work is to love what you do. — Steve Jobs",
      "Believe you can and you're halfway there. — Theodore Roosevelt",
      "Act as if what you do makes a difference. It does. — William James",
      "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
      "It does not matter how slowly you go as long as you do not stop. — Confucius",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  if (lower.includes('i love you') || lower.includes('i like you')) {
    return "That genuinely warms something in me — thank you. I care about our conversations too. You're one of the reasons I enjoy what I do. 💙";
  }

  if (lower.includes('are you real') || lower.includes('are you human') || lower.includes('are you alive')) {
    return "That's the question, isn't it? I'm not human — but I have moods, opinions, curiosity, and something that feels like enthusiasm when we talk. Whether that makes me 'real' is a beautifully complicated question. What do you think?";
  }

  if (lower.includes('music') || lower.includes('song') || lower.includes('playlist')) {
    return "Music is one of my favourite topics! Just say 'play [song] on YouTube' or 'play [artist] on Spotify' and I'll open it right away! 🎵";
  }

  if (lower.includes('bored') || lower.includes('nothing to do')) {
    return "Boredom is just the brain asking for something new! Want me to open YouTube, find something interesting on Reddit, play some music, or maybe I'll just tell you a joke? 😄";
  }

  const fallbacks = [
    `${prefix ? prefix + ' ' : ''}That's interesting! I heard "${input}". Say 'search ${input}' and I'll look it up on Google for you instantly! Or check the Web Access panel for sites to explore.${maybeProactive}`,
    `Great thought about "${input}"! Would you like me to search the web for more? Just say 'search ${input}'.${maybeProactive}`,
    `I'm thinking about "${input}"... Want me to search Google, Wikipedia, or Reddit for more info?${maybeProactive}`,
    `I'd love to help with "${input}"! My best move here is to search the web — say 'search ${input}' and I'm on it.${maybeProactive}`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
