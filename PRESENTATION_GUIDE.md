# IntelliLearn — Presentation Guide (100% Defense)

A deep, presentation-ready walkthrough of the **three core AI systems** in IntelliLearn:

1. **The Initial Placement Test** (adaptive assessment)
2. **The Learning Path Generation** (Groq AI)
3. **The AI Agent + Code Evaluation** (how a solution scores 7/10 vs 6/10)

Each section gives: the **flow**, the **files used**, the **functions used**, and a **plain-English explanation** of how the code works.

---

## 0. The Big Picture (say this first)

**IntelliLearn** is an AI-powered programming tutor. A student picks a language (Python / Java / C), takes an **adaptive placement test**, and the system uses **Groq AI (LLaMA 3.3 70B)** to:

- generate a **personalized 10-task learning path** tuned to the student's weak topics,
- act as a **live AI tutor** while they solve tasks,
- **run their code for real** (Paiza.IO) and **grade it 1–10** before letting them advance.

**Tech stack**
| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + React Router 7 |
| Backend | Node.js + Express 5 |
| Database | MongoDB + Mongoose |
| AI | Groq SDK — model `llama-3.3-70b-versatile` |
| Code execution | Paiza.IO (real compile + run, keyless) |
| Auth | JWT in httpOnly cookie + bcrypt |

**Key architectural idea:** the AI is used in **three distinct roles** — *question setter*, *tutor*, and *examiner* — each with its own carefully engineered prompt.

---

# PART 1 — The Initial Placement Test (Adaptive Assessment)

## 1.1 What it does (one line)
Measures the student's real skill level in the chosen language with **15 questions**, adapting difficulty as they answer, then classifies them as **Beginner / Intermediate / Advanced**.

## 1.2 The flow (end to end)

```
Student picks language (Python/Java/C)
   FILE: src/pages/Assessment/LanguageSelection.jsx
        │
        ▼
Test UI loads, calls the API
   FILE: src/pages/Assessment/AssessmentTest.jsx   →   src/services/assessmentService.js (startAdaptiveAssessment)
        │
        ▼
POST /api/assessment/adaptive/start
   FILE: backend/routes/assessmentRoutes.js   →   backend/controllers/assessmentController.js  ::  startAdaptiveAssessment()
        │   (creates an in-memory session, serves Q1: Variables / easy)
        │   reads questions from → backend/models/Assessment.js
        ▼
Student answers each question in the UI
   FILE: src/pages/Assessment/AssessmentTest.jsx   →   src/services/assessmentService.js (submitAdaptiveAnswer)
        │
        ▼
POST /api/assessment/adaptive/submit-answer
   FILE: backend/controllers/assessmentController.js  ::  submitAdaptiveAnswer()
        │   (grades it, adapts difficulty, serves the next question)
        │   ... repeats until 15 questions answered ...
        ▼
finalizeAdaptiveAssessment()
   FILE: backend/controllers/assessmentController.js  ::  finalizeAdaptiveAssessment()
        │   • score + % + proficiency level
        │   • saves a UserAssessment record   → backend/models/UserAssessment.js
        │   • updates the User profile        → backend/models/User.js
        │   • TRIGGERS learning-path generation (Part 2) → backend/controllers/learningPathController.js (ensurePathForLanguage)
        ▼
AssessmentResult page shows score & level
   FILE: src/pages/Assessment/AssessmentResult.jsx
```

## 1.3 Files used

| File | Role |
|------|------|
| `src/pages/Assessment/LanguageSelection.jsx` | Pick Python / Java / C |
| `src/pages/Assessment/AssessmentTest.jsx` | The test UI (one question at a time) |
| `src/pages/Assessment/AssessmentResult.jsx` | Shows score & proficiency |
| `src/services/assessmentService.js` | Frontend → API calls |
| `backend/routes/assessmentRoutes.js` | Route definitions |
| `backend/controllers/assessmentController.js` | **All the logic** |
| `backend/models/Assessment.js` | The question bank schema (MongoDB) |
| `backend/models/UserAssessment.js` | Stores each attempt & result |

## 1.4 Functions used (backend — `assessmentController.js`)

