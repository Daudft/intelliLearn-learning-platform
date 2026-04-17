# IntelliLearn - Architecture & Data Flow

## 🏗️ PROJECT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                       INTELLILEARN PLATFORM                      │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────┐        ┌────────────────────────────┐
│      FRONTEND (React)       │        │      BACKEND (Node.js)     │
├────────────────────────────┤        ├────────────────────────────┤
│ Pages (8):                 │        │ Controllers (4):           │
│  - SignUp/SignIn           │        │  - authController          │
│  - LandingPage             │        │  - assessmentController    │
│  - LearningStylePage       │        │  - learningPathController  │
│  - ExperienceLevelPage     │        │  - userController ✨NEW    │
│  - Dashboard               │        │  - adminController ✨NEW   │
│  - ProfilePage             │        │                            │
│  - ProgressDashboard       │        │ Routes:                    │
│  - PathwayVisualization    │        │  - /auth                   │
│  - TaskPage                │        │  - /assessment             │
│  - AdminConsole            │        │  - /learning-path          │
│  - ActivityHistoryPage     │        │  - /users ✨NEW            │
│                            │        │  - /admin ✨NEW            │
│ Components (1):            │        │                            │
│  - CodeEditor              │        │ Models (8):                │
│                            │        │  - User (modified)         │
│ Services (4):              │        │  - Assessment              │
│  - authService             │        │  - UserAssessment          │
│  - assessmentService       │        │  - LearningPath            │
│  - learningPathService     │        │  - UserProfile ✨NEW       │
│  - userService ✨NEW       │        │  - ActivityLog ✨NEW       │
│  - adminService ✨NEW      │        │  - Achievement ✨NEW       │
│                            │        │  - Task ✨NEW              │
└────────────────────────────┘        └────────────────────────────┘
           │ HTTP/REST                           │
           └──────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│               DATABASE (MongoDB/Mongoose)                       │
├────────────────────────────────────────────────────────────────┤
│ Collections:                                                    │
│  - users              (with role, learningStyle, experienceLevel)
│  - assessments        (diagnostic tests)                       │
│  - userassessments    (test results & scoring)                │
│  - learningpaths      (personalized paths)                    │
│  - userprofiles ✨NEW (preferences, streaks, goals)           │
│  - activitylogs ✨NEW (user activities & audit trail)         │
│  - achievements ✨NEW (badges & points)                       │
│  - tasks ✨NEW        (task definitions & hints)              │
└────────────────────────────────────────────────────────────────┘
```

---

## 📊 DATA FLOW DIAGRAM

### User Journey: Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER SIGNUP & ONBOARDING                      │
└─────────────────────────────────────────────────────────────────┘

1. User Registration
   ┌──────────────┐
   │   SignUp     │ → Email verification → User created in DB
   └──────────────┘
        ↓
2. Email Verification
   ┌──────────────────────┐
   │ Verify email link    │ → User.emailVerified = true
   └──────────────────────┘
        ↓
3. Choose Learning Style & Experience
   ┌──────────────────────┐
   │ Learning Style Quiz  │ → User.learningStyle = "visual|auditory|..."
   │ Experience Level     │ → User.experienceLevel = "beginner|intermediate|advanced"
   └──────────────────────┘
        ↓
4. Initial Assessment
   ┌──────────────────────┐
   │ Diagnostic Test      │ → UserAssessment record created
   │ (15 MCQs)            │ → Performance calculated
   └──────────────────────┘
        ↓
5. Path Generation
   ┌──────────────────────┐
   │ AI Path Generator    │ → LearningPath created
   │ (based on score)     │ → Initial tasks unlocked
   └──────────────────────┘
        ↓
6. Learning Phase
   ┌──────────────────────┐
   │ View Pathway         │ → PathwayVisualization
   │ → Select Task        │ → Open CodeEditor
   │ → Complete Task      │ → Submit Solution
   │ → Get AI Feedback    │ → Achievement unlocked?
   │ → Next Task Unlocked │ → Activity logged
   └──────────────────────┘
        ↓
7. Progress Tracking
   ┌──────────────────────┐
   │ Dashboard Analytics  │ → Stats aggregated from:
   │ View Achievements    │    - UserAssessment records
   │ View Statistics      │    - LearningPath.completedTasks
   │ View Activity Log    │    - Achievement records
   │                      │    - ActivityLog records
   └──────────────────────┘
```

---

## 🔄 COMPONENT INTERACTION MAP

