/**
 * scripts/generate_audio.js
 * Offline ElevenLabs audio pre-generation script.
 *
 * Usage:  node scripts/generate_audio.js
 * Reads:  .env.local  →  VITE_ELEVENLABS_API_KEY
 * Writes: public/assets/audio/*.mp3
 *         src/utils/audioMap.js  (auto-generated, do NOT edit manually)
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');

  if (!fs.existsSync(envPath)) {
    throw new Error('Missing .env.local');
  }

  const envFile = fs.readFileSync(envPath, 'utf8');
  const match = envFile.match(/VITE_ELEVENLABS_API_KEY=(.*)/);

  if (!match) {
    throw new Error('API key not found');
  }

  return match[1].trim();
}

const API_KEY = loadEnv();
const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';
const MODEL_ID = 'eleven_multilingual_v2';

const VOICE_SETTINGS = {
  celebration:   { stability: 0.22, similarity_boost: 0.40, style: 0.55, use_speaker_boost: true },
  encouragement: { stability: 0.24, similarity_boost: 0.45, style: 0.50, use_speaker_boost: true },
  question:      { stability: 0.28, similarity_boost: 0.48, style: 0.45, use_speaker_boost: true },
  emphasis:      { stability: 0.22, similarity_boost: 0.45, style: 0.50, use_speaker_boost: true },
  thinking:      { stability: 0.30, similarity_boost: 0.55, style: 0.30, use_speaker_boost: true },
  statement:     { stability: 0.28, similarity_boost: 0.48, style: 0.40, use_speaker_boost: true },
  instruction:   { stability: 0.26, similarity_boost: 0.48, style: 0.40, use_speaker_boost: true },
};

const phrases = [
  // Home
  { text: "Learn to order numbers up to 200, and discover which numbers are bigger, smaller, or equal!", style: 'statement' },

  // Wonder
  { text: "If you had 150 crayons and your friend had 175 crayons, who has more? How do you know?", style: 'thinking' },
  { text: "Numbers are everywhere. Learning to order them helps us compare things!", style: 'statement' },

  // Story slide 0
  { text: "Alex has 134 stamps. He collects 28 more. His cousin Mei has 165 stamps. Alex wonders...", style: 'statement' },
  { text: "Who has more stamps?", style: 'question' },

  // Story slide 1
  { text: "Their teacher draws a number line from 100 to 200. She places 134 and 165 on it. The number 165 is further to the right — so Mei has more!", style: 'statement' },
  { text: "Which number is further to the right?", style: 'question' },

  // Story slide 2
  { text: "Alex, Mei, and Priya count their stamps: 98, 134, and 165. They want to line up from least to most — that's ascending order!", style: 'statement' },
  { text: "What is the correct order?", style: 'question' },

  // Story slide 3
  { text: "Using the number line, they find that 98 is less than 134, which is less than 165. Mei wins — she has the most stamps!", style: 'statement' },
  { text: "What helped them compare numbers?", style: 'question' },

  // Simulate station 1
  { text: "Click a number token to select it, then click on the number line where it belongs!", style: 'instruction' },
  { text: "Numbers further to the right are bigger. Numbers further to the left are smaller.", style: 'statement' },
  { text: "Yes! That's the right spot!", style: 'celebration' },
  { text: "Not quite — try a bit further along the line!", style: 'statement' },
  { text: "Amazing! You mapped all the numbers perfectly!", style: 'celebration' },

  // Simulate station 2
  { text: "Sort the boxes from the smallest number to the largest.", style: 'instruction' },
  { text: "Look at the hundreds digit first, then the tens, then the ones to decide which is bigger.", style: 'statement' },
  { text: "Perfect order! The factory bell rings!", style: 'celebration' },
  { text: "Not quite. Let me show you the correct order.", style: 'statement' },

  // Simulate station 3
  { text: "Choose the correct symbol between the two numbers.", style: 'instruction' },
  { text: "Is the first number greater than, less than, or equal to the second? You have ten seconds for each one!", style: 'statement' },
  { text: "Correct! Great thinking!", style: 'celebration' },

  // General simulate
  { text: "Station complete! You're amazing!", style: 'celebration' },

  // Play
  { text: "Amazing! You got it right!", style: 'celebration' },
  { text: "Fantastic! Five in a row! Keep going, you're on fire!", style: 'encouragement' },
  { text: "Wonderful! You've answered 10 questions. Keep it up!",  style: 'celebration' },
  { text: "Wonderful! You've answered 20 questions. Keep it up!",  style: 'celebration' },
  { text: "Wonderful! You've answered 30 questions. Keep it up!",  style: 'celebration' },
  { text: "Wonderful! You've answered 40 questions. Keep it up!",  style: 'celebration' },
  { text: "Wonderful! You've answered 50 questions. Keep it up!",  style: 'celebration' },
  { text: "Wonderful! You've answered 60 questions. Keep it up!",  style: 'celebration' },
  { text: "Wonderful! You've answered 70 questions. Keep it up!",  style: 'celebration' },
  { text: "Wonderful! You've answered 80 questions. Keep it up!",  style: 'celebration' },
  { text: "Wonderful! You've answered 90 questions. Keep it up!",  style: 'celebration' },
  { text: "Amazing! You finished all 100 questions!", style: 'celebration' },

  // Reflect
  { text: "You have learned to compare and order numbers up to 200 using a number line.", style: 'statement' },
  { text: "You now know how to arrange numbers in ascending and descending order, and find numbers that are one more, one less, ten more, or ten less.", style: 'statement' },
  { text: "Brilliant work today! You are a true number explorer!", style: 'celebration' },
];

// Pre-generate spoken numbers (1..200) to ensure Play-phase questions
// use the same offline voice for numeric tokens.
for (let n = 1; n <= 200; n++) {
  phrases.push({ text: String(n), style: 'statement' });
}

// Common dynamic question fragments used by `questionGenerator.js`.
// Pre-generating these ensures Play-phase questions play entirely from static files.
const fragments = [
  'Which symbol goes between ',
  ' and ',
  'Arrange these numbers from smallest to largest: ',
  'Arrange these numbers from largest to smallest: ',
  'Where does ',
  ' go on the number line?',
  'What is 1 more than ',
  'What is 1 less than ',
  'What is 10 more than ',
  'What is 10 less than ',
  'Fill in the missing number: ',
  ', ',
  '___',
];

for (const f of fragments) phrases.push({ text: f, style: 'question' });

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 60);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function fetchAudio(text, style) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      text,
      model_id:       MODEL_ID,
      voice_settings: VOICE_SETTINGS[style] || VOICE_SETTINGS.statement,
    });

    const options = {
      hostname: 'api.elevenlabs.io',
      path:     `/v1/text-to-speech/${VOICE_ID}`,
      method:   'POST',
      headers:  {
        'Content-Type':  'application/json',
        'xi-api-key':    API_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let err = '';
        res.on('data', d => { err += d; });
        res.on('end',  () => reject(new Error(`ElevenLabs ${res.statusCode}: ${err}`)));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end',  ()    => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const audioDir = path.join(ROOT, 'public', 'assets', 'audio');
  fs.mkdirSync(audioDir, { recursive: true });

  const mapEntries = [];

  for (let i = 0; i < phrases.length; i++) {
    const { text, style } = phrases[i];
    const slug     = slugify(text);
    const filename = `${slug}_${i}.mp3`;
    const filepath = path.join(audioDir, filename);
    const webPath  = `/assets/audio/${filename}`;

    if (fs.existsSync(filepath)) {
      console.log(`[SKIP] ${filename}`);
    } else {
      try {
        console.log(`[GEN]  ${filename}`);
        const buf = await fetchAudio(text, style);
        fs.writeFileSync(filepath, buf);
        await sleep(500);
      } catch (err) {
        console.error(`[ERR]  ${filename}: ${err.message}`);
        continue;
      }
    }

    const escaped = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    mapEntries.push(`  "${escaped}": "${webPath}"`);
  }

  const mapContent = `/**
 * AUTO-GENERATED by scripts/generate_audio.js
 * Do NOT edit manually. Run \`node scripts/generate_audio.js\` to regenerate.
 */
export const audioMap = {\n${mapEntries.join(',\n')}\n};\n`;

  const mapPath = path.join(ROOT, 'src', 'utils', 'audioMap.js');
  fs.writeFileSync(mapPath, mapContent, 'utf8');
  console.log(`\n✅  audioMap.js written with ${mapEntries.length} entries.`);
  console.log(`✅  MP3 files in public/assets/audio/`);
}

main().catch(err => { console.error(err); process.exit(1); });
