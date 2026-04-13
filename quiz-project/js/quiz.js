function startQuiz(categoryId, difficulty = null) {
    const questions = getQuestionsSync(categoryId, difficulty);

    if (questions.length === 0) {
        return null;
    }

    const shuffledQuestions = shuffleArray([...questions]);

    const quizSession = {
        categoryId: categoryId,
        questions: shuffledQuestions,
        currentIndex: 0,
        answers: [],
        startTime: Date.now(),
        timePerQuestion: 30
    };

    sessionStorage.setItem('quiz_session', JSON.stringify(quizSession));
    return quizSession;
}

function getQuestionsSync(categoryId = null, difficulty = null) {
    const db = getDB();
    let questions = db.questions ? db.questions.filter(q => q.isActive) : [];
    if (categoryId) questions = questions.filter(q => q.categoryId === categoryId);
    if (difficulty && difficulty !== 'all') questions = questions.filter(q => q.difficulty === difficulty);
    return questions;
}

function getCategories() {
    const db = getDB();
    return db.categories ? db.categories.filter(c => c.isActive) : [];
}

function getCategoryById(id) {
    const db = getDB();
    return db.categories ? db.categories.find(c => c.id === id && c.isActive) : null;
}

async function getLeaderboardFromDB(categoryId = null, limit = 10) {
    const db = getDB();
    let leaderboard = db.leaderboard || [];
    if (categoryId) leaderboard = leaderboard.filter(l => l.categoryId === categoryId);
    return leaderboard.sort((a, b) => b.bestScore - a.bestScore).slice(0, limit);
}

function getQuizSession() {
    const session = sessionStorage.getItem('quiz_session');
    return session ? JSON.parse(session) : null;
}

function submitAnswer(questionId, answerIndex) {
    const session = getQuizSession();
    if (!session) return null;

    const question = session.questions.find(q => q.id === questionId);
    const isCorrect = question && question.correctAnswer === answerIndex;

    const existingAnswer = session.answers.findIndex(a => a.questionId === questionId);
    const answer = {
        questionId: questionId,
        selectedAnswer: answerIndex,
        isCorrect: isCorrect,
        timeTaken: 30
    };

    if (existingAnswer !== -1) {
        session.answers[existingAnswer] = answer;
    } else {
        session.answers.push(answer);
    }

    sessionStorage.setItem('quiz_session', JSON.stringify(session));
    return answer;
}

function nextQuestion() {
    const session = getQuizSession();
    if (!session) return null;

    if (session.currentIndex < session.questions.length - 1) {
        session.currentIndex++;
        sessionStorage.setItem('quiz_session', JSON.stringify(session));
        return session;
    }
    return session;
}

function previousQuestion() {
    const session = getQuizSession();
    if (!session) return null;

    if (session.currentIndex > 0) {
        session.currentIndex--;
        sessionStorage.setItem('quiz_session', JSON.stringify(session));
        return session;
    }
    return session;
}

async function finishQuiz() {
    const session = getQuizSession();
    if (!session) {
        console.error('No quiz session found');
        return null;
    }

    const user = getCurrentUser();
    if (!user || !user.id) {
        console.error('No user found');
        return null;
    }

    const correctAnswers = session.answers ? session.answers.filter(a => a.isCorrect).length : 0;
    const totalQuestions = session.questions ? session.questions.length : 0;
    const totalPoints = session.questions ? session.questions.reduce((sum, q) => sum + (q.points || 1), 0) : 0;
    const earnedPoints = session.answers
        ? session.answers.filter(a => a.isCorrect).reduce((sum, a) => {
            const q = session.questions.find(q => q.id === a.questionId);
            return sum + (q ? (q.points || 1) : 0);
        }, 0)
        : 0;

    const attempt = {
        id: generateId(),
        userId: user.id,
        userName: user.name,
        categoryId: session.categoryId || 'all',
        answers: session.answers || [],
        score: correctAnswers,
        totalQuestions: totalQuestions,
        totalPoints: totalPoints,
        earnedPoints: earnedPoints,
        percentage: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
        completedAt: new Date().toISOString(),
        timeTaken: Math.round((Date.now() - session.startTime) / 1000)
    };

    await saveAttemptToDB(attempt);
    await updateLeaderboardInDB(user.id, user.name, session.categoryId, attempt.percentage);
    
    sessionStorage.setItem('quiz_result', JSON.stringify(attempt));
    sessionStorage.removeItem('quiz_session');

    return attempt;
}

