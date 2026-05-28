# Teach Me

Teach Me is a voice-first tutor app built for the ElevenLabs Speech Engine hackathon.

Learners speak or type through any subject at any level, the tutor coaches them in real time, and Teach Me turns the lesson into useful study resources behind the scenes: notes, flashcards, quiz prompts, recommended activities, and next steps.

The prototype is designed to demo gracefully: it runs as a text tutor without any API keys, then upgrades to live voice when the ElevenLabs and OpenAI credentials are configured.

## Why It Exists

Private tutoring works because a good tutor listens, spots the gap, asks the next question, and gives the learner something useful to practise afterwards. The problem is that tutoring is expensive, hard to schedule, and lesson time often gets spent creating homework, notes, or follow-up tasks instead of teaching.

Teach Me makes that loop more accessible. A learner can start a spoken lesson whenever they are stuck, practise explaining the idea out loud, get corrected in the moment, and finish with the resources they need to keep practising after the session.

The key idea is simple: the lesson stays conversational, while the admin work happens in the background.

The hackathon demo is intentionally generic:

- Pick any subject, level, or topic
- Choose a mode: explain, quiz, improve an answer, or build a learning pack
- Speak a messy answer out loud
- Get a cleaner explanation, one focused next question, and a saved learning pack

## Tech

- React + Vite for the frontend
- Express for the local API and Speech Engine bridge
- ElevenLabs UI-inspired Orb, Conversation, and Message components
- ElevenLabs Speech Engine for speech-to-text, text-to-speech, turn-taking, and interruption handling
- OpenAI Responses API for the tutor brain and learning-pack generation
- LocalStorage for saved learning sessions in the prototype

## Project Shape

```txt
src/pages/landing        Landing pages, menu, tutor deck, and demo copy
src/features/tutor       Tutor workspace, state hook, API client, and domain logic
src/components/ui        Reusable visual and interaction components
server                   Local API routes, Speech Engine bridge, prompts, and fallbacks
```

## Local Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```bash
OPENAI_API_KEY=...
ELEVENLABS_API_KEY=...
ELEVENLABS_SPEECH_ENGINE_ID=...
SPEECH_ENGINE_DEBUG=false
```

Optional profile voices:

```bash
VITE_TEACHME_VOICE_ATHENA=uIZsnBL0YK1S5j69bAih
VITE_TEACHME_VOICE_APOLLO=
VITE_TEACHME_VOICE_HERMES=
VITE_TEACHME_VOICE_SOCRATES=
VITE_TEACHME_VOICE_HESTIA=
VITE_TEACHME_VOICE_ARES=
```

Voice IDs are safe to expose in the browser. API keys are not.

Start the server:

```bash
npm run server
```

Start the web app:

```bash
npm run dev
```

Open:

```txt
http://127.0.0.1:5174
```

The app works as a text tutor without API keys. Live voice requires the server, ElevenLabs API key, OpenAI API key, and Speech Engine ID. Set `SPEECH_ENGINE_DEBUG=true` only when debugging live voice sessions.

## Waitlist Capture

The landing page includes a simple email signup form. Submissions go through:

```txt
POST /api/waitlist
```

By default, emails are appended to:

```txt
data/waitlist.csv
```

The `data` directory is ignored by git so real signups stay local. Override the file location with `WAITLIST_PATH` in `.env.local` if you want the CSV somewhere else.

For a quick deployed setup on Vercel, send signups to Google Sheets:

1. Create a Google Sheet with columns: `createdAt`, `name`, `email`, `source`, `userAgent`.
2. Open **Extensions -> Apps Script** and paste this:

```js
function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(event) {
  try {
    const body = JSON.parse(event.postData.contents || "{}");
    const secret = PropertiesService.getScriptProperties().getProperty("WAITLIST_SECRET");

    if (!secret || body.secret !== secret) {
      return json({ ok: false, error: "Unauthorized" });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["createdAt", "name", "email", "source", "userAgent"]);
    }

    const email = String(body.email || "").trim().toLowerCase();
    const existingEmails = sheet.getLastRow() > 1
      ? sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).getValues().flat()
      : [];
    const alreadyJoined = existingEmails.map(String).map((value) => value.toLowerCase()).includes(email);

    if (!alreadyJoined) {
      sheet.appendRow([
        body.createdAt || new Date().toISOString(),
        body.name || "",
        email,
        body.source || "",
        body.userAgent || "",
      ]);
    }

    return json({ ok: true, alreadyJoined });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  }
}
```

3. In Apps Script, add a script property named `WAITLIST_SECRET` with a random value.
4. Deploy as a **Web app**, with access set to **Anyone**.
5. In Vercel, set:

```txt
WAITLIST_WEBHOOK_URL=https://script.google.com/macros/s/your-deployment-id/exec
WAITLIST_SECRET=the-same-random-value
```

If `WAITLIST_WEBHOOK_URL` is set, `/api/waitlist` posts to Google Sheets. If it is not set, it uses the local CSV fallback.

## Creating The Speech Engine

Speech Engine needs a public WebSocket URL for the server.

```bash
ngrok http 3001
```

Put the forwarding URL into `.env.local` as:

```bash
ELEVENLABS_SPEECH_ENGINE_WS_URL=wss://your-ngrok-url.ngrok-free.app/ws
```

Then run:

```bash
npm run create:speech-engine
```

Copy the printed ID into:

```bash
ELEVENLABS_SPEECH_ENGINE_ID=...
```

Restart the server.

## Demo Script

Hook:

> I built Teach Me, a voice tutor that teaches in the moment and generates the follow-up resources behind the scenes.

Flow:

1. Open the animated landing page.
2. Click `Get started`.
3. Ask: “I don’t get photosynthesis at A-level,” “quiz me on beginner Python,” or “help me improve my History answer.”
4. The tutor identifies the subject and level, asks one focused question, and upgrades the answer with level-appropriate language.
5. The transcript is saved as a learning session in the sidebar.
6. Open the generated notes, flashcards, quick-fire quiz, activities, and next steps.

## Validation

```bash
npm test
npm run typecheck
npm run build
```

The test suite is intentionally small for the hackathon: it smoke-tests server tutor prompts, fallback replies, chat-history normalization, and study-pack generation.

## Submission Notes

Use a live URL and a short video. The video should spend most of its time showing the learner talking, the tutor responding, and the learning pack appearing from the transcript without interrupting the lesson.
