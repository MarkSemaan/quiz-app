document.addEventListener('DOMContentLoaded', () => {
    // Pages (divs acting as views)
    const authPage = document.getElementById('auth-page');
    const homePage = document.getElementById('home-page');
    const quizPage = document.getElementById('quiz-page');
    const dashboardPage = document.getElementById('dashboard-page');

    // Auth elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');
    const loginTabBtn = document.getElementById('login-tab-btn');
    const registerTabBtn = document.getElementById('register-tab-btn');

    // Home page elements
    const welcomeMessage = document.getElementById('welcome-message');
    const quizListContainer = document.getElementById('quiz-list');
    const logoutBtn = document.getElementById('logout-btn');
    const dashboardLinkBtn = document.getElementById('dashboard-link-btn');

    // Quiz page elements
    const quizTitle = document.getElementById('quiz-title');
    const questionContainer = document.getElementById('question-container');
    const submitQuizBtn = document.getElementById('submit-quiz-btn');
    const scoreContainer = document.getElementById('score-container');
    const scoreDisplay = document.getElementById('score-display');
    const backToHomeBtn = document.getElementById('back-to-home-btn');

    // Dashboard/Admin elements
    const userScoresTableBody = document.getElementById('user-scores-table').querySelector('tbody');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const adminBackToHomeBtn = document.getElementById('admin-back-to-home-btn');

    // Hardcoded admin credentials
    const ADMIN_EMAIL = 'admin@quiz.com';
    const ADMIN_PASSWORD = 'admin123';

    // Tracking for user and quiz
    let currentUserEmail = null;
    let currentQuizId = null;

    // Get users localStorage
    function getUsers() {
        const usersJson = localStorage.getItem('users');
        return usersJson ? JSON.parse(usersJson) : [];
    }

    // Save users to localStorage
    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Get quizzes from localStorage
    function getQuizzes() {
        const quizzesJson = localStorage.getItem('quizzes');
        return quizzesJson ? JSON.parse(quizzesJson) : [];
    }

    // Save quizzes to localStorage
    function saveQuizzes(quizzes) {
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
    }

    // Get scores from localStorage
    function getScores() {
        const scoresJson = localStorage.getItem('scores');
        return scoresJson ? JSON.parse(scoresJson) : {}; // Return empty object if none
    }

    // Save scores to localStorage
    function saveScores(scores) {
        localStorage.setItem('scores', JSON.stringify(scores));
    }

    // Function to determine which page is visible
    function showPage(pageElement) {
        // Hide all pages first
        authPage.classList.remove('active');
        homePage.classList.remove('active');
        quizPage.classList.remove('active');
        dashboardPage.classList.remove('active');

        // Show the requested page
        pageElement.classList.add('active');
    }

    // Switch between login and register tabs
    function showAuthTab(tabName) {
        const isLogin = (tabName === 'login');

        loginTabBtn.classList.toggle('active', isLogin);
        registerTabBtn.classList.toggle('active', !isLogin);

        loginForm.classList.toggle('active-form', isLogin);
        registerForm.classList.toggle('active-form', !isLogin);

        loginMessage.textContent = '';
        registerMessage.textContent = '';
    }

    // Registration
    function handleRegister(event) {
        event.preventDefault(); // Prevent page from reloading

        const email = registerEmailInput.value.trim(); // Get email, remove whitespace
        const password = registerPasswordInput.value;

        if (!email || !password) {
            registerMessage.textContent = 'Please enter both email and password.';
            return;
        }
        if (password.length < 6) {
            registerMessage.textContent = 'Password must be at least 6 characters.';
            return;
        }

        const users = getUsers();
        const isAdminEmail = (email === ADMIN_EMAIL);
        const emailExists = users.some(user => user.email === email); // Check if email is already registered

        if (isAdminEmail || emailExists) {
            registerMessage.textContent = 'Email already registered.';
            return;
        }

        // Add the new user to localStorage
        users.push({ email: email, password: password });
        saveUsers(users);

        // Sucess, clear form
        registerMessage.textContent = 'Registration successful! You can now log in.';
        registerMessage.classList.add('success'); // Add class for green text (see CSS)
        registerForm.reset(); // Clear the input fields
    }

    // Logins
    function handleLogin(event) {
        event.preventDefault(); // Prevent page reload

        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value;

        if (!email || !password) {
            loginMessage.textContent = 'Please enter both email and password.';
            return;
        }

        // Check if admin
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            currentUserEmail = email;
            loadAdminDashboard();
            showPage(dashboardPage);
            loginForm.reset();
            return;
        }

        // Check if normal user
        const users = getUsers();
        const foundUser = users.find(user => user.email === email && user.password === password);

        if (foundUser) {
            currentUserEmail = email;
            loadHomePage();
            showPage(homePage);
            loginForm.reset();
        } else {
            loginMessage.textContent = 'Invalid email or password.';
        }
    }

    // Logout
    function handleLogout() {
        currentUserEmail = null;
        showPage(authPage);
        // Clear info
        welcomeMessage.textContent = 'Welcome!';
        quizListContainer.innerHTML = '';
        userScoresTableBody.innerHTML = '';
    }

    // Loading the home page
    function loadHomePage() {
        if (!currentUserEmail) return;

        welcomeMessage.textContent = `Welcome, ${currentUserEmail}!`;

        dashboardLinkBtn.style.display = (currentUserEmail === ADMIN_EMAIL) ? 'inline-block' : 'none';

        // Load available quizzes
        const quizzes = getQuizzes();
        quizListContainer.innerHTML = ''; // Clear previous list

        if (quizzes.length === 0) {
            quizListContainer.innerHTML = '<p>No quizzes available right now.</p>';
            return;
        }

        quizzes.forEach(quiz => {
            const quizButton = document.createElement('button');
            quizButton.textContent = quiz.title;
            quizButton.setAttribute('data-quiz-id', quiz.id); // Store quiz ID on the button
            quizButton.addEventListener('click', () => {
                startQuiz(quiz.id); // Call startQuiz when button is clicked
            });
            quizListContainer.appendChild(quizButton);
        });
    }

    // Loading a quiz based on the quiz Id selected
    function startQuiz(quizId) {
        const quizzes = getQuizzes();
        const quizData = quizzes.find(q => q.id === quizId); // Find the quiz by its ID

        if (!quizData) {
            alert('Error: Could not find the quiz!');
            return;
        }

        currentQuizId = quizId; //sets current quiz

        quizTitle.textContent = quizData.title;
        questionContainer.innerHTML = ''; //
        scoreContainer.style.display = 'none';
        submitQuizBtn.style.display = 'block';

        // Create HTML for each question
        quizData.questions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question');

            // Question Text
            const questionP = document.createElement('p');
            questionP.textContent = `${index + 1}. ${q.questionText}`;
            questionDiv.appendChild(questionP);

            // Radio buttons
            const optionsDiv = document.createElement('div');
            optionsDiv.classList.add('options');

            q.options.forEach((optionText, optionIndex) => {
                const label = document.createElement('label');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `question-${index}`;
                radio.value = optionIndex;

                label.appendChild(radio);
                label.appendChild(document.createTextNode(` ${optionText}`));
                optionsDiv.appendChild(label);
            });

            questionDiv.appendChild(optionsDiv);
            questionContainer.appendChild(questionDiv);
        });

        showPage(quizPage);
    }

    // Sumbitting the quiz
    function handleSubmitQuiz() {
        if (!currentQuizId || !currentUserEmail) return;

        const quizzes = getQuizzes();
        const quizData = quizzes.find(q => q.id === currentQuizId);
        if (!quizData) return; // Quiz data not found

        let score = 0;
        let allAnswered = true;

        // Looping through questions to find correct answers
        quizData.questions.forEach((q, index) => {
            // Find the selected radio button for this question
            const selectedOptionInput = questionContainer.querySelector(`input[name="question-${index}"]:checked`);

            if (selectedOptionInput) {
                const selectedAnswerIndex = parseInt(selectedOptionInput.value);
                if (selectedAnswerIndex === q.correctAnswerIndex) {
                    score++;
                }
            } else {
                allAnswered = false;
            }
        });

        // Check if all questions were answered
        if (!allAnswered) {
            alert('Please answer all questions before submitting.');
            return;
        }

        // Calculate percentage
        const totalQuestions = quizData.questions.length;
        const percentage = Math.round((score / totalQuestions) * 100);

        scoreDisplay.textContent = `${percentage}% (${score} out of ${totalQuestions})`;
        scoreContainer.style.display = 'block';
        submitQuizBtn.style.display = 'none';

        // Save score to localStorage
        const scores = getScores();
        if (!scores[currentUserEmail]) {
            scores[currentUserEmail] = {}; // If email is not listed, add email to scoreboard
        }
        scores[currentUserEmail][currentQuizId] = percentage; // Save score percentage for this quiz
        saveScores(scores); // Save updated scores back to localStorage
    }

    // Load dashboard
    function loadAdminDashboard() {
        if (currentUserEmail !== ADMIN_EMAIL) {
            alert("Access Denied!");
            handleLogout(); // Log out non-admins
            return;
        }

        const users = getUsers(); // Get non-admin users
        const scores = getScores(); // Get all saved scores

        userScoresTableBody.innerHTML = '';

        //  Look through non-admin users and display their scores
        users.forEach(user => {
            const row = userScoresTableBody.insertRow();

            const emailCell = row.insertCell();
            emailCell.textContent = user.email;

            const scoresCell = row.insertCell();
            const userScores = scores[user.email]; // Get this user's scores

            if (userScores && Object.keys(userScores).length > 0) {
                scoresCell.textContent = Object.entries(userScores)
                    .map(([quizId, score]) => `${quizId}: ${score}%`)
                    .join('; ');
            } else {
                scoresCell.textContent = 'No scores yet.';
            }
        });
    }


    // Adding the quizzes
    function addQuizes() {
        const existingQuizzes = getQuizzes();
        if (existingQuizzes.length === 0) {
            console.log("No quizzes found. Adding quizzes.");
            const sampleQuizzes = [
                {
                    id: 'js-basics',
                    title: 'JavaScript Basics Quiz',
                    questions: [
                        { questionText: 'What keyword declares a block-scoped variable?', options: ['var', 'let', 'const', 'def'], correctAnswerIndex: 1 },
                        { questionText: 'Which is NOT a primitive data type in JS?', options: ['string', 'number', 'object', 'boolean'], correctAnswerIndex: 2 },
                        { questionText: 'How do you write a single-line comment?', options: ['// comment', '/* comment */', '# comment', '<!-- comment -->'], correctAnswerIndex: 0 }
                    ]
                },
                {
                    id: 'html-intro',
                    title: 'HTML Introduction Quiz',
                    questions: [
                        { questionText: 'What does HTML stand for?', options: ['Hyper Tool Markup Language', 'Hyper Text Makeup Language', 'Hyper Text Markup Language', 'High Tech Modern Language'], correctAnswerIndex: 2 },
                        { questionText: 'Which tag defines the document\'s body?', options: ['<head>', '<title>', '<body>', '<meta>'], correctAnswerIndex: 2 },
                        { questionText: 'What tag creates a hyperlink?', options: ['<link>', '<href>', '<a>', '<p>'], correctAnswerIndex: 2 }
                    ]
                }
            ];
            saveQuizzes(sampleQuizzes); // Save to localStorage
        }
    }
    // Authentication Tabs
    loginTabBtn.addEventListener('click', () => showAuthTab('login'));
    registerTabBtn.addEventListener('click', () => showAuthTab('register'));

    // Authentication Forms
    registerForm.addEventListener('submit', handleRegister);
    loginForm.addEventListener('submit', handleLogin);

    // Logout Buttons
    logoutBtn.addEventListener('click', handleLogout);
    adminLogoutBtn.addEventListener('click', handleLogout);

    // Navigation Buttons
    dashboardLinkBtn.addEventListener('click', () => {
        loadAdminDashboard();
        showPage(dashboardPage);
    });
    backToHomeBtn.addEventListener('click', () => {
        loadHomePage();
        showPage(homePage);
    });
    adminBackToHomeBtn.addEventListener('click', () => {
        loadHomePage();
        showPage(homePage);
    });

    // Quiz Submission
    submitQuizBtn.addEventListener('click', handleSubmitQuiz);

    addQuizes();
    showPage(authPage);
    showAuthTab('login');

});