async function saveAttemptToDB(attempt) {
    const db = getDB();
    if (!db.attempts) db.attempts = [];
    db.attempts.push(attempt);
    saveDB(db);
    return attempt;
}

async function updateLeaderboardInDB(userId, userName, categoryId, percentage) {
    const db = getDB();
    if (!db.leaderboard) db.leaderboard = [];
    const existing = db.leaderboard.find(l => l.userId === userId && l.categoryId === categoryId);
    
    if (existing) {
        if (percentage > existing.bestScore) existing.bestScore = percentage;
        existing.lastScore = percentage;
        existing.attempts = (existing.attempts || 0) + 1;
    } else {
        db.leaderboard.push({
            userId,
            userName,
            categoryId,
            bestScore: percentage,
            lastScore: percentage,
            attempts: 1
        });
    }
    saveDB(db);
}

function getUserAttempts(userId = null) {
    const currentUser = userId || getCurrentUser()?.id;
    if (currentUser) {
        return getAttemptsFromDB(currentUser);
    }
    return [];
}

async function getAttemptsFromDB(userId) {
    const db = getDB();
    return db.attempts ? db.attempts.filter(a => a.userId === userId) : [];
}

function getAllAttempts() {
    const db = getDB();
    return db.attempts || [];
}

function updateLeaderboard(userId, userName, categoryId, percentage) {
    updateLeaderboardInDB(userId, userName, categoryId, percentage);
}

function getLeaderboard(categoryId = null, limit = 10) {
    const db = getDB();
    let leaderboard = db.leaderboard || [];
    if (categoryId) leaderboard = leaderboard.filter(l => l.categoryId === categoryId);
    return leaderboard.sort((a, b) => b.bestScore - a.bestScore).slice(0, limit);
}

function getStats(userId = null) {
    const currentUser = userId || getCurrentUser()?.id;
    return {
        totalAttempts: 0,
        completedAttempts: 0,
        avgScore: 0,
        bestScore: 0,
        totalTime: 0,
        byCategory: {}
    };
}

async function getStatsAsync(userId = null) {
    const currentUser = userId || getCurrentUser()?.id;
    if (!currentUser) {
        return { totalAttempts: 0, completedAttempts: 0, avgScore: 0, bestScore: 0, totalTime: 0, byCategory: {} };
    }
    
    const db = getDB();
    const allAttempts = db.attempts || [];
    const attempts = allAttempts.filter(a => a.userId === currentUser);

    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(a => (a.percentage || 0) >= 60).length;
    
    let avgScore = 0;
    if (totalAttempts > 0) {
        const totalPercentage = attempts.reduce((sum, a) => sum + (a.percentage || 0), 0);
        avgScore = Math.round(totalPercentage / totalAttempts);
    }
    
    let bestScore = 0;
    if (totalAttempts > 0) {
        bestScore = Math.max(...attempts.map(a => a.percentage || 0));
    }
    
    const totalTime = attempts.reduce((sum, a) => sum + (a.timeTaken || 0), 0);

    const byCategory = {};
    const categories = db.categories || [];

    for (const cat of categories) {
        if (!cat.isActive) continue;
        const catAttempts = attempts.filter(a => a.categoryId === cat.id);
        if (catAttempts.length > 0) {
            const catTotal = catAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0);
            byCategory[cat.id] = {
                name: cat.name,
                attempts: catAttempts.length,
                avgScore: Math.round(catTotal / catAttempts.length),
                bestScore: Math.max(...catAttempts.map(a => a.percentage || 0))
            };
        }
    }

    return {
        totalAttempts,
        completedAttempts,
        avgScore,
        bestScore,
        totalTime,
        byCategory
    };
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}