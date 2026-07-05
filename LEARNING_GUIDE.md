# IntelliLearn — Learning Guide 📘

A simple, presentation-ready walkthrough of the project.
We build this up in parts. **Part 1 = the top-level folders** (this file).
Later parts will go *inside* `backend/` and `src/`.

---

## 0. The 30-second big picture

**IntelliLearn** is an **AI-powered coding learning platform**. A student takes a
placement test, gets a personalized set of coding tasks, solves them in a built-in
editor, and an AI tutor helps and grades them.

The project has **two halves** that talk to each other, plus a few outside services:

```
   BROWSER (what the user sees)              SERVER (the brain)
   ┌───────────────────────┐   HTTP/API   ┌───────────────────────┐
   │   Frontend  =  src/    │ ───────────▶ │   Backend = backend/   │
   │   (React app)          │ ◀─────────── │   (Node + Express)     │
   └───────────────────────┘   JSON data  └───────────┬───────────┘
                                                       │
                        ┌──────────────────────────────┼───────────────────────┐
                        ▼                               ▼                        ▼
                 MongoDB (database)            Groq (AI model)          Paiza.IO (runs code)
                 stores users, tasks,          explains, grades,        actually compiles &
                 progress, questions           generates questions      runs the student's code
```

- **Frontend** = the *face* (buttons, pages, colors) → lives in **`src/`**
- **Backend** = the *brain* (logic, database, AI calls) → lives in **`backend/`**
- **MongoDB / Groq / Paiza** = outside services the backend talks to (not folders here)

---

## 1. The main folders

| Folder | In one line | Simple explanation |
|---|---|---|
| **`backend/`** | The server / "brain" | A Node.js + Express program. Handles login, the database, AI (Groq), running code (Paiza), and all the rules. Sends data to the frontend as JSON. |
| **`src/`** | The frontend / "face" | The React app — every page, button, and style the user sees in the browser. This is where the UI lives. |
| **`public/`** | Static files served as-is | Images, icons, and files that are copied **directly** into the final website without any processing. |
| **`dist/`** | The built website (auto-made) | When you run `npm run build`, Vite compiles everything in `src/` into small, fast files here. This folder is what you'd actually **deploy** to the internet. You never edit it by hand. |
| **`node_modules/`** | The toolbox of libraries | All the third-party code the project depends on (React, Express, etc.). Created automatically by `npm install`. It's huge, auto-generated, never edited, and not uploaded to GitHub. |
| **`fyp_backup/`** | A safety backup | An older copy/snapshot of the project kept just in case. **Not used by the running app** — it's just for safety. |
| **`.git/`** | Version history (hidden) | Where Git stores the full history of your code changes. Managed by Git — don't touch it. |

> **Frontend vs Backend — the one line for your viva:**
> *"`src/` is what the user sees in the browser; `backend/` is the server that thinks, stores data, and talks to the AI. They communicate over an HTTP API."*

---

## 2. The important single files (in the root)

| File | In one line | Simple explanation |
|---|---|---|
| **`index.html`** | The starting page | The one HTML file the browser loads first. The whole React app gets injected into it. |
| **`package.json`** | Project ID card + recipe | Lists the project name, the **commands** (`npm run dev`, `npm run build`), and every library the frontend needs. |
| **`package-lock.json`** | Exact-versions lock | Auto-generated. Pins the *exact* versions of libraries so every computer installs the same thing. Don't edit by hand. |
| **`vite.config.js`** | Build-tool settings | Configuration for **Vite**, the tool that runs the dev server and builds the app. |
| **`eslint.config.js`** | Code-style rules | Configuration for **ESLint**, which checks the code for mistakes and style issues. |
| **`.gitignore`** | "Don't upload these" | Tells Git to skip files/folders like `node_modules/`, `dist/`, and secret `.env` files. |
| **`README.md`** | Project intro | Short description and setup instructions for the project. |

---

## 3. The `.md` documentation files (notes, not app code)

These are **Markdown notes** written during development. They are **not part of the
running app** — just documentation/history:

