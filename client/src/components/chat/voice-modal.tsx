import React from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

interface VoiceModalProps {
  open: boolean;
  onClose: () => void;
  onTranscript: (transcript: string) => void;
  setListening?: (listening: boolean) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({ open, onClose, onTranscript, setListening }) => {
  const [corrected, setCorrected] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  React.useEffect(() => {
    if (setListening) setListening(listening);
  }, [listening, setListening]);

  React.useEffect(() => {
    if (open) {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
    } else {
      SpeechRecognition.stopListening();
    }
    // Stop listening on unmount
    return () => {
      SpeechRecognition.stopListening();
      if (setListening) setListening(false);
    };
    // eslint-disable-next-line
  }, [open]);

  const handleAutocorrect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/autocorrect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript })
      });
      if (!res.ok) throw new Error("Failed to autocorrect");
      const data = await res.json();
      setCorrected(data.corrected);
    } catch (err: any) {
      setError(err.message || "Autocorrect failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUseTranscript = () => {
    onTranscript(corrected ?? transcript);
    onClose();
  };


  if (!browserSupportsSpeechRecognition) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <div className="p-6">Your browser does not support speech recognition.</div>
      </Dialog>
    );
  }

  if (!isMicrophoneAvailable) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <div className="p-6">Microphone is not available.</div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity animate-fade-in" />
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className="bg-white p-6 flex flex-col items-center rounded-lg shadow-xl transform transition-all duration-300 ease-out scale-100 opacity-100 animate-fade-in"
          style={{ minWidth: 320, minHeight: 220 }}
        >
          <div className="flex flex-col items-center mb-4">
            <Mic className={`w-12 h-12 mb-2 ${listening ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
            <div className="text-lg font-semibold">
              {listening ? "Listening..." : "Click below to start speaking"}
            </div>
          </div>
          <div className="bg-gray-100 rounded p-4 mb-4 w-full min-h-[60px] text-gray-800">
            {loading ? (
              <span className="text-blue-500">Autocorrecting...</span>
            ) : corrected ? (
              <span className="font-medium">{corrected}</span>
            ) : (
              transcript || <span className="text-gray-400">Say something...</span>
            )}
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={resetTranscript}
              disabled={!transcript || loading}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAutocorrect}
              disabled={!transcript || loading}
            >
              Autocorrect
            </Button>
            <Button
              type="button"
              onClick={handleUseTranscript}
              disabled={loading || (!transcript && !corrected)}
            >
              Use This
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>

    </Dialog>
  );
};