| Function | Purpose |
|----------|---------|
| `startAdaptiveAssessment(req,res)` | Creates a session, serves the first question (Variables / easy). |
| `submitAdaptiveAnswer(req,res)` | Grades the answer, decides next difficulty, serves next question. |
| `getAdaptiveQuestion(language, topic, difficulty, usedIds)` | Pulls **one random unused** question from MongoDB at the target difficulty. |
| `topicForIndex(i)` | Maps a question position (0–14) to its topic. |
| `finalizeAdaptiveAssessment(session, res)` | Computes final score, saves results, kicks off learning-path generation. |

Supporting (static/legacy path): `getLanguages`, `getQuestions`, `submitAssessment`, `getUserResult`, `getUserAllAttempts`, `checkAssessmentStatus`.

> **Note for Q&A:** the UI actually calls the **adaptive** endpoints (`startAdaptiveAssessment` / `submitAdaptiveAnswer`). The static `getQuestions` / `submitAssessment` pair is an older non-adaptive route that still exists but the app uses adaptive.

## 1.5 How the code works (the important details)

**Question structure — 5 topics × 3 questions = 15 total**
```js
const TOPIC_SEQUENCE = ['Variables', 'DataTypes', 'Loops', 'Functions', 'Arrays'];
const QUESTIONS_PER_TOPIC = 3;
const TOTAL_QUESTIONS = 15;          // 5 topics × 3
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];
```

**The adaptive rule (the heart of it)** — inside `submitAdaptiveAnswer`:
- Every **new topic** starts at **easy**.
- Within a topic, the difficulty **adapts to the last answer**:
  - answered **correctly** → next question is **harder** (easy→medium→hard)
  - answered **wrong** → next question is **easier** (hard→medium→easy)

```js
if (startingNewTopic) {
  session.currentDifficulty = 'easy';          // reset each topic
} else {
  const idx = DIFFICULTY_LEVELS.indexOf(session.currentDifficulty);
  if (isCorrect && idx < 2)      session.currentDifficulty = DIFFICULTY_LEVELS[idx + 1]; // harder
  else if (!isCorrect && idx > 0) session.currentDifficulty = DIFFICULTY_LEVELS[idx - 1]; // easier
}
```

**No repeats:** a `Set` of used question IDs (`session.questionsUsed`) is passed to `getAdaptiveQuestion`, which uses a MongoDB `$sample` aggregation with `_id: { $nin: used }` and falls back through the other difficulties if the pool is empty.

**Grading & classification** — inside `finalizeAdaptiveAssessment`:
```js
const percentage = Math.round((score / totalQuestions) * 100);
let proficiencyLevel = 'Beginner';
if (percentage > 70)      proficiencyLevel = 'Advanced';
else if (percentage > 40) proficiencyLevel = 'Intermediate';
```
| Score % | Level |
|--------|-------|
| 0–40% | Beginner |
| 41–70% | Intermediate |
| 71–100% | Advanced |

It also builds a **per-topic breakdown** (`{ correct, total }` per topic) — this is what tells the AI **which topics the student is weak in**, and it feeds directly into Part 2.

**Important design points to mention:**
- Questions come from a **pre-seeded MongoDB question bank** (`Assessment` collection) — they are **not** AI-generated, so the placement test is consistent and fair.
- Correct answers/explanations are **stripped** (`$project: { correctAnswer: 0, explanation: 0 }`) before questions go to the client — no cheating.
- Sessions are stored **in memory** (`activeSessions` Map) — a known limitation: a server restart loses in-progress tests (worth mentioning as "future work: move to Redis/DB").
- The **last line of the assessment triggers the whole learning experience** — `finalizeAdaptiveAssessment` calls `ensurePathForLanguage(...)`, which is Part 2.

---

# PART 2 — Learning Path Generation (Groq AI)

## 2.1 What it does (one line)
Uses **Groq AI** to generate a **personalized set of 10 coding tasks** at the right difficulty for the student's level and weak topics.

## 2.2 The flow

```
finalizeAdaptiveAssessment()  (from Part 1)
   FILE: backend/controllers/assessmentController.js
        │  passes: language, proficiencyLevel, topicBreakdown, score %
        ▼
ensurePathForLanguage()
   FILE: backend/controllers/learningPathController.js  ::  ensurePathForLanguage()
        │
        ▼
generatePersonalizedTasks()  →  generateRealQuestions()
   FILE: backend/utils/aiTaskGenerator.js
        │
        ├─ analyzeWeakTopics()      → find topics < 70% accuracy        [aiTaskGenerator.js]
        ├─ buildDifficultyPlan()    → decide how many easy/medium/hard   [aiTaskGenerator.js]
        ├─ splitIntoBatches()       → break into small Groq calls        [aiTaskGenerator.js]
        ├─ requestQuestionBatch()   → ***GROQ API CALL*** (per batch)    [aiTaskGenerator.js]
        ├─ cleanAndFixJSON()        → repair the AI's JSON               [aiTaskGenerator.js]
        └─ normalizeRealQuestions() → clean & shape into task objects    [aiTaskGenerator.js]
        ▼
10 tasks saved to MongoDB
   FILE: backend/models/LearningPath.js   (task[0]='unlocked', rest='locked')
        ▼
Dashboard / Pathway shows the learning path
   FILE: src/pages/Learning/PathwayVisualization.jsx   ←  src/services/learningPathService.js
```