- **`README.md`** — main project intro & setup
- **`IMPLEMENTATION_SUMMARY.md`**, **`IMPLEMENTATION_COMPLETE.md`** — notes on what was built
- **`DEBUG_LEARNING_PATH.md`** — notes from fixing the learning-path feature
- **`TASKMODAL_FIX.md`** — notes on a task-screen fix
- **`TESTING_GUIDE.md`** — how to test the app
- **`LEARNING_GUIDE.md`** — *this* file 🙂

---

## 4. Quick mental model to remember

Think of it like a **restaurant**:

- **`src/` (frontend)** = the dining area & menu — what the customer sees and clicks.
- **`backend/`** = the kitchen — where the real work happens (cooking = logic).
- **MongoDB** = the store room — where all ingredients/data are kept.
- **Groq (AI)** = the expert chef who explains dishes and judges the food.
- **Paiza** = the oven that actually cooks (runs) the code.
- **`node_modules/`** = the pre-made tools and appliances bought from outside.
- **`dist/`** = the packaged takeaway version, ready to hand out (deploy).

---

---

# Part 2 — Inside `backend/` (the "brain") 🧠

The backend is a **Node.js + Express** server. Its job: receive requests from the
frontend, do the thinking (check login, talk to the database, call the AI, run code),
and send back answers as **JSON**.

It follows a very common, clean structure often called **MVC-style**. Each folder has
**one clear job**.

## 2.1 The folders (and the one root file that starts it all)

| Folder / file | In one line | Simple explanation |
|---|---|---|
| **`server.js`** (root file) | The **main switch / entry point** | The first file that runs. It starts the Express server, connects to the database, loads the middleware, and plugs in all the routes. Running `npm run dev` runs this. |
| **`config/`** | **Setup code** | One-time setup helpers. Here it holds `database.js`, which connects the app to **MongoDB**. |
| **`models/`** | **Data blueprints** | Defines the *shape* of each thing stored in the database (User, Task, LearningPath, Assessment…). Uses **Mongoose schemas**. Think: "what fields does a User have?" |
| **`routes/`** | **The address map** | Lists every API URL the app answers to (e.g. `POST /api/auth/login`) and says *which controller function* handles it. Like a menu of addresses. |
| **`controllers/`** | **The workers / logic** | The actual code that runs when a route is hit — it validates input, reads/writes the database, calls the AI, and sends the response. This is where the real work happens. |
| **`middleware/`** | **The checkpoint / guard** | Code that runs *in the middle* — between the request arriving and the controller running. Example: `auth.js` checks "is this user logged in?" before letting them continue. |
| **`utils/`** | **The toolbox of helpers** | Reusable helper code shared across the app: `aiTaskGenerator.js` (talks to Groq AI), `sendEmail.js` (verification emails), `seedQuestions.js` (fills the DB with questions), error/response helpers. |

## 2.2 Other root files in `backend/`

| File | Purpose |
|---|---|
| **`package.json`** | Backend's ID card + its libraries (Express, Mongoose, Groq SDK…) and scripts (`npm run dev`). |
| **`.env`** | **Secret settings** — database URL, JWT secret, Groq API key, email login, port. **Never uploaded to GitHub** (this is why your friend's copy didn't have it). |
| **`.env.example`** | A **template** of `.env` with empty values, so others know which secrets to fill in. |
| **`.gitignore`** | Tells Git to skip `node_modules/`, `.env`, etc. |
| **`seedQuestions.js`** (in utils) | Script to **fill the database** with assessment questions. (This is the one your friend needs to run.) |
| **`testAssessment.js`, `verify.js`** | Small helper/test scripts used during development — not part of the live server. |

## 2.3 ⭐ The most important idea: how one request travels

This is the mental model to explain in your viva. When the user does something
(e.g. clicks **Login**), the request flows through the folders **in order**:

```
  Browser (src/)
      │  "POST /api/auth/login"
      ▼
  server.js            ← receives the request, hands it to the routes
      ▼
  routes/              ← "which URL is this? → send it to authController.login"
      ▼
  middleware/          ← checkpoint (e.g. is a login token valid?) — for protected routes
      ▼
  controllers/         ← does the work: check password, create token…
      ▼
  models/  ⇄  MongoDB  ← reads/writes data (find the user, save progress)
      ▼
  controllers/         ← sends the answer back as JSON
      ▼
  Browser (src/)       ← frontend shows the result
```

