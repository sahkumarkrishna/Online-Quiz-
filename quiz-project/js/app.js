function initAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 'dashboard';
    showPage(page);
    loadStats();
}

function showPage(pageName) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(pageName + 'Page').classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('bg-indigo-600');
        link.classList.add('hover:bg-gray-800');
    });
    document.querySelector(`[data-page="${pageName}"]`)?.classList.add('bg-indigo-600');
    document.querySelector(`[data-page="${pageName}"]`)?.classList.remove('hover:bg-gray-800');

    if (pageName === 'questions') loadQuestions();
    if (pageName === 'categories') loadCategories();
    if (pageName === 'users') loadUsers();
}

function loadStats() {
    const stats = getAdminStats();
    
    document.getElementById('statUsers').textContent = stats.totalUsers;
    document.getElementById('statQuestions').textContent = stats.totalQuestions;
    document.getElementById('statAttempts').textContent = stats.totalAttempts;
    document.getElementById('statPassRate').textContent = stats.passRate + '%';

    initCharts(stats);
}

function initCharts(stats) {
    const difficultyCtx = document.getElementById('difficultyChart');
    if (difficultyCtx) {
        new Chart(difficultyCtx, {
            type: 'bar',
            data: {
                labels: ['Easy', 'Medium', 'Hard'],
                datasets: [{
                    label: 'Questions',
                    data: [stats.questionsByDifficulty.easy, stats.questionsByDifficulty.medium, stats.questionsByDifficulty.hard],
                    backgroundColor: ['#10B981', '#F59E0B', '#EF4444']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: stats.categoryStats.map(c => c.name),
                datasets: [{
                    data: stats.categoryStats.map(c => c.questionCount),
                    backgroundColor: stats.categoryStats.map(c => c.color)
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
}

function loadQuestions() {
    const categoryFilter = document.getElementById('filterCategory')?.value || '';
    const difficultyFilter = document.getElementById('filterDifficulty')?.value || '';
    
    const categorySelect = document.getElementById('filterCategory');
    const questionCategorySelect = document.getElementById('questionCategory');
    const categories = getCategories();
    
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">All Categories</option>' + 
            categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
        categorySelect.value = categoryFilter;
    }
    
    if (questionCategorySelect) {
        questionCategorySelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
    }

    let questions = getData(STORAGE_KEYS.QUESTIONS) || [];
    questions = questions.filter(q => q.isActive);
    
    if (categoryFilter) questions = questions.filter(q => q.categoryId === categoryFilter);
    if (difficultyFilter) questions = questions.filter(q => q.difficulty === difficultyFilter);

    const tbody = document.getElementById('questionsTable');
    tbody.innerHTML = questions.map(q => {
        const category = getCategoryById(q.categoryId);
        const difficultyColors = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <p class="text-sm text-gray-900 line-clamp-2 max-w-md">${q.text}</p>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center gap-1 text-sm">${category?.icon || '📝'} ${category?.name || 'Unknown'}</span>
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[q.difficulty]}">${q.difficulty}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">${q.points} pts</td>
                <td class="px-6 py-4">
                    <div class="flex gap-2">
                        <button onclick="editQuestion('${q.id}')" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="deleteQuestionConfirm('${q.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openQuestionModal(questionId = null) {
    const modal = document.getElementById('questionModal');
    const title = document.getElementById('questionModalTitle');
    const form = document.getElementById('questionForm');
    
    form.reset();
    document.getElementById('questionId').value = '';
    
    if (questionId) {
        const question = getQuestionById(questionId);
        if (question) {
            title.textContent = 'Edit Question';
            document.getElementById('questionId').value = question.id;
            document.getElementById('questionText').value = question.text;
            document.getElementById('optionA').value = question.options[0];
            document.getElementById('optionB').value = question.options[1];
            document.getElementById('optionC').value = question.options[2];
            document.getElementById('optionD').value = question.options[3];
            document.getElementById('questionCategory').value = question.categoryId;
            document.getElementById('questionDifficulty').value = question.difficulty;
            document.getElementById('correctAnswer').value = question.correctAnswer;
        }
    } else {
        title.textContent = 'Add New Question';
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeQuestionModal() {
    document.getElementById('questionModal').classList.add('hidden');
    document.getElementById('questionModal').classList.remove('flex');
}

function editQuestion(id) {
    openQuestionModal(id);
}

function deleteQuestionConfirm(id) {
    if (confirm('Are you sure you want to delete this question?')) {
        deleteQuestion(id);
        showToast('Question deleted successfully', 'success');
        loadQuestions();
    }
}

document.getElementById('questionForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const questionId = document.getElementById('questionId').value;
    const questionData = {
        text: document.getElementById('questionText').value,
        options: [
            document.getElementById('optionA').value,
            document.getElementById('optionB').value,
            document.getElementById('optionC').value,
            document.getElementById('optionD').value
        ],
        categoryId: document.getElementById('questionCategory').value,
        difficulty: document.getElementById('questionDifficulty').value,
        correctAnswer: parseInt(document.getElementById('correctAnswer').value)
    };
    
    if (questionId) {
        updateQuestion(questionId, questionData);
        showToast('Question updated successfully', 'success');
    } else {
        addQuestion(questionData);
        showToast('Question added successfully', 'success');
    }
    
    closeQuestionModal();
    loadQuestions();
    loadStats();
});

function loadCategories() {
    const categories = getCategories();
    const grid = document.getElementById('categoriesGrid');
    
    grid.innerHTML = categories.map(cat => {
        const questions = getQuestions(cat.id);
        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-6" style="border-top: 4px solid ${cat.color}">
                    <div class="flex items-center gap-4 mb-4">
                        <span class="text-5xl">${cat.icon}</span>
                        <div>
                            <h4 class="font-semibold text-gray-800 text-lg">${cat.name}</h4>
                            <p class="text-sm text-gray-500">${questions.length} questions</p>
                        </div>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">${cat.description}</p>
                    <div class="flex gap-2">
                        <button onclick="editCategory('${cat.id}')" class="flex-1 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">Edit</button>
                        <button onclick="deleteCategoryConfirm('${cat.id}')" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openCategoryModal(categoryId = null) {
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');
    const form = document.getElementById('categoryForm');
    
    form.reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryColor').value = '#6366F1';
    
    if (categoryId) {
        const category = getCategoryById(categoryId);
        if (category) {
            title.textContent = 'Edit Category';
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryDesc').value = category.description;
            document.getElementById('categoryIcon').value = category.icon;
            document.getElementById('categoryColor').value = category.color;
        }
    } else {
        title.textContent = 'Add New Category';
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.add('hidden');
    document.getElementById('categoryModal').classList.remove('flex');
}

function editCategory(id) {
    openCategoryModal(id);
}

function deleteCategoryConfirm(id) {
    if (confirm('Are you sure you want to delete this category? All questions in this category will also be deleted.')) {
        const questions = getData(STORAGE_KEYS.QUESTIONS) || [];
        questions.forEach(q => {
            if (q.categoryId === id) q.isActive = false;
        });
        setData(STORAGE_KEYS.QUESTIONS, questions);
        deleteCategory(id);
        showToast('Category deleted successfully', 'success');
        loadCategories();
        loadStats();
    }
}

document.getElementById('categoryForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const categoryId = document.getElementById('categoryId').value;
    const categoryData = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDesc').value,
        icon: document.getElementById('categoryIcon').value,
        color: document.getElementById('categoryColor').value
    };
    
    if (categoryId) {
        updateCategory(categoryId, categoryData);
        showToast('Category updated successfully', 'success');
    } else {
        addCategory(categoryData);
        showToast('Category added successfully', 'success');
    }
    
    closeCategoryModal();
    loadCategories();
    loadStats();
});

function loadUsers() {
    const users = getAllUsers().filter(u => u.role !== 'admin');
    const tbody = document.getElementById('usersTable');
    
    tbody.innerHTML = users.map(user => {
        const attempts = getUserAttempts(user.id);
        const avgScore = attempts.length > 0 
            ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length) 
            : 0;
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p class="font-medium text-gray-800">${user.name}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">${user.email}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">${user.role}</span>
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">
                        ${user.isActive ? 'Active' : 'Disabled'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <button onclick="toggleUserStatus('${user.id}')" class="text-sm ${user.isActive ? 'text-red-600 hover:text-red-800' : 'text-emerald-600 hover:text-emerald-800'}">
                        ${user.isActive ? 'Disable' : 'Enable'}
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function toggleUserStatus(userId) {
    const users = getAllUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
        updateUser(userId, { isActive: !user.isActive });
        showToast(`User ${user.isActive ? 'disabled' : 'enabled'} successfully`, 'success');
        loadUsers();
    }
}
