"use client";
import { useRef, useState } from "react";

interface Props {
  onTranscript: (text: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function VoiceInput({ onTranscript }: Props) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await sendToBackend(blob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (e: any) {
      setError("Microphone access denied. Check browser permissions.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function sendToBackend(blob: Blob) {
    setProcessing(true);
    try {
      const form = new FormData();
      form.append("file", blob, "recording.webm");

      const res = await fetch(`${API_URL}/api/transcribe`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Transcription failed");
      }

      const data = await res.json();
      if (data.text) onTranscript(data.text);
    } catch (e: any) {
      setError(e.message || "Could not transcribe");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        disabled={processing}
        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all border ${
          recording
            ? "bg-red-500 text-white border-red-600 hover:bg-red-600"
            : "bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:text-indigo-600"
        } disabled:opacity-50`}
        title="Speak your formula"
      >
        {recording && (
          <span className="absolute -left-1 -top-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
        )}
        <span className="text-lg">{recording ? "⏹️" : "🎤"}</span>
        <span className="text-sm">
          {processing ? "Transcribing..." : recording ? "Stop" : "Voice"}
        </span>
      </button>

      {error && (
        <span className="text-xs text-red-600 max-w-xs">{error}</span>
      )}
    </div>
  );
}