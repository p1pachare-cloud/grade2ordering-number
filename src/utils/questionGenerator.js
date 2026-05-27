/**
 * questionGenerator.js
 * Generates a fresh randomised set of 100 questions each session.
 * 7 question types aligned to Singapore P1 MOE syllabus — Numbers to 200.
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Return `count` unique integers in [min, max] */
function uniqueNums(count, min, max) {
  const set = new Set();
  let attempts = 0;
  while (set.size < count && attempts < 10000) {
    set.add(randInt(min, max));
    attempts++;
  }
  return [...set];
}

// ── Q1: Compare Two Numbers (20 questions) ───────────────────────────────────
function generateCompareTwo(count = 20) {
  return Array.from({ length: count }, () => {
    const a = randInt(1, 200);
    const b = randInt(1, 200);
    const answer = a > b ? '>' : a < b ? '<' : '=';
    return {
      id:     `cmp_${Date.now()}_${Math.random()}`,
      type:   'compare_two',
      a,
      b,
      answer,
      text:   `Which symbol goes between ${a} and ${b}?`,
    };
  });
}

// ── Q2: Order Three Numbers Ascending (15 questions) ─────────────────────────
function generateOrderThree(count = 15) {
  return Array.from({ length: count }, () => {
    const sorted  = uniqueNums(3, 1, 200).sort((a, b) => a - b);
    const options = shuffle([...sorted]);
    return {
      id:      `ord3_${Date.now()}_${Math.random()}`,
      type:    'order_three',
      nums:    sorted,
      answer:  sorted,
      options,
      text:    `Arrange these numbers from smallest to largest: ${options.join(', ')}`,
      direction: 'asc',
    };
  });
}

// ── Q3: Order Four Numbers Descending (15 questions) ─────────────────────────
function generateOrderFour(count = 15) {
  return Array.from({ length: count }, () => {
    const sorted  = uniqueNums(4, 1, 200).sort((a, b) => b - a);
    const options = shuffle([...sorted]);
    return {
      id:      `ord4_${Date.now()}_${Math.random()}`,
      type:    'order_four',
      nums:    sorted,
      answer:  sorted,
      options,
      text:    `Arrange these numbers from largest to smallest: ${options.join(', ')}`,
      direction: 'desc',
    };
  });
}

// ── Q4: Number Line Placement (15 questions) ─────────────────────────────────
function generateNumberLinePlacement(count = 15) {
  return Array.from({ length: count }, () => {
    const target    = randInt(5, 195);
    const lineStart = Math.floor(target / 10) * 10;
    const lineEnd   = lineStart + 20;
    return {
      id:        `nl_${Date.now()}_${Math.random()}`,
      type:      'number_line',
      target,
      lineStart,
      lineEnd,
      text:      `Where does ${target} go on the number line?`,
      answer:    target,
    };
  });
}

// ── Q5: 1 More / 1 Less (10 questions) ───────────────────────────────────────
function generateOneMoreLess(count = 10) {
  return Array.from({ length: count }, () => {
    const n      = randInt(2, 199);
    const isMore = Math.random() > 0.5;
    const answer = isMore ? n + 1 : n - 1;
    // Distractors: ±2, ±10, original
    const pool    = [answer, answer + 2, answer - 2, answer + 10];
    const options = shuffle(pool.map(v => Math.max(1, Math.min(200, v)))).slice(0, 4);
    return {
      id:      `om_${Date.now()}_${Math.random()}`,
      type:    'one_more_less',
      n,
      more:    isMore,
      answer,
      options: options.includes(answer) ? options : [...options.slice(0, 3), answer],
      text:    `What is 1 ${isMore ? 'more' : 'less'} than ${n}?`,
    };
  });
}

// ── Q6: 10 More / 10 Less (10 questions) ─────────────────────────────────────
function generateTenMoreLess(count = 10) {
  return Array.from({ length: count }, () => {
    const n      = randInt(11, 190);
    const isMore = Math.random() > 0.5;
    const answer = isMore ? n + 10 : n - 10;
    const pool    = [answer, answer + 1, answer - 1, answer + (isMore ? 20 : -20)];
    const options = shuffle(pool.map(v => Math.max(1, Math.min(200, v)))).slice(0, 4);
    return {
      id:      `tm_${Date.now()}_${Math.random()}`,
      type:    'ten_more_less',
      n,
      more:    isMore,
      answer,
      options: options.includes(answer) ? options : [...options.slice(0, 3), answer],
      text:    `What is 10 ${isMore ? 'more' : 'less'} than ${n}?`,
    };
  });
}

// ── Q7: Missing Number in Sequence (15 questions) ────────────────────────────
function generateMissingSequence(count = 15) {
  const stepOptions = [1, 2, 5, 10];
  return Array.from({ length: count }, () => {
    const start  = randInt(1, 170);
    const step   = stepOptions[randInt(0, 3)];
    const isAsc  = Math.random() > 0.5;
    const seq    = [0, 1, 2, 3].map(i => isAsc ? start + i * step : start - i * step);
    // Only blank index 1 or 2 (never first/last)
    const mi     = randInt(1, 2);
    const answer = seq[mi];
    const display = seq.map((v, i) => (i === mi ? '___' : v));
    const pool    = [answer, answer + step, answer - step, answer + step * 2];
    const options = shuffle(pool.map(v => Math.max(1, v))).slice(0, 4);
    return {
      id:       `ms_${Date.now()}_${Math.random()}`,
      type:     'missing_sequence',
      seq,
      display,
      missingIdx: mi,
      answer,
      options:  options.includes(answer) ? options : [...options.slice(0, 3), answer],
      text:     `Fill in the missing number: ${display.join(', ')}`,
      isAsc,
      step,
    };
  });
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * Returns a shuffled array of exactly 100 questions spanning all 7 types.
 * Called fresh at the start of every Play session.
 */
export function generateAllQuestions() {
  const all = [
    ...generateCompareTwo(20),
    ...generateOrderThree(15),
    ...generateOrderFour(15),
    ...generateNumberLinePlacement(15),
    ...generateOneMoreLess(10),
    ...generateTenMoreLess(10),
    ...generateMissingSequence(15),
  ];
  return shuffle(all); // total = 100
}

export {
  generateCompareTwo,
  generateOrderThree,
  generateOrderFour,
  generateNumberLinePlacement,
  generateOneMoreLess,
  generateTenMoreLess,
  generateMissingSequence,
  shuffle,
  randInt,
  uniqueNums,
};