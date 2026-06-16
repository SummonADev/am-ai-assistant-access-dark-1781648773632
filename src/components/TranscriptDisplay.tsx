type TranscriptDisplayProps = {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
};

export default function TranscriptDisplay({ transcript, interimTranscript, isListening }: TranscriptDisplayProps) {
  if (!isListening && !transcript && !interimTranscript) return null;

  return (
    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-center">
      {interimTranscript && (
        <p className="text-slate-400 text-sm italic">"{interimTranscript}"</p>
      )}
      {!interimTranscript && transcript && (
        <p className="text-slate-300 text-sm">"{transcript}"</p>
      )}
      {isListening && !interimTranscript && !transcript && (
        <p className="text-slate-500 text-sm">Listening for your voice...</p>
      )}
    </div>
  );
}
