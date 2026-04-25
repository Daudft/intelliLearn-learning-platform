# 🧪 IntelliLearn: End-to-End Testing Guide

## ✅ Pre-Testing Checklist

Before you start testing, ensure:

```
✓ MongoDB is running
✓ Backend server is running (port 5000)
✓ Frontend dev server is running (port 5173)
✓ Groq API key is in backend/.env
✓ Both terminals show "ready" messages
```

---

## 🚀 TESTING FLOW (Step-by-Step)

### PHASE 1: USER AUTHENTICATION ✓

#### Test 1.1: Sign Up New User
```
URL: http://localhost:5173/signup

STEPS:
1. Fill in name, email, password
2. Select Learning Style (e.g., "Hands-on")
3. Select Experience Level (e.g., "Beginner")
4. Click Sign Up
5. See email verification message

EXPECTED:
✓ User created in database
✓ Redirects to verify email OR
✓ Redirects to sign in
```

#### Test 1.2: Sign In
```
URL: http://localhost:5173/signin

STEPS:
1. Enter email & password
2. Click Sign In
3. Check if redirected to language selection

EXPECTED:
✓ User authenticated
✓ JWT token in localStorage
✓ Redirected to assessment flow
```

---

### PHASE 2: INITIAL ASSESSMENT ✓

#### Test 2.1: Language Selection
```
URL: http://localhost:5173/assessment

STEPS:
1. See available languages (Python, Java, C)
2. Select one language
3. Click proceed

EXPECTED:
✓ Redirects to assessment test page
✓ URL changes to /assessment/test/[language]
```

#### Test 2.2: Take Assessment
```
URL: http://localhost:5173/assessment/test/python (example)

STEPS:
1. See 15 questions load
2. Answer all 15 questions (any answers)
3. See timer (if implemented)
4. Click Submit

EXPECTED:
✓ All questions display
✓ Multiple choice options work
✓ Form validates (all answered)
✓ Submit button processes
✓ Shows results page with:
  - Score (X/15)
  - Percentage
  - Proficiency Level (Beginner/Intermediate/Advanced)
  - Topic breakdown
```

#### Test 2.3: Verify Assessment Saved
```
BACKEND CHECK:
1. Look in MongoDB > UserAssessment collection
2. Find user's assessment document

EXPECTED:
✓ Document contains:
  - userId
  - language
  - score
  - percentage
  - proficiencyLevel
  - topicBreakdown (weak topics)
```

---

### PHASE 3: LEARNING PATH GENERATION ✓

#### Test 3.1: Path Creation
```
AFTER ASSESSMENT SUBMISSION:

BACKEND CHECK:
1. Wait 3-5 seconds for AI generation
2. Check MongoDB > LearningPath collection

EXPECTED:
✓ New LearningPath document created with:
  - userId
  - paths[0].language (matches selected)
  - paths[0].tasks (array of 5 tasks)
  - First task has status: "unlocked"
  - Tasks 2-5 have status: "locked"
✓ Each task has:
  - taskId, title, description
  - starterCode, hints
  - status, order
```

#### Test 3.2: Verify Groq Generated Tasks
```
VISUAL CHECK:

EXPECTED:
✓ 5 distinct tasks appear (not templates)
✓ Tasks are relevant to weak topics
✓ Starter code is language-appropriate
✓ Hints are specific to each task
✓ Descriptions are personalized
```

---

### PHASE 4: DASHBOARD ✓

#### Test 4.1: Dashboard Loads With Real Data
```
URL: http://localhost:5173/dashboard

STEPS:
1. View dashboard
2. Look for "My Learning" section
3. Check statistics

EXPECTED:
✓ Shows real assessment data:
  - Proficiency level from assessment
  - Language selected
  - Score from last attempt
  - Completion percentage (0% initially)
✓ "Continue Learning" button visible
✓ Learning path card shows:
  - Language with emoji
  - Done: 0/5 tasks
  - Progress bar at 0%
```

---

### PHASE 5: LEARNING PATH VISUALIZATION ✓

#### Test 5.1: View Learning Path
```
URL: http://localhost:5173/learning-path
OR Click "Continue Learning" from dashboard

STEPS:
1. View all tasks
2. Check task statuses

EXPECTED:
✓ 5 tasks display in a visual pathway
✓ Task 1: ⭐ Active/Unlocked
✓ Tasks 2-5: 🔒 Locked
✓ Progress bar shows 0/5
✓ Click "Start Task" on Task 1
  → Should open TaskModal with CodeEditor
```

---

### PHASE 6: CODE EDITOR & SUBMISSION ✓

#### Test 6.1: CodeEditor Opens
```
ACTION: Click "Start Task" on Task 1

EXPECTED:
✓ TaskModal opens
✓ Shows task description
✓ Shows hints section
✓ CodeEditor appears with:
  - StarterCode pre-loaded
  - Monospace font
  - Line counter
  - Character counter
  - Run, Copy, Reset buttons
  - Submit Solution button
```

#### Test 6.2: Code Editing
```
STEPS:
1. Click in code area
2. Type some simple code (e.g., print("hello"))
3. Click Run button
4. See line/character counts update

EXPECTED:
✓ Can type code
✓ Code displays properly
✓ Run button shows loading
✓ Counters update correctly
✓ Run button shows simulated output
```

#### Test 6.3: Copy & Reset
```
STEPS:
1. Click Copy button → See "Copied!" message
2. Paste somewhere to verify
3. Edit code
4. Click Reset
5. Code returns to StarterCode

EXPECTED:
✓ Copy functionality works
✓ Reset restores original code
```

---

### PHASE 7: CODE SUBMISSION ✓

