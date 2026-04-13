const API_URL = 'http://localhost:5000/api';

async function apiRequest(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('quizx_token');
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

const STORAGE_KEYS = {
    USERS: 'quizx_users',
    CATEGORIES: 'quizx_categories',
    QUESTIONS: 'quizx_questions',
    QUIZ_ATTEMPTS: 'quizx_attempts',
    CURRENT_USER: 'quizx_current_user',
    LEADERBOARD: 'quizx_leaderboard'
};

async function initializeData() {
    localStorage.setItem('quizx_mode', 'api');
}

function getCurrentUser() {
    const session = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!session) return null;
    return JSON.parse(session);
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem('quizx_token');
    window.location.href = 'index.html';
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function requireAdmin() {
    if (!requireAuth()) return false;
    if (!isAdmin()) {
        window.location.href = 'dashboard.html';
        return false;
    }
    return true;
}

function getToken() {
    return localStorage.getItem('quizx_token');
}

async function register(name, email, password) {
    try {
        const result = await apiRequest('/auth/register', 'POST', { name, email, password });
        if (result.success) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(result.user));
            localStorage.setItem('quizx_token', result.token);
        }
        return result;
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function login(email, password) {
    try {
        const result = await apiRequest('/auth/login', 'POST', { email, password });
        if (result.success) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(result.user));
            localStorage.setItem('quizx_token', result.token);
        }
        return result;
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function getCategories() {
    try {
        const result = await apiRequest('/categories');
        return result.categories || [];
    } catch (error) {
        return [];
    }
}

async function getCategoryById(id) {
    try {
        const result = await apiRequest(`/categories/${id}`);
        return result.category;
    } catch (error) {
        return null;
    }
}

async function addCategory(category) {
    try {
        const result = await apiRequest('/categories', 'POST', category);
        return result.category;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function updateCategory(id, updates) {
    try {
        const result = await apiRequest(`/categories/${id}`, 'PUT', updates);
        return result.category;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function deleteCategory(id) {
    try {
        await apiRequest(`/categories/${id}`, 'DELETE');
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function getQuestions(categoryId = null, difficulty = null) {
    try {
        let url = '/questions';
        const params = [];
        if (categoryId) params.push(`categoryId=${categoryId}`);
        if (difficulty) params.push(`difficulty=${difficulty}`);
        if (params.length > 0) url += '?' + params.join('&');
        
        const result = await apiRequest(url);
        return result.questions || [];
    } catch (error) {
        return [];
    }
}

async function getQuestionById(id) {
    try {
        const result = await apiRequest(`/questions/${id}`);
        return result.question;
    } catch (error) {
        return null;
    }
}

async function addQuestion(question) {
    try {
        const user = getCurrentUser();
        const result = await apiRequest('/questions', 'POST', { ...question, createdBy: user?.id });
        return result.question;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function updateQuestion(id, updates) {
    try {
        const result = await apiRequest(`/questions/${id}`, 'PUT', updates);
        return result.question;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function deleteQuestion(id) {
    try {
        await apiRequest(`/questions/${id}`, 'DELETE');
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

let quizSession = null;

async function startQuiz(categoryId, difficulty = null) {
    try {
        const result = await apiRequest('/quiz/start', 'POST', { categoryId, difficulty });
        if (result.questions && result.questions.length > 0) {
            quizSession = {
                categoryId,
                questions: result.questions,
                answers: [],
                startTime: Date.now(),
                timePerQuestion: 30
            };
            sessionStorage.setItem('quiz_session', JSON.stringify(quizSession));
            return quizSession;
        }
        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function getQuizSession() {
    if (quizSession) return quizSession;
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
        questionId,
        selectedAnswer: answerIndex,
        isCorrect
    };
    
    if (existingAnswer !== -1) {
        session.answers[existingAnswer] = answer;
    } else {
        session.answers.push(answer);
    }
    
    sessionStorage.setItem('quiz_session', JSON.stringify(session));
    quizSession = session;
    return answer;
}

function nextQuestion() {
    const session = getQuizSession();
    if (!session) return null;
    
    if (session.currentIndex < session.questions.length - 1) {
        session.currentIndex++;
        sessionStorage.setItem('quiz_session', JSON.stringify(session));
        quizSession = session;
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
        quizSession = session;
        return session;
    }
    return session;
}

async function finishQuiz() {
    const session = getQuizSession();
    if (!session) return null;
    
    const timeTaken = Math.round((Date.now() - session.startTime) / 1000);
    
    try {
        const result = await apiRequest('/quiz/submit', 'POST', {
            categoryId: session.categoryId,
            answers: session.answers,
            timeTaken
        });
        
        sessionStorage.removeItem('quiz_session');
        quizSession = null;
        
        return result.attempt;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function getUserAttempts() {
    try {
        const result = await apiRequest('/quiz/history');
        return result.attempts || [];
    } catch (error) {
        return [];
    }
}

async function getUserStats() {
    try {
        const result = await apiRequest('/quiz/stats');
        return result.stats || { totalAttempts: 0, avgScore: 0, bestScore: 0 };
    } catch (error) {
        return { totalAttempts: 0, avgScore: 0, bestScore: 0 };
    }
}

async function getLeaderboard(categoryId = null) {
    try {
        let url = '/leaderboard';
        if (categoryId) url += `?categoryId=${categoryId}`;
        const result = await apiRequest(url);
        return result.leaderboard || [];
    } catch (error) {
        return [];
    }
}

async function getAdminStats() {
    try {
        const result = await apiRequest('/leaderboard/stats');
        return result.stats;
    } catch (error) {
        return null;
    }
}

async function getAllUsers() {
    try {
        const result = await apiRequest('/auth/users');
        return result.users || [];
    } catch (error) {
        return [];
    }
}

async function updateUserStatus(userId, isActive) {
    try {
        const result = await apiRequest(`/auth/users/${userId}`, 'PUT', { isActive });
        return result.user;
    } catch (error) {
        return null;
    }
}

initializeData();
