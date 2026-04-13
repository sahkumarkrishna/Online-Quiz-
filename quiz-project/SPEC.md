# QuizX - Interactive Quiz Platform

## 1. Concept & Vision

QuizX is a modern, engaging quiz platform that transforms learning into an interactive experience. Built as a single-page application with MongoDB Atlas for data persistence, it provides a seamless, fast, and responsive quiz-taking experience. The design philosophy emphasizes clarity, gamification, and accessibility.

## 2. Design Language

### Color Palette
- **Primary**: `#6366F1` (Indigo-500)
- **Secondary**: `#8B5CF6` (Violet-500)
- **Success**: `#10B981` (Emerald-500)
- **Error**: `#EF4444` (Red-500)
- **Warning**: `#F59E0B` (Amber-500)
- **Background**: `#F8FAFC` (Slate-50)
- **Surface**: `#FFFFFF`
- **Text Primary**: `#1E293B` (Slate-800)
- **Text Secondary**: `#64748B` (Slate-500)
- **Sidebar**: `#1E1E2E`

### Typography
- **Font**: Inter (Google Fonts)

### Motion
- Transitions: 200-300ms ease
- Hover: Scale 1.02
- Success: Pulse animation
- Error: Shake animation
- Timer: Warning at 10 seconds

## 3. Features

### Authentication
- **Admin Credentials**:
  - Email: kumarkrishna9801552@gmail.com
  - Password: krishna@123
- User Register/Login with MongoDB
- Session stored in localStorage

### User Features
- Dashboard with quiz cards
- Take quiz with timer
- Score calculation
- Result display with review
- Quiz history
- Leaderboard

### Admin Features
- Question management (CRUD)
- Category management
- View all users
- Platform statistics

### Quiz Mechanics
- Categories: Programming, Science, History, General Knowledge
- Difficulty: Easy, Medium, Hard
- Timer: 30 seconds per question
- Points: Easy(1), Medium(2), Hard(3)

## 4. Technical Approach

- **Frontend**: HTML5, Tailwind CSS (CDN), Vanilla JavaScript
- **Database**: MongoDB Atlas Data API (no backend)
- **Architecture**: Multi-page application with shared CSS/JS
- **No external dependencies except CDN libraries**

### MongoDB Atlas Data API Configuration
Create a `config.js` file with your MongoDB Atlas credentials:
```javascript
const MONGODB_CONFIG = {
    API_URL: 'https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1',
    API_KEY: 'YOUR_API_KEY',
    DATABASE: 'quizx',
    COLLECTIONS: {
        USERS: 'users',
        CATEGORIES: 'categories',
        QUESTIONS: 'questions',
        ATTEMPTS: 'attempts',
        LEADERBOARD: 'leaderboard'
    }
};
```

## 5. File Structure

```
quiz-project/
├── index.html          # Login page
├── register.html       # Registration page
├── dashboard.html      # User dashboard
├── admin.html          # Admin dashboard
├── quiz.html           # Quiz taking page
├── results.html        # Quiz results
├── leaderboard.html    # Leaderboard page
├── config.js           # MongoDB configuration
├── css/
│   └── styles.css      # Custom styles
├── js/
│   ├── app.js          # Main application logic
│   ├── db.js           # MongoDB Atlas Data API
│   ├── data.js         # Data management
│   ├── auth.js         # Authentication
│   ├── quiz.js         # Quiz logic
│   └── admin.js        # Admin functionality
└── SPEC.md
```
