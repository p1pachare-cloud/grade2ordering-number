/**
 * narration.js
 * Maps application phases → audio segment arrays.
 *
 * RULES (from audio_generation_pipeline.md):
 *  - ONLY narrate paragraph text and questions.
 *  - NEVER narrate titles, headings, labels, or button text.
 *  - Text strings here must EXACTLY match visible on-screen text.
 *  - Every string here must also appear in scripts/generate_audio.js phrases[].
 */
import { say, ask, think, celebrate, instruct, cheer } from './audio.js';

// ── Home ─────────────────────────────────────────────────────────────────────
export function introNarration() {
  return [
    say("Learn to order numbers up to 200, and discover which numbers are bigger, smaller, or equal!"),
  ];
}

// ── Wonder ───────────────────────────────────────────────────────────────────
export function wonderNarration() {
  return [
    think("If you had 150 crayons and your friend had 175 crayons, who has more? How do you know?"),
    say("Numbers are everywhere. Learning to order them helps us compare things!"),
  ];
}

// ── Story (4 slides) ─────────────────────────────────────────────────────────
const storyScripts = [
  // Slide 0 — Alex's Stamps
  [
    say("Alex has 134 stamps. He collects 28 more. His cousin Mei has 165 stamps. Alex wonders..."),
    ask("Who has more stamps?"),
  ],
  // Slide 1 — The Number Line Map
  [
    say("Their teacher draws a number line from 100 to 200. She places 134 and 165 on it. The number 165 is further to the right — so Mei has more!"),
    ask("Which number is further to the right?"),
  ],
  // Slide 2 — Ascending Order
  [
    say("Alex, Mei, and Priya count their stamps: 98, 134, and 165. They want to line up from least to most — that's ascending order!"),
    ask("What is the correct order?"),
  ],
  // Slide 3 — The Winner
  [
    say("Using the number line, they find that 98 is less than 134, which is less than 165. Mei wins — she has the most stamps!"),
    ask("What helped them compare numbers?"),
  ],
];

export function getStoryNarration(slideIndex) {
  return storyScripts[slideIndex] ?? [];
}

// ── Simulate — Station 1: Number Line Explorer ───────────────────────────────
export function simulateStation1Intro() {
  return [
    instruct("Click a number token to select it, then click on the number line where it belongs!"),
    say("Numbers further to the right are bigger. Numbers further to the left are smaller."),
  ];
}

export function simulateStation1Correct() {
  return [celebrate("Yes! That's the right spot!")];
}

export function simulateStation1Wrong() {
  return [say("Not quite — try a bit further along the line!")];
}

export function simulateStation1Complete() {
  return [celebrate("Amazing! You mapped all the numbers perfectly!")];
}

// ── Simulate — Station 2: Ordering Machine ───────────────────────────────────
export function simulateStation2Intro() {
  return [
    instruct("Sort the boxes from the smallest number to the largest."),
    say("Look at the hundreds digit first, then the tens, then the ones to decide which is bigger."),
  ];
}

export function simulateStation2Correct() {
  return [celebrate("Perfect order! The factory bell rings!")];
}

export function simulateStation2Wrong() {
  return [say("Not quite. Let me show you the correct order.")];
}

// ── Simulate — Station 3: Number Duel ────────────────────────────────────────
export function simulateStation3Intro() {
  return [
    instruct("Choose the correct symbol between the two numbers."),
    say("Is the first number greater than, less than, or equal to the second? You have ten seconds for each one!"),
  ];
}

export function simulateStation3Correct() {
  return [celebrate("Correct! Great thinking!")];
}

export function simulateStation3Wrong(answer) {
  return [say(`Not quite. The answer is ${answer}.`)];
}

// ── Simulate — general ───────────────────────────────────────────────────────
export function simulateStationComplete() {
  return [celebrate("Station complete! You're amazing!")];
}

// ── Play ─────────────────────────────────────────────────────────────────────
export function playQuestionNarration(questionText) {
  // Split question text into numeric tokens and surrounding text so
  // pre-generated number audio (1..200) can be reused for consistent voice.
  const parts = questionText.split(/(\d+)/).filter(Boolean);
  return parts.map(part => {
    if (/^\d+$/.test(part)) {
      return ({ text: part, style: 'statement' });
    }
    return ({ text: part, style: 'question' });
  });
}

export function playCorrectNarration() {
  return [celebrate("Amazing! You got it right!")];
}

export function playWrongNarration(answer) {
  return [say(`The correct answer is ${answer}.`)];
}

export function playStreakNarration() {
  return [cheer("Fantastic! Five in a row! Keep going, you're on fire!")];
}

export function playMilestoneNarration(count) {
  return [celebrate(`Wonderful! You've answered ${count} questions. Keep it up!`)];
}

// ── Reflect ──────────────────────────────────────────────────────────────────
export function reflectNarration() {
  return [
    say("You have learned to compare and order numbers up to 200 using a number line."),
    say("You now know how to arrange numbers in ascending and descending order, and find numbers that are one more, one less, ten more, or ten less."),
    celebrate("Brilliant work today! You are a true number explorer!"),
  ];
}