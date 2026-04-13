async function init() {
    await initializeDatabase();
}

init();

async function getCategories() {
    const db = getDB();
    return db.categories ? db.categories.filter(c => c.isActive) : [];
}

async function getCategoryById(id) {
    const db = getDB();
    return db.categories ? db.categories.find(c => c.id === id && c.isActive) : null;
}

async function addCategory(category) {
    const newCategory = {
        id: generateId(),
        ...category,
        isActive: true
    };
    const db = getDB();
    if (!db.categories) db.categories = [];
    db.categories.push(newCategory);
    saveDB(db);
    return newCategory;
}

async function updateCategory(id, updates) {
    const db = getDB();
    const index = db.categories ? db.categories.findIndex(c => c.id === id) : -1;
    if (index !== -1) {
        db.categories[index] = { ...db.categories[index], ...updates };
        saveDB(db);
        return true;
    }
    return false;
}

async function deleteCategory(id) {
    const db = getDB();
    const index = db.categories ? db.categories.findIndex(c => c.id === id) : -1;
    if (index !== -1) {
        db.categories.splice(index, 1);
        saveDB(db);
    }
}

async function getQuestions(categoryId = null, difficulty = null) {
    const db = getDB();
    let questions = db.questions ? db.questions.filter(q => q.isActive) : [];
    if (categoryId) questions = questions.filter(q => q.categoryId === categoryId);
    if (difficulty) questions = questions.filter(q => q.difficulty === difficulty);
    return questions;
}

async function getQuestionById(id) {
    const db = getDB();
    return db.questions ? db.questions.find(q => q.id === id) : null;
}

async function addQuestion(question) {
    const points = { easy: 1, medium: 2, hard: 3 };
    const newQuestion = {
        id: generateId(),
        ...question,
        points: points[question.difficulty] || 1,
        isActive: true
    };
    const db = getDB();
    if (!db.questions) db.questions = [];
    db.questions.push(newQuestion);
    saveDB(db);
    return newQuestion;
}

async function updateQuestion(id, updates) {
    const db = getDB();
    const index = db.questions ? db.questions.findIndex(q => q.id === id) : -1;
    if (index !== -1) {
        if (updates.difficulty) {
            const points = { easy: 1, medium: 2, hard: 3 };
            updates.points = points[updates.difficulty];
        }
        db.questions[index] = { ...db.questions[index], ...updates };
        saveDB(db);
        return true;
    }
    return false;
}

async function deleteQuestion(id) {
    const db = getDB();
    const index = db.questions ? db.questions.findIndex(q => q.id === id) : -1;
    if (index !== -1) {
        db.questions[index].isActive = false;
        saveDB(db);
    }
}

async function getAllUsers() {
    const db = getDB();
    return db.users || [];
}

async function getUserById(userId) {
    const db = getDB();
    return db.users ? db.users.find(u => u.id === userId) || null : null;
}

async function updateUser(userId, updates) {
    const db = getDB();
    const index = db.users ? db.users.findIndex(u => u.id === userId) : -1;
    if (index !== -1) {
        db.users[index] = { ...db.users[index], ...updates };
        saveDB(db);
        return true;
    }
    return false;
}

async function updateUserData(userId, updates) {
    return updateUser(userId, updates);
}

async function getAllAttempts() {
    const db = getDB();
    return db.attempts || [];
}

async function getData(key) {
    return null;
}

async function setData(key, data) {
}