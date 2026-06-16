import { CommandResult } from '@/types';

type CommandHandler = {
  pattern: RegExp;
  handler: (match: RegExpMatchArray, input: string) => CommandResult;
};

const commands: CommandHandler[] = [
  {
    pattern: /open\s+(browser|chrome|firefox|edge|safari)/i,
    handler: (_match, _input) => ({
      action: 'open_browser',
      description: 'Opening browser — note: browsers run on your OS, not via a web app. Use keyboard shortcut Win+R or Spotlight instead.',
      success: false,
    }),
  },
  {
    pattern: /open\s+(.+)/i,
    handler: (match, _input) => ({
      action: 'open_app',
      description: `I heard you want to open "${match[1]}". Browser apps can't launch desktop apps directly due to OS security restrictions. You can use voice commands with a native assistant like Cortana or Siri for that.`,
      success: false,
    }),
  },
  {
    pattern: /what(?:'s| is) the time|current time/i,
    handler: (_match, _input) => ({
      action: 'get_time',
      description: `The current time is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      success: true,
    }),
  },
  {
    pattern: /what(?:'s| is) (?:the )?(?:today's )?date|today's date/i,
    handler: (_match, _input) => ({
      action: 'get_date',
      description: `Today is ${new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
      success: true,
    }),
  },
  {
    pattern: /(?:search|google|look up)\s+(.+)/i,
    handler: (match, _input) => {
      const query = match[1];
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      return {
        action: 'web_search',
        description: `Searching Google for "${query}"...`,
        success: true,
      };
    },
  },
  {
    pattern: /(?:go to|navigate to|open)\s+(https?:\/\/\S+|\S+\.\S+)/i,
    handler: (match, _input) => {
      let url = match[1];
      if (!url.startsWith('http')) url = `https://${url}`;
      window.open(url, '_blank');
      return {
        action: 'navigate',
        description: `Navigating to ${url}...`,
        success: true,
      };
    },
  },
  {
    pattern: /(?:play|pause|stop)\s*(?:music|audio|video)?/i,
    handler: (_match, input) => ({
      action: 'media_control',
      description: `Media control "${input}" — I can't control system media directly from the browser. Try using your media keys on the keyboard.`,
      success: false,
    }),
  },
  {
    pattern: /(?:set|create)\s+(?:a\s+)?(?:reminder|alarm|timer)\s+(?:for\s+|to\s+)?(.+)/i,
    handler: (match, _input) => ({
      action: 'reminder',
      description: `I'd love to set a reminder for "${match[1]}", but I can't access your system calendar from the browser. You can add it to Google Calendar at calendar.google.com.`,
      success: false,
    }),
  },
  {
    pattern: /(?:take|capture)\s+(?:a\s+)?screenshot/i,
    handler: (_match, _input) => ({
      action: 'screenshot',
      description: 'Taking screenshots requires OS-level access. Press PrtScn (Windows) or Cmd+Shift+3 (Mac) for a quick screenshot.',
      success: false,
    }),
  },
  {
    pattern: /(?:battery|power)\s+(?:level|status|percentage)/i,
    handler: (_match, _input) => {
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
        description: 'Battery status is not accessible in this browser.',
        success: false,
      };
    },
  },
  {
    pattern: /(?:copy|clipboard)/i,
    handler: (_match, _input) => ({
      action: 'clipboard',
      description: 'Clipboard access is available via the Clipboard API. What would you like me to copy?',
      success: true,
    }),
  },
  {
    pattern: /(?:clear|wipe)\s+(?:chat|history|conversation)/i,
    handler: (_match, _input) => ({
      action: 'clear_chat',
      description: '__CLEAR_CHAT__',
      success: true,
    }),
  },
  {
    pattern: /hello|hi|hey/i,
    handler: (_match, _input) => ({
      action: 'greeting',
      description: `Hello! I'm your AI voice assistant. I can answer questions, search the web, tell you the time and date, navigate to websites, and chat with you. What can I help you with?`,
      success: true,
    }),
  },
  {
    pattern: /(?:who are you|what are you|your name)/i,
    handler: (_match, _input) => ({
      action: 'identity',
      description: "I'm ARIA — your AI voice assistant. I can hear your voice, respond intelligently, and help you access information and the web. I run entirely in your browser.",
      success: true,
    }),
  },
  {
    pattern: /(?:help|what can you do|capabilities)/i,
    handler: (_match, _input) => ({
      action: 'help',
      description: `Here's what I can do:\n• Answer questions and chat\n• Tell you the current time and date\n• Search Google for anything\n• Navigate to websites\n• Respond to voice commands\n• Speak responses aloud\n\nNote: Launching desktop apps or controlling system settings requires OS-level access beyond what a browser allows.`,
      success: true,
    }),
  },
  {
    pattern: /(?:weather|forecast)/i,
    handler: (_match, _input) => {
      window.open('https://www.google.com/search?q=weather', '_blank');
      return {
        action: 'weather',
        description: 'Opening weather forecast in a new tab...',
        success: true,
      };
    },
  },
  {
    pattern: /(?:news|headlines)/i,
    handler: (_match, _input) => {
      window.open('https://news.google.com', '_blank');
      return {
        action: 'news',
        description: 'Opening Google News in a new tab...',
        success: true,
      };
    },
  },
  {
    pattern: /(?:joke|tell me a joke|funny)/i,
    handler: (_match, _input) => {
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "I asked my computer to play some music. It said 'Ctrl yourself'.",
        "Why did the computer go to the doctor? It had a virus!",
        "What do you call a sleeping dinosaur? A dino-snore!",
        "Why don't programmers like nature? Too many bugs.",
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      return {
        action: 'joke',
        description: joke,
        success: true,
      };
    },
  },
  {
    pattern: /(?:thank you|thanks|thank u)/i,
    handler: (_match, _input) => ({
      action: 'thanks',
      description: "You're welcome! Is there anything else I can help you with?",
      success: true,
    }),
  },
  {
    pattern: /(?:bye|goodbye|see you|exit)/i,
    handler: (_match, _input) => ({
      action: 'farewell',
      description: 'Goodbye! Have a wonderful day. Feel free to come back whenever you need help!',
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
    return "I'm functioning perfectly! All systems are online and I'm ready to assist you. How are you doing today?";
  }
  if (lower.includes('what') && lower.includes('capital')) {
    return "Geography questions are my specialty! While I can't connect to a live knowledge base right now, I suggest searching for that — say 'search capital of [country]' and I'll look it up for you!";
  }
  if (lower.includes('calculate') || lower.includes('math') || lower.match(/\d+\s*[+\-*/]\s*\d+/)) {
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
      return `The answer is ${result}.`;
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

  const fallbacks = [
    `I heard you say: "${input}". That's an interesting topic! For detailed information, I can search the web for you — just say 'search ${input}'.`,
    `Great question! I don't have a built-in knowledge base for "${input}", but I can search Google for you. Try saying 'search ${input}'.`,
    `I understand you're asking about "${input}". While I process your request, would you like me to search the web for more information?`,
    `I'm still learning! For "${input}", my best suggestion is to search for it. Say 'search ${input}' and I'll open Google for you.`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