```
App.jsx (Router Hub)
├── AuthForm Components
│   ├── SignUp → authService.register() → User created
│   ├── SignIn → authService.login() → JWT set
│   ├── LearningStylePage → userService.updateLearningPreferences()
│   └── ExperienceLevelPage → userService.updateLearningPreferences()
│
├── Assessment Flow
│   ├── AssessmentTest → assessmentService.submitTest()
│   └── AssessmentResult → Display & calculate proficiency
│
├── Learning Flow (Core)
│   ├── PathwayVisualization
│   │   └── learningPathService.getLearningPath()
│   │       └── Shows locked/unlocked tasks
│   │
│   └── TaskPage
│       ├── CodeEditor (nested component)
│       ├── learningPathService.submitTaskSolution()
│       ├── learningPathService.getAIFeedback()
│       └── Achievement unlock logic
│
├── User Profile
│   ├── ProfilePage → userService.getUserProfile()
│   ├── ActivityHistoryPage → userService.getActivityHistory()
│   └── ProgressDashboard
│       ├── userService.getLearningStats()
│       ├── Chart visualizations
│       └── Badge display
│
└── Admin (Protected)
    └── AdminConsole
        ├── adminService.getDashboardStats()
        ├── adminService.getAllUsers()
        ├── adminService.getAllQuestions()
        └── adminService.getSystemHealth()
```

---

## 🗄️ DATABASE SCHEMA RELATIONSHIPS

```
┌─────────────────────────────────────────────────────────────────┐
│                     RELATIONSHIPS & INDEXES                      │
└─────────────────────────────────────────────────────────────────┘

User (Relationship Hub)
├─ 1:1 → UserProfile (extended data)
├─ 1:N → UserAssessment (assessment records)
├─ 1:N → LearningPath (learning paths)
├─ 1:N → ActivityLog (user activities)
├─ 1:N → Achievement (badges earned)
└─ Has: role, learningStyle, experienceLevel

UserProfile
├─ 1:1 ← User (userId)
├─ Data: bio, goals, timezone, dailyGoalMinutes
├─ Tracking: streakDays, totalPoints
└─ Indexes: userId, totalPoints (for leaderboards)

Assessment
├─ 1:N → UserAssessment
├─ Data: questions, difficulty, language
└─ Indexes: language, difficulty

UserAssessment
├─ N:1 ← User (userId)
├─ N:1 ← Assessment (assessmentId)
├─ Data: answers, percentage, proficiency
├─ Indexes: userId, language, createdAt
└─ Provides: Diagnostic results, scoring

LearningPath
├─ N:1 ← User (userId)
├─ Data: language, taskSequence, progress
├─ Tracking: completedTasks, currentProgress
└─ Indexes: userId, language

ActivityLog
├─ N:1 ← User (userId)
├─ Data: activityType, metadata, timestamp
├─ Types: task_completed, assessment_taken, badge_earned, login
└─ Indexes: userId, timestamp, activityType

Achievement
├─ N:1 ← User (userId)
├─ Data: badgeType, points, unlockedAt
├─ Badge Types: 10 different types
└─ Indexes: userId, badgeType

Task
├─ 1:N → LearningPath
├─ Data: difficulty, hints, testCases, topic
├─ Indexed by: language, difficulty, proficiencyLevel
└─ Relationships: Can be assigned to multiple paths

```

---

## 🔐 SECURITY & AUTHENTICATION FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   User → SignUp → Hash Password (bcryptjs)
                → Create User record
                → Send verification email
                → Redirect to login

2. EMAIL VERIFICATION
   User → Click email link → Mark user as verified → Redirect to login

3. LOGIN
   User → Enter credentials → Verify password → Generate JWT
                           → Set httpOnly cookie
                           → Return user data

4. PROTECTED ROUTES
   Every request → Check JWT in httpOnly cookie
               → Verify signature
               → Decode user ID
               → Attach to req.user
               → Continue to route handler

5. ADMIN PROTECTION
   Admin route → Check JWT → Verify role = "admin"
                          → Allow/Deny access
                          → Log access attempt (ActivityLog)

6. TOKEN EXPIRATION
   Token valid for: 7 days
   On expiry: User must login again

```

---

## 📈 GAMIFICATION SYSTEM

```
┌─────────────────────────────────────────────────────────────────┐
│                     ACHIEVEMENT SYSTEM                           │
└─────────────────────────────────────────────────────────────────┘

Badge Earning Flow:

Task Completed → Check achievement criteria
              → Achievement unlocked? (AI Feedback score > 80%)
              → Create Achievement record
              → Award points (10-100 pts)
              → Update UserProfile.totalPoints
              → Update streak if daily
              → Log activity as "badge_earned"
              → Display in dashboard
              → Notify user

Badge Types & Points:
1. 🚀 First Steps (10 pts)         - First task completed
2. ⭐ Getting Started (15 pts)     - First 3 tasks
3. 🔥 Task Master (30 pts)        - 10 tasks completed
4. 🏆 Pathfinder (20 pts)         - Complete learning path
5. ✅ Assessor (25 pts)           - Complete assessment
6. 👑 Expert (50 pts)             - Score 90%+ on 5 tasks
7. 🔥 Dedication (40 pts)         - 7-day streak
8. 💡 Problem Solver (35 pts)     - Solve hard tasks
9. 🎓 Advanced Learner (45 pts)   - Complete advanced path
10. 🧩 Challenge Solver (60 pts)  - Solve challenge tasks

