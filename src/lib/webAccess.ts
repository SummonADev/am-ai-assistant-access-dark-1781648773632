// Web access module — opens sites, searches, and navigates intelligently

export type Website = {
  name: string;
  url: string;
  keywords: string[];
  description: string;
};

// Curated website directory ARIA knows about
export const KNOWN_WEBSITES: Website[] = [
  { name: 'Google', url: 'https://google.com', keywords: ['google', 'search'], description: 'Google Search' },
  { name: 'YouTube', url: 'https://youtube.com', keywords: ['youtube', 'videos', 'yt'], description: 'YouTube — Watch videos' },
  { name: 'Spotify', url: 'https://open.spotify.com', keywords: ['spotify', 'music', 'podcast'], description: 'Spotify — Music streaming' },
  { name: 'Netflix', url: 'https://netflix.com', keywords: ['netflix', 'movies', 'shows', 'stream'], description: 'Netflix — Movies & TV Shows' },
  { name: 'Reddit', url: 'https://reddit.com', keywords: ['reddit', 'forum', 'community'], description: 'Reddit — Discussions & communities' },
  { name: 'Twitter / X', url: 'https://x.com', keywords: ['twitter', 'x', 'tweets', 'tweet'], description: 'X (Twitter) — Social media' },
  { name: 'Instagram', url: 'https://instagram.com', keywords: ['instagram', 'insta', 'photos'], description: 'Instagram — Photos & Stories' },
  { name: 'Facebook', url: 'https://facebook.com', keywords: ['facebook', 'fb'], description: 'Facebook — Social network' },
  { name: 'TikTok', url: 'https://tiktok.com', keywords: ['tiktok', 'tik tok', 'reels'], description: 'TikTok — Short videos' },
  { name: 'LinkedIn', url: 'https://linkedin.com', keywords: ['linkedin', 'professional', 'jobs', 'career'], description: 'LinkedIn — Professional network' },
  { name: 'GitHub', url: 'https://github.com', keywords: ['github', 'code', 'repository', 'repo', 'git'], description: 'GitHub — Code hosting' },
  { name: 'Wikipedia', url: 'https://wikipedia.org', keywords: ['wikipedia', 'wiki', 'encyclopedia'], description: 'Wikipedia — Free encyclopedia' },
  { name: 'Amazon', url: 'https://amazon.com', keywords: ['amazon', 'shopping', 'buy', 'shop'], description: 'Amazon — Online shopping' },
  { name: 'Gmail', url: 'https://mail.google.com', keywords: ['gmail', 'email', 'mail', 'inbox'], description: 'Gmail — Email' },
  { name: 'Google Maps', url: 'https://maps.google.com', keywords: ['maps', 'directions', 'navigation', 'location'], description: 'Google Maps' },
  { name: 'Google Drive', url: 'https://drive.google.com', keywords: ['drive', 'google drive', 'docs', 'files'], description: 'Google Drive — Cloud storage' },
  { name: 'Google Calendar', url: 'https://calendar.google.com', keywords: ['calendar', 'schedule', 'events'], description: 'Google Calendar' },
  { name: 'Google Docs', url: 'https://docs.google.com', keywords: ['docs', 'document', 'writing'], description: 'Google Docs' },
  { name: 'Google Sheets', url: 'https://sheets.google.com', keywords: ['sheets', 'spreadsheet', 'excel'], description: 'Google Sheets' },
  { name: 'ChatGPT', url: 'https://chat.openai.com', keywords: ['chatgpt', 'openai', 'gpt'], description: 'ChatGPT — AI assistant' },
  { name: 'Claude', url: 'https://claude.ai', keywords: ['claude', 'anthropic'], description: 'Claude — AI assistant' },
  { name: 'BBC News', url: 'https://bbc.com/news', keywords: ['bbc', 'bbc news'], description: 'BBC News' },
  { name: 'CNN', url: 'https://cnn.com', keywords: ['cnn', 'news', 'headlines'], description: 'CNN News' },
  { name: 'The New York Times', url: 'https://nytimes.com', keywords: ['nytimes', 'new york times', 'nyt'], description: 'New York Times' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com', keywords: ['hacker news', 'hn', 'hackernews'], description: 'Hacker News' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', keywords: ['stackoverflow', 'stack overflow', 'coding help'], description: 'Stack Overflow — Developer Q&A' },
  { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', keywords: ['mdn', 'mozilla', 'web docs', 'documentation'], description: 'MDN Web Docs' },
  { name: 'Twitch', url: 'https://twitch.tv', keywords: ['twitch', 'streaming', 'livestream', 'gaming'], description: 'Twitch — Live streaming' },
  { name: 'Discord', url: 'https://discord.com', keywords: ['discord', 'chat', 'community', 'server'], description: 'Discord — Chat & communities' },
  { name: 'Notion', url: 'https://notion.so', keywords: ['notion', 'notes', 'workspace'], description: 'Notion — Notes & workspace' },
  { name: 'Trello', url: 'https://trello.com', keywords: ['trello', 'kanban', 'tasks', 'boards'], description: 'Trello — Project management' },
  { name: 'Figma', url: 'https://figma.com', keywords: ['figma', 'design', 'ui', 'ux'], description: 'Figma — Design tool' },
  { name: 'Pinterest', url: 'https://pinterest.com', keywords: ['pinterest', 'pins', 'inspiration'], description: 'Pinterest — Visual inspiration' },
  { name: 'SoundCloud', url: 'https://soundcloud.com', keywords: ['soundcloud', 'audio', 'indie music'], description: 'SoundCloud — Audio sharing' },
  { name: 'Apple Music', url: 'https://music.apple.com', keywords: ['apple music', 'itunes'], description: 'Apple Music' },
  { name: 'Duolingo', url: 'https://duolingo.com', keywords: ['duolingo', 'language', 'learn language'], description: 'Duolingo — Language learning' },
  { name: 'Khan Academy', url: 'https://khanacademy.org', keywords: ['khan academy', 'learn', 'education', 'study'], description: 'Khan Academy — Free education' },
  { name: 'Coursera', url: 'https://coursera.org', keywords: ['coursera', 'courses', 'online learning'], description: 'Coursera — Online courses' },
  { name: 'Medium', url: 'https://medium.com', keywords: ['medium', 'articles', 'blog', 'writing'], description: 'Medium — Articles & stories' },
  { name: 'Dropbox', url: 'https://dropbox.com', keywords: ['dropbox', 'cloud', 'file storage'], description: 'Dropbox — File storage' },
  { name: 'Zoom', url: 'https://zoom.us', keywords: ['zoom', 'video call', 'meeting', 'conference'], description: 'Zoom — Video meetings' },
  { name: 'Slack', url: 'https://slack.com', keywords: ['slack', 'work chat', 'team'], description: 'Slack — Team communication' },
  { name: 'Airbnb', url: 'https://airbnb.com', keywords: ['airbnb', 'travel', 'accommodation', 'rent'], description: 'Airbnb — Travel accommodations' },
  { name: 'Booking.com', url: 'https://booking.com', keywords: ['booking', 'hotel', 'travel'], description: 'Booking.com — Hotels & travel' },
  { name: 'Translate', url: 'https://translate.google.com', keywords: ['translate', 'translation', 'language'], description: 'Google Translate' },
  { name: 'Wolfram Alpha', url: 'https://wolframalpha.com', keywords: ['wolfram', 'calculate', 'math', 'computation'], description: 'Wolfram Alpha — Computational knowledge' },
];

export function findWebsite(query: string): Website | null {
  const lower = query.toLowerCase();
  // Exact match first
  const exact = KNOWN_WEBSITES.find((site) =>
    site.keywords.some((kw) => lower.includes(kw))
  );
  return exact || null;
}

export function openWebsite(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function searchGoogle(query: string): void {
  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
}

export function searchYouTube(query: string): void {
  window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
}

export function searchSpotify(query: string): void {
  window.open(`https://open.spotify.com/search/${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
}

export function searchWikipedia(query: string): void {
  window.open(`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
}

export function searchAmazon(query: string): void {
  window.open(`https://www.amazon.com/s?k=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
}

export function searchReddit(query: string): void {
  window.open(`https://www.reddit.com/search/?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
}

export function getAllCategories(): { category: string; sites: Website[] }[] {
  return [
    {
      category: 'Search & Browse',
      sites: KNOWN_WEBSITES.filter((s) => ['Google', 'Wikipedia', 'Wolfram Alpha'].includes(s.name)),
    },
    {
      category: 'Social Media',
      sites: KNOWN_WEBSITES.filter((s) => ['Twitter / X', 'Instagram', 'Facebook', 'Reddit', 'TikTok', 'LinkedIn', 'Pinterest', 'Discord'].includes(s.name)),
    },
    {
      category: 'Entertainment',
      sites: KNOWN_WEBSITES.filter((s) => ['YouTube', 'Netflix', 'Twitch', 'Spotify', 'SoundCloud', 'Apple Music'].includes(s.name)),
    },
    {
      category: 'Productivity',
      sites: KNOWN_WEBSITES.filter((s) => ['Gmail', 'Google Calendar', 'Google Drive', 'Google Docs', 'Google Sheets', 'Notion', 'Trello', 'Slack', 'Zoom', 'Dropbox'].includes(s.name)),
    },
    {
      category: 'Development',
      sites: KNOWN_WEBSITES.filter((s) => ['GitHub', 'Stack Overflow', 'MDN Web Docs', 'Figma'].includes(s.name)),
    },
    {
      category: 'Learning',
      sites: KNOWN_WEBSITES.filter((s) => ['Khan Academy', 'Coursera', 'Duolingo', 'Medium'].includes(s.name)),
    },
    {
      category: 'News',
      sites: KNOWN_WEBSITES.filter((s) => ['BBC News', 'CNN', 'The New York Times', 'Hacker News'].includes(s.name)),
    },
    {
      category: 'Shopping & Travel',
      sites: KNOWN_WEBSITES.filter((s) => ['Amazon', 'Airbnb', 'Booking.com'].includes(s.name)),
    },
  ];
}
