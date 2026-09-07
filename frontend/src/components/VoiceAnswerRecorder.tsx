import { useEffect, useRef, useState } from "react";

export default function VoiceAnswerRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) {
      setMessage("Audio recording is not supported by this browser.");
      return;
    }

    setMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const audio = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(audio));
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
        setIsRecording(false);
        setMessage("Recording ready for local playback. It has not been uploaded.");
      };
      recorder.start();
      setIsRecording(true);
      setMessage("Recording locally...");
    } catch {
      setMessage("Microphone access was not available. Check the browser site permission.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  function deleteRecording() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
    setMessage("Local recording deleted.");
  }

  return (
    <div className="voice-answer-recorder no-print">
      <div>
        <strong>Private voice practice</strong>
        <p className="muted">
          Audio stays in this browser tab and is not uploaded or transcribed.
        </p>
      </div>
      <div className="form-actions">
        <button className="button compact" type="button"
          onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? "Stop recording" : "Record answer"}
        </button>
        {audioUrl && (
          <button className="text-button" type="button" onClick={deleteRecording}>
            Delete recording
          </button>
        )}
      </div>
      {audioUrl && <audio controls src={audioUrl} />}
      {message && <p className="muted" role="status">{message}</p>}
    </div>
  );
}