`config/` (database connection) and `utils/` (AI, email, helpers) support this flow
from the side whenever a controller needs them.

## 2.4 Restaurant analogy (continued)

If the backend is the **kitchen**:

- **`server.js`** = the kitchen's **main door + head chef** who receives every order.
- **`routes/`** = the **order board** that says which cook handles which dish.
- **`middleware/`** = the **guard at the door** checking you're allowed in.
- **`controllers/`** = the **cooks** who actually prepare the dish.
- **`models/`** = the **recipe cards** describing exactly what each dish (data) contains.
- **`config/`** = **plugging the kitchen into the store room** (database).
- **`utils/`** = **special appliances/helpers** (the AI chef, the email machine).

> **One-liner for viva:**
> *"A request comes in → `routes` decides where it goes → `middleware` checks permission → `controllers` do the logic → `models` read/write MongoDB → a JSON answer goes back to the frontend."*

---

---

# Part 3 — Every file inside `backend/` 🗂️

Folder by folder. Read this in order: **models → middleware → routes → controllers → utils**
(data first, then the pieces that use the data).

---

## 3.1 `config/` — setup

| File | What it does |
|---|---|
| **`database.js`** | Connects the app to **MongoDB** using the `MONGO_URI` secret. If the connection fails, it automatically retries after 5 seconds. |

---

## 3.2 `models/` — the data blueprints (9 files)

Each file defines the **shape** of one kind of data (a Mongoose *schema* = a table/collection).

