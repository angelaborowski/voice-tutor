import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const apiKey = process.env.ELEVENLABS_API_KEY;
const wsUrl = process.env.ELEVENLABS_SPEECH_ENGINE_WS_URL;
const tutorVoices = [
  ["Athena", process.env.VITE_TEACHME_VOICE_ATHENA, "Strategic answer upgrades."],
  ["Apollo", process.env.VITE_TEACHME_VOICE_APOLLO, "Calm explanations."],
  ["Hermes", process.env.VITE_TEACHME_VOICE_HERMES, "Fast recall prompts."],
  ["Socrates", process.env.VITE_TEACHME_VOICE_SOCRATES, "Questions first."],
  ["Hestia", process.env.VITE_TEACHME_VOICE_HESTIA, "Gentle support."],
  ["Ares", process.env.VITE_TEACHME_VOICE_ARES, "Direct challenge drills."],
].map(([label, voiceId, description]) => ({
  label,
  voiceId,
  description,
  stability: label === "Hermes" || label === "Ares" ? 0.52 : 0.58,
  similarityBoost: 0.82,
  speed: label === "Hermes" ? 1.06 : label === "Hestia" ? 0.96 : 1,
}));

if (!apiKey) {
  throw new Error("Missing ELEVENLABS_API_KEY in .env.local");
}

if (!wsUrl) {
  throw new Error("Missing ELEVENLABS_SPEECH_ENGINE_WS_URL, for example wss://your-ngrok-url.ngrok-free.app/ws");
}

const missingVoices = tutorVoices.filter((voice) => !voice.voiceId);
if (missingVoices.length) {
  throw new Error(`Missing tutor voice IDs: ${missingVoices.map((voice) => voice.label).join(", ")}`);
}

const elevenlabs = new ElevenLabsClient({ apiKey });

const engine = await elevenlabs.speechEngine.create({
  name: "Teach Me",
  speechEngine: {
    wsUrl,
  },
  tts: {
    voiceId: process.env.VITE_TEACHME_VOICE_ATHENA,
    supportedVoices: tutorVoices,
  },
});

console.log("Speech Engine ID:", engine.engineId);
