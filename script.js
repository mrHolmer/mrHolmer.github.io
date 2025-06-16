// DOM Elements
const randomImageEl = document.getElementById('random-image');
const userGuessEl = document.getElementById('user-guess');
const submitBtn = document.getElementById('submit-btn');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const streakEl = document.getElementById('streak');
const departmentSelect = document.getElementById('department-select');
const skipConfirmEl = document.getElementById('skip-confirm');
const skipNameEl = document.getElementById('skip-name');
const skipDeptEl = document.getElementById('skip-dept');
const continueBtn = document.getElementById('continue-btn');


// Game State
let people = [];
let currentPerson = null;
let score = 0;
let streak = 0;
let currentDepartment = 'ALL';


// Format department names with special cases
function formatDepartmentName(dept) {
    if (!dept || typeof dept !== 'string') return '';
    
    const cleanDept = dept.trim().toLowerCase();
    const specialCases = {
        'cte, computer science & engineering': 'CTE, Computer Science & Engineering',
        'english': 'English',
        'science': 'Science',
        'math': 'Math',
        'history': 'History',
        'health and physical science': 'Health & Physical Science',
        'parent and student engagement': 'Parent & Student Engagement',
        'health and safety': 'Health & Safety'
    };
    
    if (specialCases[cleanDept]) {
        return specialCases[cleanDept];
    }
    
    return dept.toLowerCase()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
}

// Initialize the quiz
async function initQuiz() {
    try {
        const response = await fetch('data/people.json');
        if (!response.ok) throw new Error('Failed to load data');
        people = await response.json();
        
        if (!Array.isArray(people)) throw new Error('Invalid data format');
        
        populateDepartmentFilter();
        loadRandomPerson();
        userGuessEl.focus();
    } catch (error) {
        console.error('Initialization error:', error);
        feedbackEl.textContent = 'Failed to load quiz data.';
    }
}

// Populate department dropdown
function populateDepartmentFilter() {
    try {
        const departments = ['ALL', ...new Set(people.map(p => {
            return formatDepartmentName(p.department);
        }))].filter(dept => dept !== '');
        
        departmentSelect.innerHTML = departments
            .map(dept => `<option value="${dept}">${dept}</option>`)
            .join('');
        
        departmentSelect.addEventListener('change', (e) => {
            currentDepartment = e.target.value;
            loadRandomPerson();
        });
    } catch (error) {
        console.error('Department filter error:', error);
    }
}

// Load a random person
function loadRandomPerson() {
    try {
        // Hide answer display when loading new person
        skipConfirmEl.style.display = 'none';
        submitBtn.style.display = 'block';
        userGuessEl.disabled = false;
        
        const filteredPeople = currentDepartment === 'ALL' 
            ? people 
            : people.filter(p => {
                if (!p.department) return false;
                return formatDepartmentName(p.department) === currentDepartment;
            });
        
        if (filteredPeople.length === 0) {
            feedbackEl.textContent = `No teachers found in ${currentDepartment}`;
            randomImageEl.src = '';
            randomImageEl.alt = '';
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * filteredPeople.length);
        currentPerson = filteredPeople[randomIndex];
        
        if (currentPerson?.image) {
            randomImageEl.src = currentPerson.image;
            randomImageEl.onerror = () => {
                randomImageEl.src = '';
                randomImageEl.alt = 'Image failed to load';
            };
            randomImageEl.alt = currentPerson.name || 'Teacher image';
        } else {
            randomImageEl.src = '';
            randomImageEl.alt = 'Image not available';
        }
        
        userGuessEl.value = '';
        feedbackEl.textContent = '';
        feedbackEl.style.color = '#333';
        userGuessEl.disabled = false;
        
        if (document.activeElement === userGuessEl) {
            userGuessEl.blur();
            setTimeout(() => userGuessEl.focus(), 100);
        }
        
        preloadNextImage();
    } catch (error) {
        console.error('Error loading person:', error);
        feedbackEl.textContent = 'Error loading next question';
    }
}

// Show current answer when skipping
function showCurrentAnswer() {
    if (!currentPerson) return;
    
    skipNameEl.textContent = currentPerson.name;
    skipDeptEl.textContent = formatDepartmentName(currentPerson.department);
    skipConfirmEl.style.display = 'block';
    skipBtn.style.display = 'none';
    submitBtn.style.display = 'none';
    userGuessEl.disabled = true;
    feedbackEl.textContent = '⏭ Skipped'; // Only show "Skipped"
    feedbackEl.style.color = '#3498db';
}