```

---

## 🚀 API ENDPOINT ORGANIZATION

```
┌─────────────────────────────────────────────────────────────────┐
│                   API ROUTE STRUCTURE                            │
└─────────────────────────────────────────────────────────────────┘

/api
├── /auth (authRoutes - Existing)
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /forgot-password
│   ├── POST   /reset-password
│   └── POST   /verify-email
│
├── /assessment (assessmentRoutes - Existing)
│   ├── GET    /languages
│   ├── GET    /questions/:language
│   ├── POST   /submit
│   ├── GET    /result/:userId
│   ├── GET    /attempts/:userId
│   └── GET    /status/:userId
│
├── /learning-path (learningPathRoutes - Existing)
│   ├── GET    /:userId
│   ├── POST   /initialize
│   ├── POST   /add-language
│   ├── PATCH  /complete-task
│   ├── PATCH  /save-draft
│   ├── POST   /submit-solution
│   ├── POST   /ai-feedback
│   └── GET    /:userId/:language/:taskId/explanation
│
├── /users (userRoutes - NEW)
│   ├── GET    /profile/:userId
│   ├── PATCH  /profile/:userId
│   ├── GET    /activity-history/:userId
│   ├── GET    /activity-summary/:userId
│   ├── POST   /log-activity
│   ├── GET    /achievements/:userId
│   ├── POST   /unlock-achievement
│   ├── PATCH  /learning-preferences/:userId
│   └── GET    /learning-stats/:userId
│
└── /admin (adminRoutes - NEW, Protected with adminOnly middleware)
    ├── GET    /dashboard
    ├── GET    /users
    ├── GET    /users/:userId
    ├── PATCH  /users/:userId/role
    ├── DELETE /users/:userId
    ├── GET    /questions
    ├── POST   /questions
    ├── PATCH  /questions/:questionId
    ├── DELETE /questions/:questionId
    ├── GET    /system-health
    └── GET    /reports

Total: 40+ API endpoints
```

---

## 📊 STATE MANAGEMENT

```
Global App State:
├── User (from Context/Redux if needed)
│   ├── id, name, email, role
│   ├── learningStyle, experienceLevel
│   └── isAuthenticated
│
├── Assessment
│   ├── currentLanguage
│   ├── testResults
│   └── proficiencyLevel
│
├── LearningPath
│   ├── currentPath
│   ├── completedTasks
│   ├── currentTask
│   └── unlockedTasks
│
└── Admin (if admin role)
    ├── users list
    ├── questions list
    └── system stats

Component Local State:
├── Form inputs (controlled components)
├── UI toggles (modals, dropdowns)
├── Loading states
└── Error messages
```

---

## 🔄 ACTIVITY LOGGING SYSTEM

```
Activity Types Tracked:

1. login
   - User logs in
   - Logged on: authController.login()
   - Data: browser, ip

2. task_completed
   - Task submitted successfully
   - Logged on: learningPathController.completeTask()
   - Data: taskId, score, language

3. assessment_taken
   - Assessment completed
   - Logged on: assessmentController.submit()
   - Data: language, score, duration

4. badge_earned
   - Achievement unlocked
   - Logged on: userController.unlockAchievement()
   - Data: badgeType, points

5. profile_updated
   - User updates profile
   - Logged on: userController.updateProfile()
   - Data: changedFields

6. preferences_updated
   - Learning preferences changed
   - Logged on: userController.updateLearningPreferences()
   - Data: newPreferences

7. password_reset
   - Password changed
   - Logged on: authController.resetPassword()
   - Data: timestamp

All activities aggregated for:
- Activity history view
- Analytics dashboard
- Admin reports
- User engagement tracking

```

---

## ✨ KEY INTEGRATIONS

```
External Services:
├── OpenAI API
│   ├── Location: learningPathController.getAIFeedback()
│   ├── Function: Generate code feedback
│   └── Fallback: Manual feedback template
│
├── Email Service (Nodemailer)
│   ├── Location: utils/sendEmail.js
│   ├── Use: Verification, password reset, notifications
│   └── Status: Configured and ready
│
└── JWT/Authentication
    ├── Library: jsonwebtoken, bcryptjs
    ├── Location: middleware/auth.js
    └── Token lifespan: 7 days

Frontend Libraries:
├── React Router (Navigation)
├── Axios (HTTP client)
├── Tailwind CSS (Styling)
├── Lucide React (Icons)
└── Chart.js (Analytics visualization)

```

---

**Generated: April 17, 2026**
**Status: Complete & Updated ✅**