#### Test 7.1: Submit Solution (Will Fail Score)
```
STEPS:
1. Write simple/random code
2. Click "Submit Solution"
3. Wait for AI evaluation

EXPECTED:
✓ Button shows "Evaluating..."
✓ Groq API is called (check backend logs)
✓ After 5-10 seconds, feedback appears with:
  - Quality Score: X/10 (likely < 7)
  - Feedback message
  - Suggestions for improvement
  - NOT marked as passed yet
```

#### Test 7.2: View Feedback
```
EXPECTED FEEDBACK STRUCTURE:
✓ Shows quality score (e.g., 4/10)
✓ Shows feedback explaining issues
✓ Shows 2-3 suggestions (e.g., "add comments")
✓ Color coding (red/orange for fail)
```

#### Test 7.3: Submit Again (Improve Score)
```
STEPS:
1. Edit code to be better
2. Click "Submit Solution" again
3. Wait for evaluation

EXPECTED:
✓ Can submit multiple times
✓ Score improves (if code is better)
✓ Feedback updates
✓ Previous attempt history visible (attempts count increases)
```

---

### PHASE 8: TASK COMPLETION & UNLOCK ✓

#### Test 8.1: Pass Task (Score ≥ 7)
```
STEPS:
1. Write GOOD code (or get lucky with score ≥ 7)
2. Submit
3. Get feedback with Score ≥ 7

EXPECTED:
✓ Feedback shows green success state
✓ Message says "Solution Approved!"
✓ Button changes to show "✓ Approved"
✓ After 2-3 seconds, modal closes automatically
✓ Refreshes learning path
```

#### Test 8.2: Verify Next Task Unlocked
```
AFTER Task 1 Completed:
1. Return to learning path
2. Check Task 2 status

EXPECTED:
✓ Task 1 shows: ✓ Completed
✓ Task 2 shows: ⭐ Unlocked (now clickable!)
✓ Progress shows: 1/5 tasks completed
✓ Progress bar updated to 20%
```

---

### PHASE 9: PROGRESSION ✓

#### Test 9.1: Complete Task 2
```
STEPS:
1. Click "Start Task" on Task 2
2. CodeEditor loads with new task
3. Write and submit code (get score ≥ 7)
4. Task completes

EXPECTED:
✓ Same workflow as Task 1
✓ Task 2 marked completed
✓ Task 3 now unlocked
✓ Progress updates to 2/5 (40%)
```

#### Test 9.2: Complete Remaining Tasks
```
STEPS:
1. Repeat for Tasks 3, 4, 5
2. Each submission should unlock next

EXPECTED:
✓ Each task follows same pattern
✓ Difficulty/complexity may vary
✓ Final completion shows all 5 tasks done
✓ Progress reaches 5/5 (100%)
```

---

### PHASE 10: FINAL VERIFICATION ✓

#### Test 10.1: Dashboard Updates
```
AFTER COMPLETING ALL TASKS:
1. Go back to Dashboard
2. Check "My Learning" section

EXPECTED:
✓ Completion shows 100%
✓ Progress bar is full
✓ All tasks listed as completed
✓ Stats show 5 assignments completed
```

#### Test 10.2: Database Verification
```
MONGODB CHECK:

EXPECTED:
✓ UserAssessment document shows:
  - attemptNumber: 1
  - score, percentage
  - proficiencyLevel
  
✓ LearningPath document shows:
  - All 5 tasks with status: "completed"
  - Each with completedAt timestamp
  - Last feedback score ≥ 7 on each
```

---

## 🐛 DEBUGGING CHECKLIST

If something doesn't work, check:

| Symptom | Check | Fix |
|---------|-------|-----|
| CodeEditor not showing | Backend running? | Check port 5000 |
| AI feedback never comes | Groq API key? | Check .env file |
| Score always < 7 | Test with better code | Try obvious solution |
| Next task won't unlock | Score < 7? | Submit better code |
| Dashboard shows old data | Refresh page | Clear cache (Ctrl+Shift+Del) |
| Task can't be clicked | Check status | Should be "unlocked" |

---

## 🎯 SUCCESS CRITERIA

✅ All tests passed if:

1. **Authentication Works** - Can sign up/sign in
2. **Assessment Works** - Can take 15 questions
3. **AI Generation Works** - 5 tasks created after assessment
4. **Dashboard Works** - Shows real data (not dummy)
5. **Learning Path Works** - All 5 tasks visible with correct status
6. **Code Editor Works** - Can write and edit code
7. **Submission Works** - Code evaluated within 10 seconds
8. **Feedback Works** - Quality score displayed (1-10)
9. **Unlocking Works** - Next task unlocks when score ≥ 7
10. **Progression Works** - Can complete all 5 tasks sequentially

---

## 📊 Expected Timings

| Operation | Expected Time |
|-----------|---|
| Assessment submission | 2-3 seconds |
| Task generation | 3-5 seconds |
| Dashboard load | 1-2 seconds |
| Code editor open | Instant |
| AI evaluation | 5-10 seconds |
| Task unlock | Instant (on refresh) |

---

## 🚨 IMPORTANT NOTES

1. **First AI Evaluation May Be Slower** - Groq API initializes
2. **Simple Code Works Better** - Use obvious solutions to ensure score ≥ 7
3. **Hints Are Helpful** - Check hints if stuck
4. **Auto-Save Works** - Draft saved every change
5. **Mobile-Friendly** - Test on phone/tablet too

---

## ✅ COMPLETION CONFIRMATION

Once all tests pass, your FYP is ready for:
- [ ] Demonstration
- [ ] Grading
- [ ] Deployment
- [ ] User testing

---

**Good Luck! 🚀**

For issues: Check the implementation summary at `/memories/session/implementation-summary.md`
