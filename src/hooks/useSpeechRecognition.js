import { useMemo, useRef, useState } from "react";

export function useSpeechRecognition({ language = "en-US", onResult }) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  const SpeechRecognition = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }, []);

  function startListening() {
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setError("Voice input needs a secure browser context. Localhost is usually allowed, but some in-app browsers block it.");
      return;
    }

    if (!SpeechRecognition) {
      setError("This browser does not support Web Speech API. Try Chrome or Edge directly.");
      return;
    }

    setError("");

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setError("");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (transcript) {
        onResult(transcript);
      }
    };

    recognition.onerror = (event) => {
      const messages = {
        "not-allowed": "Microphone permission was blocked. Allow microphone access in the browser and Windows settings.",
        "no-speech": "No speech was detected. Try again closer to the microphone.",
        "audio-capture": "No microphone was found. Check your input device.",
        network: "The browser speech service could not connect. Try Chrome or Edge directly.",
        aborted: "Voice input was stopped before speech was captured.",
        "service-not-allowed": "This browser blocked the speech service. Try Chrome or Edge directly.",
        "language-not-supported": "This speech language is not supported by the browser.",
      };

      setError(messages[event.error] ?? "Voice input stopped. Try again or type instead.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setError("Voice input could not start. Try refreshing the page or type the activity instead.");
      setIsListening(false);
    }
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  return {
    isListening,
    error,
    isSupported: Boolean(SpeechRecognition),
    startListening,
    stopListening,
  };
}
