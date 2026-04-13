const DB_NAME = 'quiz_db';

function getDB() {
    const data = localStorage.getItem(DB_NAME);
    return data ? JSON.parse(data) : {
        users: [],
        categories: [],
        questions: [],
        attempts: [],
        leaderboard: []
    };
}

function saveDB(db) {
    localStorage.setItem(DB_NAME, JSON.stringify(db));
}

function getCollection(name) {
    const db = getDB();
    return db[name] || [];
}

function setCollection(name, data) {
    const db = getDB();
    db[name] = data;
    saveDB(db);
}

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(16);
}

async function initializeDatabase() {
    const db = getDB();
    const adminEmail = ADMIN_USER.email.toLowerCase();
    
    let adminUser = db.users.find(u => u.email.toLowerCase() === adminEmail);
    
    if (!adminUser) {
        const hashedAdmin = { ...ADMIN_USER, email: adminEmail, password: hashPassword(ADMIN_USER.password) };
        db.users.push(hashedAdmin);
    } else if (!adminUser.password.startsWith('hash_')) {
        adminUser.password = hashPassword(ADMIN_USER.password);
    }
    
    if (db.categories.length === 0) {
        db.categories = [...DEFAULT_CATEGORIES];
    }
    if (db.questions.length === 0) {
        db.questions = [...DEFAULT_QUESTIONS];
    }
    
    saveDB(db);
}

async function getUsers() {
    return getCollection('users');
}

async function getUserByEmail(email) {
    const users = getCollection('users');
    return users.find(u => u.email === email.toLowerCase()) || null;
}

async function getUserById(id) {
    const users = getCollection('users');
    return users.find(u => u.id === id) || null;
}

async function createUser(user) {
    const users = getCollection('users');
    users.push(user);
    setCollection('users', users);
    return user;
}

async function updateUserData(userId, updates) {
    const users = getCollection('users');
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        setCollection('users', users);
        return true;
    }
    return false;
}

async function getCategories() {
    const categories = getCollection('categories');
    return categories.filter(c => c.isActive);
}

async function getCategoryById(id) {
    const categories = getCollection('categories');
    return categories.find(c => c.id === id && c.isActive) || null;
}

async function createCategory(category) {
    const categories = getCollection('categories');
    categories.push(category);
    setCollection('categories', categories);
    return category;
}

async function updateCategoryData(id, updates) {
    const categories = getCollection('categories');
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
        categories[index] = { ...categories[index], ...updates };
        setCollection('categories', categories);
        return true;
    }
    return false;
}

async function deleteCategoryData(id) {
    const categories = getCollection('categories');
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
        categories.splice(index, 1);
        setCollection('categories', categories);
    }
}

async function getAttemptsData() {
    return await getAttempts();
}

async function getQuestions(categoryId = null, difficulty = null) {
    let questions = getCollection('questions').filter(q => q.isActive);
    if (categoryId) questions = questions.filter(q => q.categoryId === categoryId);
    if (difficulty) questions = questions.filter(q => q.difficulty === difficulty);
    return questions;
}

async function getQuestionById(id) {
    const questions = getCollection('questions');
    return questions.find(q => q.id === id) || null;
}

async function createQuestion(question) {
    const questions = getCollection('questions');
    questions.push(question);
    setCollection('questions', questions);
    return question;
}

async function updateQuestionData(id, updates) {
    const questions = getCollection('questions');
    const index = questions.findIndex(q => q.id === id);
    if (index !== -1) {
        questions[index] = { ...questions[index], ...updates };
        setCollection('questions', questions);
        return true;
    }
    return false;
}

async function deleteQuestionData(id) {
    const questions = getCollection('questions');
    const index = questions.findIndex(q => q.id === id);
    if (index !== -1) {
        questions[index].isActive = false;
        setCollection('questions', questions);
    }
}

async function getAttempts(userId = null) {
    let attempts = getCollection('attempts');
    if (userId) attempts = attempts.filter(a => a.userId === userId);
    return attempts;
}

async function createAttempt(attempt) {
    const attempts = getCollection('attempts');
    attempts.push(attempt);
    setCollection('attempts', attempts);
    return attempt;
}

async function getLeaderboard(categoryId = null) {
    let leaderboard = getCollection('leaderboard');
    if (categoryId) leaderboard = leaderboard.filter(l => l.categoryId === categoryId);
    return leaderboard;
}

async function updateLeaderboardEntry(userId, userName, categoryId, percentage) {
    let leaderboard = getCollection('leaderboard');
    const existing = leaderboard.find(l => l.userId === userId && l.categoryId === categoryId);
    
    if (existing) {
        if (percentage > existing.bestScore) {
            existing.bestScore = percentage;
        }
        existing.lastScore = percentage;
        existing.attempts = (existing.attempts || 0) + 1;
    } else {
        leaderboard.push({
            userId,
            userName,
            categoryId,
            bestScore: percentage,
            lastScore: percentage,
            attempts: 1
        });
    }
    
    setCollection('leaderboard', leaderboard);
}

function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