| File | In one line | What it stores |
|---|---|---|
| **`User.js`** | A user account | Name, email, **hashed** password, email-verify & reset tokens, role (`student`/`admin`), and their chosen language + level. Also has helper methods: hash password, compare password, make verify/reset tokens. |
| **`Assessment.js`** | The **question bank** for the placement test | Each question: language, topic, difficulty, the question, 4 options, the correct answer. ⭐ **This is the collection your friend's database was missing** (only 3 loaded). |
| **`UserAssessment.js`** | A **record of one attempt** | Which questions the user answered, their score, %, the resulting level (Beginner/Intermediate/Advanced), and a per-topic breakdown. Allows unlimited attempts. |
| **`LearningPath.js`** | The **whole learning journey** (the big one) | Per language: the 10 tasks of the current cycle (each task's code, outputs, status, hints), the cycle quiz, the cycle number, and the **course deadline** fields. This is what powers the tasks + quiz + course timer. |
| **`Task.js`** | A standalone task template | A reusable "blueprint" for a coding task. (Note: live tasks are stored *inside* `LearningPath`; this is a separate general task model.) |
| **`LearningQuestion.js`** | Saved MCQ practice questions | AI-generated multiple-choice questions saved per user, with their answer/progress. Used by the `questions` API. |
| **`UserProfile.js`** | Extra profile info | Bio, picture, preferences, daily goal, total points, streak days. |
| **`Achievement.js`** | Badges earned | Which badges a user unlocked (first task, 10 tasks, streak week…) and the points each is worth. |
| **`ActivityLog.js`** | A history diary | A log of user actions (task completed, assessment taken, login, badge earned…). Feeds the activity history + admin reports. |

> **Viva tip:** *"Models = the structure of my data. The three most important are `User`, `Assessment` (the question bank), and `LearningPath` (all the tasks, quiz, and course progress)."*

---

## 3.3 `middleware/` — the guard (1 file)

| File | What it does |
|---|---|
| **`auth.js`** | Two security guards that run **before** protected routes:  **`protect`** = "you must be logged in" (reads the JWT token from the cookie and verifies it), and **`adminOnly`** = "you must be an admin." If the check fails, the request is stopped with a 401/403. |

---

## 3.4 `routes/` — the URL maps (6 files)

Each file lists the API addresses and points each one to a controller function.

| File | Base URL | What it exposes |
|---|---|---|
| **`authRoutes.js`** | `/api/auth` | signup, verify-email, signin, forgot-password, reset-password, logout, `me` (current user). |
| **`assessmentRoutes.js`** | `/api/assessment` | get languages, get questions, submit assessment, results, status, + the **adaptive** start/submit-answer. |
| **`learningPathRoutes.js`** | `/api/learning-path` | get path, save draft, submit solution, **run code**, **AI agent**, quiz get/submit/regenerate, advance cycle. |
| **`userRoutes.js`** | `/api/users` | **leaderboard**, profile, activity history, achievements, learning stats, dashboard data. |
| **`adminRoutes.js`** | `/api/admin` | admin dashboard stats, user management, question-bank management, reports — **all admin-only**. |
| **`questionsRoutes.js`** | `/api/questions` | generate MCQ practice questions (via AI), save, submit answer, get progress. |

---

## 3.5 `controllers/` — the actual logic (5 files)

The "workers." Each function here handles one request: checks input, uses the models/AI, sends a JSON answer.

| File | In one line | What it handles |
|---|---|---|
| **`authController.js`** | Login & accounts | Signup (hash password + send verify email), verify email, signin, forgot/reset password, logout, get-current-user. Issues the **JWT login cookie**. |
| **`assessmentController.js`** | The placement test | Serves the questions, **grades** the answers → decides the level (>70% Advanced, >40% Intermediate, else Beginner), and runs the **adaptive** version (5 topics × 3 questions, difficulty goes up on a correct answer, down on a wrong one). When done, it **triggers learning-path generation**. |
| **`learningPathController.js`** | ⭐ The heart of the app | Generates the 10-task path, saves/**runs** (Paiza) & **grades** (Groq) code, the **run-must-pass gate**, the cycle quiz (get/submit/regenerate), advance-cycle, and the **course-deadline** logic. The biggest, most important file. |
| **`userController.js`** | Student-facing data | The **leaderboard**, profile get/update, activity history & summary, achievements/badges, learning stats, and dashboard data. |
| **`adminController.js`** | The admin panel | Platform stats, manage users (list / change role / delete), manage the assessment question bank (add / edit / delete), system health, and reports. |

---

## 3.6 `utils/` — reusable helpers (6 files)

| File | In one line | What it does |
|---|---|---|
| **`aiTaskGenerator.js`** | ⭐ The **AI engine** | Everything that talks to **Groq**: generate the 10 coding tasks, grade submitted code, produce the AI-tutor answers (Explain / Breakdown / Review / Ask), build the cycle quiz, and auto-generate program input. |
| **`sendEmail.js`** | The mail sender | Sends emails through Gmail — the verification email and the password-reset email. |
| **`seedQuestions.js`** | Fills the question bank | A one-time script that loads all the placement-test questions into MongoDB. ⭐ **This is the script your friend must run** so his DB has the full 15 (not 3). |
| **`resetAssessment.js`** | Dev reset tool | A command-line script to reset one user's assessment (so they can retake it) — used during testing. |
| **`errorHandling.js`** | Validation + logging | Small helpers to validate inputs (language, difficulty, required fields), send standard error responses, and log operations. |
| **`apiResponse.js`** | Standard replies | Tiny helpers to send consistent `success` / `error` JSON shapes. |

---

## 3.7 The root files of `backend/`

| File | What it does |
|---|---|
| **`server.js`** | ⭐ The **entry point**. Sets up Express, enables CORS + cookie parsing, connects to the database, **mounts all the routes** (`/api/auth`, `/api/assessment`, …), and starts listening on **port 5001**. |
| **`package.json`** / **`package-lock.json`** | Backend's libraries + scripts. |
| **`.env`** / **`.env.example`** | Secrets / secrets-template (DB URL, JWT secret, Groq key, email login). |
| **`testAssessment.js`, `verify.js`** | Small dev/test scripts — not part of the live server. |

---

## 3.8 💡 Bonus: this explains your friend's "3 questions" bug

The initial test has an **adaptive** mode: it serves **3 questions per topic** across 5 topics
(= 15). It pulls each question from the `Assessment` collection. If a database only has
questions for the **first topic** (a partial/empty seed), the code runs out of questions after
the first 3 and **ends the test early** — exactly the "TOTAL QUESTIONS: 3" screen.
➡️ Fix: run **`seedQuestions.js`** to load the full question bank.

---

---

# Part 4 — Frontend tech + the `services/` folder 🎨

## 4.1 What technology the frontend uses

The whole frontend is **JavaScript (JSX)** — *not* TypeScript. The main tools:

| Tech | What it is | Why we use it |
|---|---|---|
| **React 19** | The UI library | Builds the interface out of reusable **components**. |
| **Vite 7** | Build tool + dev server | Runs the app locally (`npm run dev`) with instant reload, and bundles it for production (`npm run build`). |
| **React Router 7** (`react-router-dom`) | Page navigation | Handles moving between pages (login, dashboard, assessment…) **without full page reloads** (single-page app). |
| **Axios** | HTTP client | Sends requests to the backend API and receives JSON. (This is what the `services/` folder uses.) |
| **Tailwind CSS v4** (`@tailwindcss/vite`) | Styling framework | Style elements with utility classes. Used mainly on the auth + landing pages. |
| **Framer Motion** | Animation library | The smooth animations (especially the landing page). |
| **AOS** (Animate On Scroll) | Scroll animations | Reveal elements as you scroll. |
| **lucide-react** | Icon set | All the icons (Send, Sparkles, Trophy…). |
| **react-markdown** | Markdown renderer | Renders the **AI tutor's replies** (bold, lists, code blocks) nicely in the chat. |
| **clsx** + **tailwind-merge** | Class-name helpers | Cleanly combine/merge CSS classes conditionally. |
| **ESLint** | Code checker (dev only) | Catches mistakes and enforces style. |

> **One-liner for viva:** *"The frontend is a **React** single-page app, built and served by **Vite**, using **React Router** for pages and **Axios** to talk to the backend."*

---

## 4.2 What is the `services/` folder? (the API layer)

The `services/` folder is the **bridge between the frontend and the backend**. It's the
**only** place that actually calls the backend API.

**Why it exists:** instead of scattering `axios` calls all over the screens, every backend
call is collected here in one place. A component just calls something like
`authService.signin(...)` and doesn't care about the URL or how the request is made.

```
   A Page/Component (src/pages, src/components)
          │  calls e.g. authService.signin(email, password)
          ▼
   services/  ──axios──▶  Backend API  ──▶  (routes → controllers → DB)
          ▲                                        │
          └──────────── JSON answer ◀──────────────┘
```

> **Rule of thumb:** **one method in a service = one backend endpoint.**

---

## 4.3 The files inside `services/`

| File | In one line | What's inside |
|---|---|---|
| **`api.js`** | ⭐ The **foundation** | Creates the configured **Axios** instance: base URL `http://localhost:5001/api`, `withCredentials: true` (so the **login cookie** is sent on every request), and JSON headers. **Every other service imports this.** |
| **`authService.js`** | Accounts / login | signup, signin, verify email, forgot/reset password, logout, get-current-user. Also **saves the logged-in user to `localStorage`**. |
| **`assessmentService.js`** | The placement test | get languages, get questions, submit assessment, get result/status/attempts, and the **adaptive** start / submit-answer. |
| **`learningPathService.js`** | ⭐ The learning journey (busiest) | get path, save draft, **submit solution**, **run code**, AI feedback, quiz get/submit/**regenerate**, advance cycle. |
| **`aiAgentService.js`** | The AI tutor chat | `getAIExplanation(...)` — powers the **Explain / Breakdown / Review My Code / Ask** actions. |
| **`userService.js`** | Student data | profile get/update, activity history & summary, achievements/badges, learning stats, and the **leaderboard**. |
| **`adminService.js`** | Admin panel | dashboard stats, user management (list/role/delete), question-bank management, system health, reports. |
| **`questionService.js`** | MCQ practice | generate/save MCQ questions, submit answer, get progress. (Used by the separate MCQ-practice feature, e.g. `QuestionSolver`.) |

> **Notice the pattern:** every service file `import api from './api'` at the top, then each
> method is just a small wrapper like `api.post('/auth/signin', data)`. That's the whole idea —
> **`api.js` is the phone line, each service is a contacts list for one feature.**

---

### ✅ Next parts (we'll add these later)
- **Part 5 — Inside `src/` (the rest)**: `pages/`, `components/`, and how they use the services.
- **Part 6 — The full user journey**: signup → assessment → tasks → quiz → leaderboard, tying frontend + backend together.

*(Tell me when you're ready and we'll open the pages & components.)*
