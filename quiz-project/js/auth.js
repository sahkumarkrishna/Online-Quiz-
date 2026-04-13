function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(16);
}

async function register(name, email, password) {
    const existingUser = await getUserByEmailFromDB(email);
    if (existingUser) {
        return { success: false, message: 'Email already registered' };
    }

    const newUser = {
        id: generateId(),
        name: name,
        email: email.toLowerCase(),
        password: hashPassword(password),
        role: 'user',
        createdAt: new Date().toISOString(),
        isActive: true
    };

    await createUserInDB(newUser);

    const token = generateToken(newUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
        token: token,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
    }));

    return { success: true, user: newUser };
}

async function login(email, password) {
    const user = await getUserByEmailFromDB(email);

    if (!user) {
        return { success: false, message: 'User not found' };
    }

    if (!user.isActive) {
        return { success: false, message: 'Account is disabled' };
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
        return { success: false, message: 'Invalid password' };
    }

    const token = generateToken(user);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token: token,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
    }));

    return { success: true, user: user };
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.location.href = 'index.html';
}

function getCurrentUser() {
    const session = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!session) return null;

    const data = JSON.parse(session);
    if (Date.now() > data.expiresAt) {
        logout();
        return null;
    }

    return data.user;
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

function generateToken(user) {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        iat: Date.now()
    };
    return btoa(JSON.stringify(payload));
}

function verifyToken(token) {
    try {
        const payload = JSON.parse(atob(token));
        return payload;
    } catch {
        return null;
    }
}

function requireAuth() {
    const session = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!session) {
        window.location.href = 'index.html';
        return false;
    }
    
    const data = JSON.parse(session);
    if (Date.now() > data.expiresAt) {
        logout();
        return false;
    }
    
    return true;
}

function requireAdmin() {
    const session = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!session) {
        window.location.href = 'admin-login.html';
        return false;
    }
    
    const data = JSON.parse(session);
    if (Date.now() > data.expiresAt) {
        logout();
        return false;
    }
    
    if (!data.user || data.user.role !== 'admin') {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

async function getAllUsers() {
    return await getUsersFromDB();
}

async function updateUser(userId, updates) {
    return await updateUserInDB(userId, updates);
}

async function deleteUser(userId) {
}

async function getUserByEmailFromDB(email) {
    return await getUserByEmail(email);
}

async function getUserByEmail(email) {
    const users = await getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

async function getUsersFromDB() {
    return await getUsers();
}

async function createUserInDB(user) {
    return await createUser(user);
}

async function updateUserInDB(userId, updates) {
    return await updateUserData(userId, updates);
}
