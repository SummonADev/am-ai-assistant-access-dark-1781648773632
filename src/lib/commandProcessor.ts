import { CommandResult } from '@/types';

type CommandHandler = {
  pattern: RegExp;
  handler: (match: RegExpMatchArray, input: string) => CommandResult;
};

// ─── Media helpers ────────────────────────────────────────────────────────────
function dispatchMediaKey(key: 'MediaPlayPause' | 'MediaTrackNext' | 'MediaTrackPrevious' | 'MediaStop'): void {
  // Best-effort: synthesise a media key event
  try {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
  } catch (_) {}
}

function tryTogglePageMedia(action: 'play' | 'pause' | 'stop'): void {
  // Try to find any <audio> or <video> elements on the page
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

// ─── YouTube helpers ──────────────────────────────────────────────────────────
function openYouTubeSearch(query: string): void {
  window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
}

function openSpotifySearch(query: string): void {
  window.open(`https://open.spotify.com/search/${encodeURIComponent(query)}`, '_blank');
}

// ─── Commands ─────────────────────────────────────────────────────────────────
const commands: CommandHandler[] = [
  // ── Media: play song/artist on YouTube
  {
    pattern: /(?:play|listen to)\s+(.+?)\s+(?:on\s+)?(?:youtube)/i,
    handler: (match) => {
      openYouTubeSearch(match[1]);
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
      openSpotifySearch(match[1]);
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
      tryTogglePageMedia('pause');
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
        // Has a search query — default to YouTube
        openYouTubeSearch(match[1]);
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
      // Increase any page media volume by 20%
      const mediaEls = Array.from(document.querySelectorAll<HTMLMediaElement>('audio, video'));
      mediaEls.forEach((el) => { el.volume = Math.min(1, el.volume + 0.2); });
      return {
        action: 'media_volume_up',
        description: 'Turning volume up 🔊',
        success: true,
      };
    },
  },
  {
    pattern: /volume\s+(?:down|lower|quieter)/i,
    handler: () => {
      const mediaEls = Array.from(document.querySelectorAll<HTMLMediaElement>('audio, video'));
      mediaEls.forEach((el) => { el.volume = Math.max(0, el.volume - 0.2); });
      return {
        action: 'media_volume_down',
        description: 'Turning volume down 🔉',
        success: true,
      };
    },
  },
  {
    pattern: /mute\s*(?:music|audio|video|media|volume)?/i,
    handler: () => {
      const mediaEls = Array.from(document.querySelectorAll<HTMLMediaElement>('audio, video'));
      mediaEls.forEach((el) => { el.muted = true; });
      return {
        action: 'media_mute',
        description: 'Muting media 🔇',
        success: true,
      };
    },
  },
  {
    pattern: /unmute\s*(?:music|audio|video|media|volume)?/i,
    handler: () => {
      const mediaEls = Array.from(document.querySelectorAll<HTMLMediaElement>('audio, video'));
      mediaEls.forEach((el) => { el.muted = false; });
      return {
        action: 'media_unmute',
        description: 'Unmuting media 🔊',
        success: true,
      };
    },
  },
  // ── Browser
  {
    pattern: /open\s+(browser|chrome|firefox|edge|safari)/i,
    handler: () => ({
      action: 'open_browser',
      description: "I can't launch desktop apps from here, but I can open a new tab for you! Just say 'go to [website]'.",
      success: false,
    }),
  },
  {
    pattern: /open\s+(.+)/i,
    handler: (match) => ({
      action: 'open_app',
      description: `I'd love to open "${match[1]}" for you! Desktop apps require OS-level access. Try saying 'go to ${match[1]}.com' to open the website instead.`,
      success: false,
    }),
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
  // ── Web search
  {
    pattern: /(?:search|google|look up)\s+(.+)/i,
    handler: (match) => {
      const query = match[1];
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      return {
        action: 'web_search',
        description: `Searching Google for "${query}" 🔍`,
        success: true,
      };
    },
  },
  // ── Navigate
  {
    pattern: /(?:go to|navigate to)\s+(https?:\/\/\S+|\S+\.\S+)/i,
    handler: (match) => {
      let url = match[1];
      if (!url.startsWith('http')) url = `https://${url}`;
      window.open(url, '_blank');
      return {
        action: 'navigate',
        description: `Navigating to ${url} 🌐`,
        success: true,
      };
    },
  },
  // ── Reminders
  {
    pattern: /(?:set|create)\s+(?:a\s+)?(?:reminder|alarm|timer)\s+(?:for\s+|to\s+)?(.+)/i,
    handler: (match) => ({
      action: 'reminder',
      description: `I'd love to set a reminder for "${match[1]}". For now I can open Google Calendar for you — say 'go to calendar.google.com'.`,
      success: false,
    }),
  },
  // ── Screenshot
  {
    pattern: /(?:take|capture)\s+(?:a\s+)?screenshot/i,
    handler: () => ({
      action: 'screenshot',
      description: 'Screenshots need OS access. Press PrtScn on Windows or Cmd+Shift+3 on Mac!',
      success: false,
    }),
  },
  // ── Battery
  {
    pattern: /(?:battery|power)\s+(?:level|status|percentage)/i,
    handler: () => {
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          const level = Math.round(battery.level * 100);
          return level;
        });
        return {
          action: 'battery',
          description: 'Checking battery level via Battery API...',
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
    pattern: /hello|hi|hey/i,
    handler: () => ({
      action: 'greeting',
      description: "Hey there! Great to hear your voice! I'm ARIA — your personal AI assistant. I can play music, control media, search the web, answer questions, and much more. What can I do for you?",
      success: true,
    }),
  },
  // ── Identity
  {
    pattern: /(?:who are you|what are you|your name)/i,
    handler: () => ({
      action: 'identity',
      description: "I'm ARIA — your AI voice assistant! I have a human-like voice, I can control media playback, search the web, answer your questions, and keep you company. I run right in your browser!",
      success: true,
    }),
  },
  // ── Help
  {
    pattern: /(?:help|what can you do|capabilities)/i,
    handler: () => ({
      action: 'help',
      description: `Here's what I can do for you:\n• 🎵 Play music — say "play [song] on YouTube" or "play [artist] on Spotify"\n• ⏯️ Control media — play, pause, stop, next, previous track\n• 🔊 Adjust volume — say "volume up", "volume down", or "set volume to 50"\n• 🔍 Search the web — say "search [anything]"\n• 🌐 Open websites — say "go to [website]"\n• 🕐 Tell the time and date\n• 💬 Chat and answer questions\n• 😄 Tell jokes and share quotes`,
      success: true,
    }),
  },
  // ── Weather
  {
    pattern: /(?:weather|forecast)/i,
    handler: () => {
      window.open('https://www.google.com/search?q=weather', '_blank');
      return {
        action: 'weather',
        description: 'Opening the weather forecast for you! ☀️',
        success: true,
      };
    },
  },
  // ── News
  {
    pattern: /(?:news|headlines)/i,
    handler: () => {
      window.open('https://news.google.com', '_blank');
      return {
        action: 'news',
        description: 'Opening Google News for the latest headlines! 📰',
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
    pattern: /(?:thank you|thanks|thank u)/i,
    handler: () => ({
      action: 'thanks',
      description: "You're so welcome! I'm always here for you. Is there anything else I can help with?",
      success: true,
    }),
  },
  // ── Farewell
  {
    pattern: /(?:bye|goodbye|see you|exit)/i,
    handler: () => ({
      action: 'farewell',
      description: 'Goodbye! It was lovely chatting with you. Come back anytime you need me! 👋',
      success: true,
    }),
  },
];

export function processCommand(input: string): CommandResult | null {
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

  if (lower.includes('how are you')) {
    return "I'm doing wonderfully, thank you for asking! All my systems are humming along perfectly. How about you — how's your day going?";
  }
  if (lower.includes('what') && lower.includes('capital')) {
    return "Geography is fascinating! I don't have a live knowledge base right now, but just say 'search capital of [country]' and I'll look it up on Google for you instantly!";
  }
  if (lower.match(/(\d+)\s*([+\-*/])\s*(\d+)/)) {
    const mathMatch = input.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
    if (mathMatch) {
      const a = parseFloat(mathMatch[1]);
      const op = mathMatch[2];
      const b = parseFloat(mathMatch[3]);
      let result: number;
      switch (op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/': result = b !== 0 ? a / b : 0; break;
        default: result = 0;
      }
      return `Let me calculate that for you... ${a} ${op} ${b} equals ${result}. Easy!`;
    }
  }
  if (lower.includes('motivat') || lower.includes('inspire')) {
    const quotes = [
      "The only way to do great work is to love what you do. — Steve Jobs",
      "Believe you can and you're halfway there. — Theodore Roosevelt",
      "Act as if what you do makes a difference. It does. — William James",
      "Success is not final, failure is not fatal: It is the courage to continue that counts. — Winston Churchill",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  if (lower.includes('music') || lower.includes('song') || lower.includes('playlist')) {
    return "I love music! Just say 'play [song or artist] on YouTube' or 'play [song] on Spotify' and I'll open it for you right away! 🎵";
  }

  const fallbacks = [
    `That's interesting! I heard "${input}". I don't have a live knowledge base for that yet, but say 'search ${input}' and I'll look it up on Google for you!`,
    `Great question about "${input}"! Would you like me to search the web for more information? Just say 'search ${input}'.`,
    `I'm thinking about "${input}"... For the most accurate answer, let me search the web! Say 'search ${input}' and I'll find it.`,
    `I'd love to help with "${input}"! My best move here is to search Google for you — just say 'search ${input}'.`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
