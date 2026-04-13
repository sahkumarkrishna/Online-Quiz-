# QuizX - Interactive Quiz Platform

A modern, responsive quiz application built with HTML, CSS, JavaScript, and Tailwind CSS.

## 🚀 Quick Start

### Option 1: Double-Click (Windows)
Simply double-click `start-server.bat` to launch the server automatically.

### Option 2: Command Line

```bash
# Navigate to the project folder
cd C:\Users\91933\Desktop\create\quiz-project

# Install dependencies
npm install

# Start the server
npm start
```

Then open **http://localhost:3000** in your browser.

## ❌ Why a Server is Required

Browsers treat `file://` URLs as unique security origins, which prevents JavaScript from:
- Properly loading local JSON files
- Storing data in localStorage consistently
- Running certain APIs

Using a local server fixes all these issues.

## 📁 Project Structure

```
quiz-project/
├── index.html          # Landing page
├── dashboard.html      # User dashboard
├── quiz.html          # Quiz taking page
├── results.html       # Quiz results
├── leaderboard.html   # Global leaderboard
├── profile.html       # User profile
├── login.html         # Login page
├── register.html      # Registration page
├── admin.html         # Admin panel
├── config.js          # Quiz categories & questions
├── server.js          # Local server
├── start-server.bat   # Quick start script (Windows)
└── js/
    ├── db.js          # Database operations
    ├── auth.js        # Authentication
    └── quiz.js        # Quiz logic
```

## ✨ Features

- User authentication (login/register)
- Multiple quiz categories
- Difficulty levels (Easy, Medium, Hard)
- Real-time scoring
- Global leaderboard
- User dashboard with statistics
- Profile management
- Responsive design (mobile-friendly)
- Beautiful animations & transitions

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Poppins)
- **Server**: Node.js + Express

## 📝 Note

If you see a warning about using a local server, please follow the instructions above to set up the server properly.
