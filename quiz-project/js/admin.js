function getAdminStats() {
    const users = getAllUsers();
    const questions = getData(STORAGE_KEYS.QUESTIONS) || [];
    const attempts = getAllAttempts();
    const categories = getCategories();
    
    const totalUsers = users.length;
    const totalQuestions = questions.filter(q => q.isActive).length;
    const totalAttempts = attempts.length;
    
    const avgScore = totalAttempts > 0 
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts) 
        : 0;
    
    const passRate = totalAttempts > 0 
        ? Math.round((attempts.filter(a => a.percentage >= 60).length / totalAttempts) * 100) 
        : 0;
    
    const recentActivity = attempts
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 10)
        .map(a => {
            const category = getCategoryById(a.categoryId);
            return {
                ...a,
                categoryName: category ? category.name : 'Unknown'
            };
        });
    
    const questionsByDifficulty = {
        easy: questions.filter(q => q.isActive && q.difficulty === 'easy').length,
        medium: questions.filter(q => q.isActive && q.difficulty === 'medium').length,
        hard: questions.filter(q => q.isActive && q.difficulty === 'hard').length
    };
    
    const categoryStats = categories.map(cat => {
        const catQuestions = questions.filter(q => q.categoryId === cat.id && q.isActive).length;
        const catAttempts = attempts.filter(a => a.categoryId === cat.id).length;
        return {
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            questionCount: catQuestions,
            attemptCount: catAttempts
        };
    });
    
    return {
        totalUsers,
        totalQuestions,
        totalAttempts,
        avgScore,
        passRate,
        recentActivity,
        questionsByDifficulty,
        categoryStats
    };
}

function renderAdminSidebar(activePage = '') {
    return `
        <aside class="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col">
            <div class="p-6 border-b border-gray-700">
                <h1 class="text-2xl font-bold text-indigo-400">QuizX</h1>
                <p class="text-sm text-gray-400">Admin Panel</p>
            </div>
            
            <nav class="flex-1 p-4">
                <ul class="space-y-2">
                    <li>
                        <a href="admin.html" class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activePage === 'dashboard' ? 'bg-indigo-600' : 'hover:bg-gray-800'}">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            Dashboard
                        </a>
                    </li>
                    <li>
                        <a href="admin.html?page=questions" class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activePage === 'questions' ? 'bg-indigo-600' : 'hover:bg-gray-800'}">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Questions
                        </a>
                    </li>
                    <li>
                        <a href="admin.html?page=categories" class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activePage === 'categories' ? 'bg-indigo-600' : 'hover:bg-gray-800'}">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"></path>
                            </svg>
                            Categories
                        </a>
                    </li>
                    <li>
                        <a href="admin.html?page=users" class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activePage === 'users' ? 'bg-indigo-600' : 'hover:bg-gray-800'}">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                            Users
                        </a>
                    </li>
                </ul>
            </nav>
            
            <div class="p-4 border-t border-gray-700">
                <a href="dashboard.html" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"></path>
                    </svg>
                    Back to User
                </a>
                <button onclick="logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-all text-red-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    `;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
        type === 'success' ? 'bg-emerald-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-indigo-500 text-white'
    }`;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