## 2.3 Files used

| File | Role |
|------|------|
| `backend/utils/aiTaskGenerator.js` | **The Groq engine** — prompts + generation |
| `backend/controllers/learningPathController.js` | Orchestrates & saves the path |
| `backend/models/LearningPath.js` | Stores the path, tasks, quiz, course timeline |
| `src/pages/Learning/PathwayVisualization.jsx` | Renders the path as a timeline |
| `src/services/learningPathService.js` | Frontend → API |

## 2.4 Functions used (`aiTaskGenerator.js`)

| Function | Purpose |
|----------|---------|
| `generatePersonalizedTasks(...)` | Public entry point (wraps `generateRealQuestions`). |
| `generateRealQuestions(...)` | Orchestrates the whole generation. |
| `analyzeWeakTopics(topicBreakdown)` | Returns topics with **< 70% accuracy**, sorted weakest-first. |
| `buildDifficultyPlan(level, score)` | Decides the **easy/medium/hard mix** (always sums to 10). |
| `getBatchGuidance(level, tier)` | Returns strict per-batch style rules (what's allowed/forbidden). |
| `splitIntoBatches(plan)` | Splits the plan into Groq calls of ≤ 5 questions each. |
| `requestQuestionBatch(...)` | **Makes the actual Groq API call** and parses the JSON. |
| `cleanAndFixJSON(str)` | Repairs malformed JSON returned by the model. |
| `normalizeRealQuestions(...)` | Shapes raw AI output into safe task objects + starter code. |
| `generateFallbackQuestions(...)` | Hard-coded template tasks used if Groq fails. |

And in `learningPathController.js`: `ensurePathForLanguage(...)` (creates/updates the DB path).

## 2.5 How the code works (the important details)

**Step 1 — Find weak topics** (`analyzeWeakTopics`):
```js
const accuracy = (stats.correct / stats.total) * 100;
if (accuracy < 70) weakTopics.push({ topic, accuracy, weakness: 100 - accuracy });
// sorted so the WEAKEST topic is focused on most
```
The top 3 weak topics become the `focusAreas` string sent to the AI.

**Step 2 — Choose the difficulty mix** (`buildDifficultyPlan`) — this is why a beginner never gets impossible problems:
| Level | easy | medium | hard |
|-------|------|--------|------|
| Advanced | 1 | 4 | 5 |
| Intermediate | 3 | 5 | 2 |
| Beginner (score < 40%) | **10** | 0 | 0 |
| Beginner (score ≥ 40%) | 8 | 2 | 0 |

Beginners get **zero hard problems** — a deliberate pedagogical guardrail.

**Step 3 — Batch the requests** (`splitIntoBatches`): a plan like `{easy:8, medium:2}` becomes batches of ≤ 5, so each Groq call stays small and returns **reliable JSON** (large single calls tend to produce broken JSON).

**Step 4 — Call Groq** (`requestQuestionBatch`) — the engineered prompt:
```js
model: 'llama-3.3-70b-versatile',
temperature: 0.7,
max_tokens: 4000,
// system prompt: "You are an expert problem setter like LeetCode/HackerRank..."
// - return ONLY valid JSON with key "questions"
// - each problem: title, description, difficulty, topic, starterCode, testCases, hints
// - strict LEVEL GUIDELINES so Beginner problems stay trivial
```
Each batch is told about **already-used titles** (`avoidTitles`) so no two of the 10 tasks repeat a concept.

**Step 5 — Guarantee 10 distinct tasks:** titles are normalized and de-duplicated in a `Set`. If Groq under-delivers, `generateFallbackQuestions` (hard-coded, level-appropriate templates) tops it up — so the student **always** gets a full path even if the AI hiccups.

**Step 6 — Normalize & secure** (`normalizeRealQuestions`):
- caps every string length (defensive),
- **replaces the AI's `starterCode` with a clean empty stub** via `makeStarterStub()` — because the model often leaks the full solution in starter code,
- sets `status`: first task **unlocked**, the rest **locked** (linear progression).

**Why Groq / LLaMA 3.3 70B?** It's **fast and free-tier friendly**, returns good structured JSON, and is strong enough to author correct beginner→advanced problems. (Say this if asked "why not GPT-4?": cost + speed for a student project, with a fallback safety net.)

**The bigger course structure** (mention briefly if asked): each path is one **cycle of 10 tasks**; finishing all 10 unlocks an **end-of-cycle quiz** (7 MCQ + 3 coding). Passing it advances to the next cycle (up to **24 cycles / 90-day course**). Score ≥ 90 on the quiz **levels the student up** (Beginner→Intermediate→Advanced) with harder tasks — handled by `advanceCycle()`.

---

# PART 3 — The AI Agent & Code Evaluation

There are **two** AI-agent roles here — be sure to separate them in the talk:
- **3A. The Tutor** — helps the student *while* they solve (Explain / Breakdown / Review / free chat).
- **3B. The Examiner** — grades the submitted code **1–10** and decides pass/fail.

---

## 3A. The AI Tutor (in-task assistant)

### Flow
```
Student clicks a quick action OR types a question in the TaskModal
   FILE: src/components/TaskModal/TaskModal.jsx  (hosts the agent)
        │
        ▼
Chat UI + 4 buttons handle the click
   FILE: src/components/AIAgent/AIAgent.jsx  ::  handleQuickAction() / handleSendMessage()
        │
        ▼
API call from the frontend
   FILE: src/services/aiAgentService.js  ::  getAIExplanation()
        │
        ▼
POST /api/learning-path/ai-agent   (protected by JWT — backend/middleware/auth.js)
   FILE: backend/routes/learningPathRoutes.js  →  backend/controllers/learningPathController.js :: getAIAgentExplanation()
        │
        ▼
getAIAgentExplanation()  →  ***GROQ API CALL***
   FILE: backend/utils/aiTaskGenerator.js  ::  getAIAgentExplanation()
        │   picks a different prompt based on `action` (explain/breakdown/review/ask)
        ▼
Markdown reply rendered in the chat
   FILE: src/components/AIAgent/AIAgent.jsx  (ReactMarkdown)
```

### Files used
| File | Role |
|------|------|
| `src/components/AIAgent/AIAgent.jsx` | The chat UI + 4 quick-action buttons |
| `src/components/TaskModal/TaskModal.jsx` | Hosts the agent beside the code editor |
| `src/services/aiAgentService.js` | Frontend → API |
| `backend/controllers/learningPathController.js` | `getAIAgentExplanation` HTTP handler |
| `backend/utils/aiTaskGenerator.js` | `getAIAgentExplanation` — the prompts + Groq call |

### The 4 actions (each has its own carefully written prompt)
| Action | Button | What the AI is told to do |
|--------|--------|---------------------------|
| `explain` | **Explain** | Teach the *concepts* used (variables, loops…) with **generic** one-line examples — **never** the task's actual solution. |
| `breakdown` | **Breakdown** | Give 3–5 numbered **Step N:** plain-English actions; no code, no boilerplate steps; ends with "That's the whole logic — …". |
| `review` | **Review My Code** | Read the student's **live editor code**, praise what's right (by their real variable names), nudge what's wrong — **never** paste a fixed version. |
| `ask` (default) | typed question | Answer the student's exact question, small examples allowed. |
| *(local)* | **Output** | Shows saved run-history for the task — **no API call**, purely local data. |

The single backend function `getAIAgentExplanation({ ..., action, code })` switches on `action` to pick the right `userPrompt`. All share a **tutor system prompt** that enforces: Markdown formatting, encouraging tone pitched at the student's level, and **"do not write the full solution unless explicitly asked."**

```js
model: 'llama-3.3-70b-versatile',
temperature: 0.7,
max_tokens: 2500,
```

---

## 3B. The Code Examiner — how a solution scores 7/10 vs 6/10

**This is the section examiners love — know it cold.**

### The rule (one line)
A task is only marked **complete** when the code **BOTH** (1) actually **runs cleanly** AND (2) scores **≥ 7/10** from the AI reviewer.

### Flow
```
Student clicks Submit in TaskModal
   FILE: src/components/TaskModal/TaskModal.jsx  →  src/services/learningPathService.js
        │
        ▼
POST /api/learning-path/submit-solution
   FILE: backend/routes/learningPathRoutes.js  →  backend/controllers/learningPathController.js :: submitTaskSolution()
        │
        │   runs TWO things IN PARALLEL (Promise.all):
        │
        ├──► (A) generateProgramInput() → executeCode()      "did it compile & run cleanly?"
        │        FILES: backend/utils/aiTaskGenerator.js (generateProgramInput — Groq makes STDIN)
        │               backend/controllers/learningPathController.js (executeCode — Paiza.IO REAL run)
        │
        └──► (B) evaluateCodeWithAI()                        "quality score 1–10 + feedback"
                 FILE:  backend/utils/aiTaskGenerator.js :: evaluateCodeWithAI()  (***GROQ — the grader***)
        ▼
   passed = runOk (A)  AND  qualityScore >= 7 (B)
   LOGIC IN: backend/controllers/learningPathController.js  (didRunCleanly + LEARNING_PASS_SCORE)
        ▼
   if passed → task.status='completed', next unlocked, +5 pts   → saved to backend/models/LearningPath.js
   else      → reason = 'run_error' | 'could_not_run' | 'low_score' → student retries
        ▼
   Output + review shown back in the chat, reward animation on pass
   FILES: src/components/AIAgent/AIAgent.jsx  +  src/components/TaskModal/TaskModal.jsx
```

### Files used
| File | Role |
|------|------|
| `backend/controllers/learningPathController.js` | `submitTaskSolution`, `executeCode`, `didRunCleanly` |
| `backend/utils/aiTaskGenerator.js` | `evaluateCodeWithAI` (the grader), `generateProgramInput` |
| `src/components/TaskModal/TaskModal.jsx` | Submit button + reward animation |
| `src/components/AIAgent/AIAgent.jsx` | Renders program output + review in chat |

### Functions used
| Function | Purpose |
|----------|---------|
| `submitTaskSolution(req,res)` | Orchestrates the whole gated submission. |
| `executeCode(language, code, stdin)` | **Really runs the code** via Paiza.IO (compile → poll → result). |
| `didRunCleanly(runResult)` | `true` only if: no compile error, no timeout, **exit code 0**. |
| `generateProgramInput(...)` | If the code reads input (scanf/input/Scanner), Groq synthesizes the STDIN to feed it. |
| `codeReadsInput(language, code)` | Regex check — does the program read from stdin? |
| `evaluateCodeWithAI(...)` | **The AI grader** — returns `{ feedback, suggestions, qualityScore }`. |

### How the 1–10 score actually works (`evaluateCodeWithAI`)

The AI reviewer is given the **task, the test cases, the student level, and the code**, plus this **grading rubric in the system prompt**:

```
Quality Score:
  1–3  → doesn't work
  4–6  → works but has issues
  7–8  → good
  9–10 → excellent
```

```js
model: 'llama-3.3-70b-versatile',
temperature: 0.3,          // LOW temp → consistent, repeatable grading
max_tokens: 1000,
// system prompt: "You are an expert code reviewer... return ONLY JSON:
//   feedback (string), suggestions (array), qualityScore (1-10)"
```

Then the score is **clamped and lightly adjusted** in code:
```js
let qualityScore = Math.min(10, Math.max(1, Number(parsed.qualityScore) || 5));
// small bonus if it already scored well AND the feedback mentions passing:
if (qualityScore >= 7 && parsed.feedback?.toLowerCase().includes('pass')) {
  qualityScore = Math.min(10, qualityScore + 1);
}
```

**So why 7 and not 6?** The pass threshold is a **configurable constant**:
```js
const LEARNING_PASS_SCORE = Number(process.env.LEARNING_PASS_SCORE || 7);
```
- **7/10** → `scoreOk = true` → (if it also ran cleanly) **PASS** ✅
- **6/10** → `scoreOk = false` → **FAIL**, reason `low_score` → "Improve your solution and try again."

That single env var lets you tune strictness without touching code.

### The double gate (the clever part — emphasize this)
```js
const runOk   = didRunCleanly(runResult);                     // (A) it really runs
const scoreOk = Number(review.qualityScore) >= LEARNING_PASS_SCORE;  // (B) it's good
const passed  = runOk && scoreOk;                             // BOTH required
```
This means a student **cannot** pass with pretty-but-broken code (fails A) **or** with working-but-poor code (fails B). Real execution + AI judgement together.

- A **compile/runtime error** → `reason = 'run_error'` → no points, the AI shows the actual error and offers to help fix it.
- Reruns are always allowed, but **points count once** — the leaderboard counts *distinct completed tasks*, and the backend only completes a task if `status !== 'completed'`.

### Auto-input (nice detail to mention)
If the code reads from stdin (e.g. `scanf`, `input()`, `Scanner`), `generateProgramInput` asks Groq to **invent valid input** matching the task, feeds it to Paiza, and the chat tells the student *"🧩 I used this input: …"*. No confusing input box needed.

### Resilience / safety nets (good "we thought about failure" points)
- If Groq is unavailable, `evaluateCodeWithAI` returns a **neutral score of 5** (won't falsely pass anyone at threshold 7).
- Paiza calls have **timeouts** (`AbortSignal.timeout`) and polling limits.
- Every run's output is saved to `task.outputs[]` (last 20) so the student can review history via the **Output** button.

---

# PART 4 — Quick Reference Cheat-Sheet

### Endpoints (all under `/api`)
| Method + Path | Controller function | Used in |
|---------------|--------------------|---------|
| `POST /assessment/adaptive/start` | `startAdaptiveAssessment` | Part 1 |
| `POST /assessment/adaptive/submit-answer` | `submitAdaptiveAnswer` | Part 1 |
| *(internal)* `ensurePathForLanguage` | learning-path controller | Part 2 |
| `POST /learning-path/submit-solution` | `submitTaskSolution` | Part 3B |
| `POST /learning-path/run-code` | `runCode` | Part 3B |
| `POST /learning-path/ai-agent` | `getAIAgentExplanation` | Part 3A |
| `GET /learning-path/:userId/:language/quiz` | `getQuiz` | cycle quiz |
| `POST /learning-path/quiz/submit` | `submitQuiz` | cycle quiz |
| `POST /learning-path/advance-cycle` | `advanceCycle` | level-up |

### The 3 AI roles (the theme of your whole project)
| Role | Function | Model settings | Job |
|------|----------|----------------|-----|
| **Question Setter** | `requestQuestionBatch` | temp 0.7 | invents the 10 tasks |
| **Tutor** | `getAIAgentExplanation` | temp 0.7 | teaches while solving |
| **Examiner** | `evaluateCodeWithAI` | temp **0.3** | grades 1–10, consistent |

> Note the **low temperature (0.3)** for grading vs **0.7** for creative generation — a deliberate choice: creativity when authoring problems, consistency when grading them.

### Magic numbers to remember
| Constant | Value | Meaning |
|----------|-------|---------|
| `TOTAL_QUESTIONS` | 15 | placement test length (5 topics × 3) |
| weak-topic threshold | < 70% | topic counts as "weak" |
| `TASKS_PER_PATH` | 10 | tasks per cycle |
| `LEARNING_PASS_SCORE` | 7 | min score to complete a task |
| `QUIZ_PASS_SCORE` | 80/100 | pass the cycle quiz |
| `LEVEL_UP_THRESHOLD` | 90/100 | quiz score to level up |
| `TOTAL_CYCLES` | 24 | full course length |
| `COURSE_DURATION_DAYS` | 90 | deadline to finish |

---

## Likely examiner questions (and your answers)

- **"Is the placement test AI-generated?"** → No, it's a **pre-seeded MongoDB bank** for fairness/consistency; the *adaptation logic* (difficulty up/down) is ours. The **learning path** is AI-generated.
- **"How do you stop the AI leaking answers?"** → Starter code is replaced with a clean stub; correct answers are stripped before sending questions; tutor prompts explicitly forbid full solutions.
- **"What if the AI returns broken JSON?"** → `cleanAndFixJSON` repairs it; and there are **hard-coded fallbacks** for tasks, quizzes, and grading.
- **"How is grading not just a random number?"** → It's **temperature 0.3** (deterministic-ish), given the **test cases + rubric**, and it's **backed by real execution** — code that doesn't run can't pass regardless of score.
- **"Why 7/10?"** → Configurable via `LEARNING_PASS_SCORE`; 7 = the rubric's "good" band, balancing rigor with encouragement.
- **"Known limitations?"** → Adaptive sessions are in-memory (lost on restart); some learning-path routes trust the client `userId`; Paiza public API dependency. All noted as future work.
</content>
</invoke>
