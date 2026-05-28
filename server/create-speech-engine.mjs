import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const apiKey = process.env.ELEVENLABS_API_KEY;
const wsUrl = process.env.ELEVENLABS_SPEECH_ENGINE_WS_URL;

if (!apiKey) {
  throw new Error("Missing ELEVENLABS_API_KEY in .env.local");
}

if (!wsUrl) {
  throw new Error("Missing ELEVENLABS_SPEECH_ENGINE_WS_URL, for example wss://your-ngrok-url.ngrok-free.app/ws");
}

const elevenlabs = new ElevenLabsClient({ apiKey });

const engine = await elevenlabs.speechEngine.create({
  name: "Teach Me",
  speechEngine: {
    wsUrl,
  },
});

console.log("Speech Engine ID:", engine.engineId);
