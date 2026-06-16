import { useEffect, useRef, useState } from 'react';
import { Settings, Mic, MicOff, Globe } from 'lucide-react';
import { useAssistant } from '@/hooks/useAssistant';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import VoiceOrb from '@/components/VoiceOrb';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import StatusBar from '@/components/StatusBar';
import TranscriptDisplay from '@/components/TranscriptDisplay';
import VoiceSettingsPanel from '@/components/VoiceSettingsPanel';
import MediaControls from '@/components/MediaControls';
import WebAccessPanel from '@/components/WebAccessPanel';
import ARIAMindPanel from '@/components/ARIAMindPanel';

export default function AssistantPage() {
  const {
    messages,
    state,
    isMuted,
    selectedVoice,
    availableVoices,
    speechRate,
    speechPitch,
    sendMessage,
    clearChat,
    toggleMute,
    setSelectedVoice,
    setSpeechRate,
    setSpeechPitch,
  } = useAssistant();

  const {
    transcript,
    interimTranscript,
    isListening,
    isWakeWordActive,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showWebPanel, setShowWebPanel] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevTranscriptRef = useRef<string>('');

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send transcript once speech recognition finalizes
  useEffect(() => {
    if (transcript && transcript !== prevTranscriptRef.current && !isListening) {
      prevTranscriptRef.current = transcript;
      sendMessage(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, sendMessage, resetTranscript]);

  const handleOrbClick = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleToggleMic = () => {
    if (isListening) stopListening();
    else startListening();
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-dark-bg overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center glow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-white glow-text">ARIA</h1>
            <p className="text-[10px] text-slate-500 -mt-0.5">Adaptive Reasoning Intelligence Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Wake word indicator */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold transition-all ${
            isListening
              ? 'bg-red-500/15 border-red-500/30 text-red-400'
              : isWakeWordActive
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-white/5 border-white/10 text-slate-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isListening ? 'bg-red-400 animate-pulse' :
              isWakeWordActive ? 'bg-emerald-400 animate-pulse' :
              'bg-slate-600'
            }`} />
            {isListening ? 'Listening' : isWakeWordActive ? 'Awake' : 'Standby'}
          </div>

          <StatusBar state={state} isListening={isListening} isSpeechSupported={isSupported} />

          {/* Web panel toggle */}
          <button
            onClick={() => setShowWebPanel((s) => !s)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${
              showWebPanel
                ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 border-white/10'
            }`}
            title="Web access panel"
          >
            <Globe size={15} />
          </button>

          <button
            onClick={handleToggleMic}
            disabled={!isSupported}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSettings((s) => !s)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 transition-all"
              title="Settings"
            >
              <Settings size={15} />
            </button>

            {showSettings && (
              <VoiceSettingsPanel
                isMuted={isMuted}
                onToggleMute={toggleMute}
                availableVoices={availableVoices}
                selectedVoice={selectedVoice}
                onSelectVoice={setSelectedVoice}
                onClearChat={clearChat}
                onClose={() => setShowSettings(false)}
                speechRate={speechRate}
                speechPitch={speechPitch}
                onSpeechRateChange={setSpeechRate}
                onSpeechPitchChange={setSpeechPitch}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-72 flex-shrink-0 flex flex-col items-center gap-3 border-r border-white/5 p-3 bg-dark-surface/50 overflow-y-auto">
          <VoiceOrb
            state={state}
            isListening={isListening}
            isWakeWordActive={isWakeWordActive}
            onClick={handleOrbClick}
          />

          <TranscriptDisplay
            transcript={transcript}
            interimTranscript={interimTranscript}
            isListening={isListening}
          />

          {/* ARIA's Mind Panel */}
          <ARIAMindPanel />

          {/* Media Controls */}
          <MediaControls onCommand={sendMessage} />

          {/* Web Access Panel */}
          <WebAccessPanel onCommand={sendMessage} />

          {/* Voice command hints */}
          <div className="w-full space-y-1">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold text-center mb-1.5">Quick commands</p>
            {[
              { emoji: '📺', text: 'Open YouTube' },
              { emoji: '🛒', text: 'Open Amazon' },
              { emoji: '🎵', text: 'Play [song] on Spotify' },
              { emoji: '🔍', text: 'Search [anything]' },
              { emoji: '📖', text: 'Search [topic] on Wikipedia' },
              { emoji: '🛍️', text: 'Search [product] on Amazon' },
              { emoji: '💭', text: 'What do you think about AI?' },
              { emoji: '😄', text: 'Tell me a joke' },
            ].map(({ emoji, text }) => (
              <button
                key={text}
                onClick={() => sendMessage(text)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/15 text-slate-400 hover:text-slate-300 text-xs transition-all text-left"
              >
                <span>{emoji}</span>
                <span>{text}</span>
              </button>
            ))}
          </div>

          {!isSupported && (
            <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
              <p className="text-amber-400 text-xs">
                Voice input not supported. Use Chrome or Edge for the full experience.
              </p>
            </div>
          )}
        </div>

        {/* Center — Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto chat-scroll p-5 space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-white/5 flex-shrink-0">
            <ChatInput
              onSend={sendMessage}
              disabled={state === 'thinking' || isListening}
            />
            <p className="text-[10px] text-slate-600 text-center mt-2">
              Say <span className="text-violet-400 font-semibold">"Hey ARIA"</span> to wake her up · Or type below · Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Right panel — Web Access (when open) */}
        {showWebPanel && (
          <div className="w-72 flex-shrink-0 border-l border-white/5 bg-dark-surface/50 overflow-y-auto p-3 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Globe size={14} className="text-violet-400" />
              <h3 className="text-xs font-semibold text-slate-300">Web Access</h3>
              <span className="ml-auto text-[9px] text-slate-600">40+ sites</span>
            </div>

            {/* Quick search bar */}
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Quick actions</p>
              {[
                { label: '🔍 Google Search', action: () => sendMessage('search ') },
                { label: '📺 YouTube', action: () => sendMessage('open YouTube') },
                { label: '🛒 Amazon', action: () => sendMessage('open Amazon') },
                { label: '🎵 Spotify', action: () => sendMessage('open Spotify') },
                { label: '📰 News', action: () => sendMessage('open news') },
                { label: '📧 Gmail', action: () => sendMessage('open Gmail') },
                { label: '🗺️ Maps', action: () => sendMessage('open Google Maps') },
                { label: '📅 Calendar', action: () => sendMessage('open Google Calendar') },
                { label: '💬 Reddit', action: () => sendMessage('open Reddit') },
                { label: '🐙 GitHub', action: () => sendMessage('open GitHub') },
                { label: '🤖 ChatGPT', action: () => sendMessage('open ChatGPT') },
                { label: '📱 Instagram', action: () => sendMessage('open Instagram') },
                { label: '🐦 Twitter / X', action: () => sendMessage('open Twitter') },
                { label: '🎬 Netflix', action: () => sendMessage('open Netflix') },
                { label: '🎮 Twitch', action: () => sendMessage('open Twitch') },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full text-left px-3 py-2 rounded-lg bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/15 text-slate-400 hover:text-slate-300 text-xs transition-all"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Voice commands</p>
              {[
                '"Hey ARIA, open YouTube"',
                '"Hey ARIA, open Amazon"',
                '"Hey ARIA, search [query]"',
                '"Hey ARIA, play [song] on Spotify"',
                '"Hey ARIA, buy [product]"',
                '"Hey ARIA, search [query] on Wikipedia"',
                '"Hey ARIA, directions to [place]"',
                '"Hey ARIA, navigate to [url]"',
              ].map((cmd) => (
                <div
                  key={cmd}
                  className="px-3 py-1.5 rounded-lg bg-white/3 border border-white/5 text-slate-500 text-[10px] font-mono"
                >
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