// Hide skip confirmation
function hideCurrentAnswer() {
    skipConfirmEl.style.display = 'none';
    skipBtn.style.display = 'block';
    submitBtn.style.display = 'block';
}

// Check user's guess
function checkGuess() {
    try {
        if (!currentPerson) return;
        
        const userGuess = userGuessEl.value.trim().toLowerCase();
        const fullName = currentPerson.name.toLowerCase();
        const variants = currentPerson.variants ? 
            currentPerson.variants.map(v => v.toLowerCase()) : [];
        
        const isCorrect = [fullName, ...variants].some(valid => valid === userGuess) ||
                         fullName.split(/\s+/).some(part => part === userGuess);
        
        const formattedDept = formatDepartmentName(currentPerson.department);

        if (isCorrect) {
            feedbackEl.innerHTML = `✅ Correct! It's <strong>${currentPerson.name}</strong> from <strong>${formattedDept}</strong>.`;
            feedbackEl.style.color = '#2ecc71';
            score++;
            streak++;
            scoreEl.textContent = score;
            streakEl.textContent = streak;
            
            setTimeout(() => {
                feedbackEl.style.color = '#333';
                loadRandomPerson();
            }, 1500);
        } else {
            feedbackEl.textContent = '❌ Incorrect';
            feedbackEl.style.color = '#e74c3c';
            skipNameEl.textContent = currentPerson.name;
            skipDeptEl.textContent = formattedDept;
            skipConfirmEl.style.display = 'block';
            submitBtn.style.display = 'none';
            userGuessEl.disabled = true;
            streak = 0;
            scoreEl.textContent = score;
            streakEl.textContent = streak;
        }
    } catch (error) {
        console.error('Guess check error:', error);
        feedbackEl.textContent = 'Error checking answer';
        feedbackEl.style.color = '#e74c3c';
    }
}




// Supporting function
function showAnswerFeedback() {
    skipNameEl.textContent = currentPerson.name;
    skipDeptEl.textContent = formatDepartmentName(currentPerson.department);
    skipConfirmEl.style.display = 'block';
    submitBtn.style.display = 'none';
    userGuessEl.disabled = true;
    skipBtn.style.display = 'none';
}

function showAnswerFeedback() {
    try {
        if (!currentPerson) return;
        
        // Update the answer display
        skipNameEl.textContent = currentPerson.name;
        skipDeptEl.textContent = formatDepartmentName(currentPerson.department);
        
        // Set up the UI state
        skipConfirmEl.style.display = 'flex'; // Using flex for better layout
        submitBtn.style.display = 'none';
        userGuessEl.disabled = true;
        skipBtn.style.display = 'none';
        
        // Clear any previous feedback
        feedbackEl.textContent = '';
        
        // If you're using the separate incorrect-feedback element
        const incorrectFeedback = document.querySelector('.incorrect-feedback');
        if (incorrectFeedback) {
            incorrectFeedback.textContent = 'Incorrect!';
            incorrectFeedback.style.color = '#e74c3c';
            incorrectFeedback.style.fontWeight = 'bold';
        }
        
    } catch (error) {
        console.error('Error showing answer feedback:', error);
    }
}


// Preload next image
function preloadNextImage() {
    try {
        if (people.length < 2) return;
        
        const filteredPeople = currentDepartment === 'ALL' 
            ? people 
            : people.filter(p => formatDepartmentName(p.department) === currentDepartment);
        
        const currentIndex = filteredPeople.indexOf(currentPerson);
        const nextIndex = (currentIndex + 1) % filteredPeople.length;
        const nextPerson = filteredPeople[nextIndex];
        
        if (nextPerson?.image) {
            new Image().src = nextPerson.image;
        }
    } catch (error) {
        console.error('Preload error:', error);
    }
}

// Event Listeners


continueBtn.addEventListener('click', () => {
    skipConfirmEl.style.display = 'none';
    submitBtn.style.display = 'block';
    userGuessEl.disabled = false;
    feedbackEl.textContent = '';
    loadRandomPerson();
});


submitBtn.addEventListener('click', checkGuess);
userGuessEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkGuess();
});


// Start the quiz
document.addEventListener('DOMContentLoaded', initQuiz);