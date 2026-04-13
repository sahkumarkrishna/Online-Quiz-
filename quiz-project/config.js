const MONGODB_CONFIG = {
    DATABASE: 'quizx',
    LOCAL_URL: 'mongodb://localhost:27017/quiz',
    COLLECTIONS: {
        USERS: 'users',
        CATEGORIES: 'categories',
        QUESTIONS: 'questions',
        ATTEMPTS: 'attempts',
        LEADERBOARD: 'leaderboard'
    }
};

const ADMIN_USER = {
    id: 'admin_1',
    name: 'Admin',
    email: 'kumarkrishna9801552@gmail.com',
    password: 'krishna@123',
    role: 'admin',
    createdAt: new Date().toISOString(),
    isActive: true
};

const DEFAULT_CATEGORIES = [
    {
        id: 'cat_1',
        name: 'Programming',
        description: 'Test your coding knowledge',
        icon: 'fa-code',
        color: '#6366F1',
        isActive: true
    },
    {
        id: 'cat_2',
        name: 'Science',
        description: 'Physics, Chemistry, Biology',
        icon: 'fa-flask',
        color: '#10B981',
        isActive: true
    },
    {
        id: 'cat_3',
        name: 'History',
        description: 'World history and events',
        icon: 'fa-landmark',
        color: '#F59E0B',
        isActive: true
    },
    {
        id: 'cat_4',
        name: 'General Knowledge',
        description: 'Random interesting facts',
        icon: 'fa-lightbulb',
        color: '#8B5CF6',
        isActive: true
    }
];

const DEFAULT_QUESTIONS = [
    { id: 'q_1', categoryId: 'cat_1', text: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], correctAnswer: 0, difficulty: 'easy', points: 1, isActive: true },
    { id: 'q_2', categoryId: 'cat_1', text: 'Which language is used for styling web pages?', options: ['HTML', 'CSS', 'Python', 'Java'], correctAnswer: 1, difficulty: 'easy', points: 1, isActive: true },
    { id: 'q_3', categoryId: 'cat_1', text: 'What is the output of console.log(typeof null)?', options: ['null', 'undefined', 'object', 'error'], correctAnswer: 2, difficulty: 'medium', points: 2, isActive: true },
    { id: 'q_4', categoryId: 'cat_1', text: 'Which of these is NOT a JavaScript framework?', options: ['React', 'Angular', 'Vue', 'Django'], correctAnswer: 3, difficulty: 'easy', points: 1, isActive: true },
    { id: 'q_5', categoryId: 'cat_1', text: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 1, difficulty: 'hard', points: 3, isActive: true },
    { id: 'q_6', categoryId: 'cat_2', text: 'What is the chemical symbol for water?', options: ['H2O', 'CO2', 'NaCl', 'O2'], correctAnswer: 0, difficulty: 'easy', points: 1, isActive: true },
    { id: 'q_7', categoryId: 'cat_2', text: 'What planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correctAnswer: 2, difficulty: 'easy', points: 1, isActive: true },
    { id: 'q_8', categoryId: 'cat_2', text: 'What is the speed of light in vacuum?', options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '1,000,000 km/s'], correctAnswer: 0, difficulty: 'medium', points: 2, isActive: true },
    { id: 'q_9', categoryId: 'cat_2', text: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Body'], correctAnswer: 2, difficulty: 'easy', points: 1, isActive: true },
    { id: 'q_10', categoryId: 'cat_2', text: 'What is the atomic number of Carbon?', options: ['4', '6', '8', '12'], correctAnswer: 1, difficulty: 'medium', points: 2, isActive: true },
    { id: 'q_11', categoryId: 'cat_3', text: 'In which year did World War II end?', options: ['1943', '1944', '1945', '1946'], correctAnswer: 2, difficulty: 'easy', points: 1, isActive: true },
    { id: 'q_12', categoryId: 'cat_3', text: 'Who was the first President of the United States?', options: ['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams'], correctAnswer: 1, difficulty: 'easy', points: 1, isActive: true },
    { id: 'q_13', categoryId: 'cat_3', text: 'The Great Wall of China was primarily built during which dynasty?', options: ['Tang', 'Ming', 'Qin', 'Han'], correctAnswer: 1, difficulty: 'medium', points: 2, isActive: true },
    { id: 'q_14', categoryId: 'cat_3', text: 'Which empire was ruled by Julius Caesar?', options: ['Greek', 'Roman', 'Ottoman', 'Persian'], correctAnswer: 1, difficulty: 'easy', points: 1, isActive: true },
    { id: 'q_15', categoryId: 'cat_3', text: 'In which year did India gain independence?', options: ['1945', '1946', '1947', '1948'], correctAnswer: 2, difficulty: 'easy', points: 1, isActive: true },
    { id: 'q_16', categoryId: 'cat_4', text: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctAnswer: 3, difficulty: 'easy', points: 1, isActive: true },
    { id: 'q_17', categoryId: 'cat_4', text: 'How many continents are there on Earth?', options: ['5', '6', '7', '8'], correctAnswer: 2, difficulty: 'easy', points: 1, isActive: true },
    { id: 'q_18', categoryId: 'cat_4', text: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correctAnswer: 2, difficulty: 'medium', points: 2, isActive: true },
    { id: 'q_19', categoryId: 'cat_4', text: 'Which element has the chemical symbol "Au"?', options: ['Silver', 'Gold', 'Aluminum', 'Argon'], correctAnswer: 1, difficulty: 'easy', points: 1, isActive: true },
    { id: 'q_20', categoryId: 'cat_4', text: 'What is the smallest country in the world?', options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], correctAnswer: 1, difficulty: 'medium', points: 2, isActive: true }
];

const STORAGE_KEYS = {
    CURRENT_USER: 'quizx_current_user',
    INITIALIZED: 'quizx_initialized'
};
