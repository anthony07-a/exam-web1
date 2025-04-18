function initPetals() {
    // Injection du style
    const style = document.createElement('style');
    style.textContent = `
        .petal {
            position: fixed;
            width: 12px;
            height: 12px;
            top: 0;
            background: linear-gradient(135deg, #ffb7c5 0%, #ff8fab 100%);
            border-radius: 80% 0 80% 0;
            transform: rotate(45deg);
            pointer-events: none;
            z-index: 999;
            opacity: 0.9;
            filter: drop-shadow(0 0 2px rgba(255,183,197,0.5));
        }
        @keyframes petal-fall {
            0% { transform: translate(0, -10px) rotate(45deg) scale(1); }
            100% { transform: translate(var(--end-x), var(--end-y)) rotate(405deg) scale(0.5); }
        }
    `;
    document.head.appendChild(style);

    function createPetal() {
        const petal = document.createElement('div');
        petal.className = 'petal';
        petal.style.left = Math.random() * window.innerWidth + 'px';
        
        // Animation paramètres
        const duration = Math.random() * 6000 + 5000;
        petal.style.animation = `petal-fall ${duration}ms linear forwards`;
        petal.style.setProperty('--end-x', (Math.random() - 0.5) * 300 + 'px');
        petal.style.setProperty('--end-y', window.innerHeight + 100 + 'px');
        
        // Variations aléatoires
        petal.style.width = `${Math.random() * 8 + 8}px`;
        petal.style.height = `${Math.random() * 8 + 8}px`;
        petal.style.opacity = Math.random() * 0.6 + 0.4;
        
        document.body.appendChild(petal);
        setTimeout(() => petal.remove(), duration);
    }

    // Densité contrôlée
    setInterval(createPetal, 250);
    for (let i = 0; i < 15; i++) setTimeout(createPetal, i * 200);
}

document.addEventListener('DOMContentLoaded', initPetals);



















let startTime = null, previousEndTime = null;
let currentWordIndex = 0;
const wordsToType = [];

const modeSelect = document.getElementById("mode");
const wordDisplay = document.getElementById("word-display");
const inputField = document.getElementById("input-field");
const results = document.getElementById("results");
const explosionContainer = document.querySelector('.explosion-container');

const words = {
    easy: ["apple", "banana", "grape", "orange", "cherry"],
    medium: ["keyboard", "monitor", "printer", "charger", "battery"],
    hard: ["synchronize", "complicated", "development", "extravagant", "misconception"]
};

// Generate a random word from the selected mode
const getRandomWord = (mode) => {
    const wordList = words[mode];
    return wordList[Math.floor(Math.random() * wordList.length)];
};

// Initialize the typing test
const startTest = (wordCount = 5) => {
    wordsToType.length = 0; // Clear previous words
    wordDisplay.innerHTML = ""; // Clear display
    currentWordIndex = 0;
    startTime = null;
    previousEndTime = null;

    for (let i = 0; i < wordCount; i++) {
        wordsToType.push(getRandomWord(modeSelect.value));
    }

    wordsToType.forEach((word, index) => {
        const span = document.createElement("span");
        span.textContent = word + " ";
        if (index === 0) span.style.color = "pink"; // Highlight first word
        wordDisplay.appendChild(span);
    });

    inputField.value = "";
    results.textContent = "";
};

// Start the timer when user begins typing
const startTimer = () => {
    if (!startTime) startTime = Date.now();
};

// Calculate and return WPM & accuracy
const getCurrentStats = () => {
    const elapsedTime = (Date.now() - previousEndTime) / 1000; // Seconds
    const wpm = (wordsToType[currentWordIndex].length / 5) / (elapsedTime / 60); // 5 chars = 1 word
    const accuracy = (wordsToType[currentWordIndex].length / inputField.value.length) * 100;

    return { wpm: wpm.toFixed(2), accuracy: accuracy.toFixed(2) };
};

// Create explosion effect
const createExplosion = (wordElement) => {
    const particles = [];
    const rect = wordElement.getBoundingClientRect();
    const wordCenterX = rect.left + rect.width / 2;
    const wordCenterY = rect.top + rect.height / 2;

    for (let i = 0; i < wordElement.textContent.length * 5; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.width = '5px';
        particle.style.height = '5px';
        particle.style.position = 'absolute';
        particle.style.top = `${wordCenterY}px`;
        particle.style.left = `${wordCenterX}px`;
        document.body.appendChild(particle);
        particles.push(particle);
    }

    anime({
        targets: particles,
        translateX: () => anime.random(-100, 100),
        translateY: () => anime.random(-100, 100),
        scale: () => anime.random(0.5, 2),
        opacity: 0,
        duration: 1000,
        easing: 'easeOutExpo',
        complete: () => {
            particles.forEach(particle => particle.remove());
        }
    });
};

// Create shake effect
const shakeWord = (wordElement) => {
    anime({
        targets: wordElement,
        translateX: [
            { value: -10, duration: 50 },
            { value: 10, duration: 50 },
            { value: -10, duration: 50 },
            { value: 10, duration: 50 },
            { value: 0, duration: 50 }
        ],
        easing: 'easeInOutSine',
        complete: () => {
            wordElement.style.display = 'none';
        }
    });
};

// Move to the next word and update stats only on spacebar press
const updateWord = (event) => {
    if (event.key === " ") { // Check if spacebar is pressed
        if (inputField.value.trim() === wordsToType[currentWordIndex]) {
            if (!previousEndTime) previousEndTime = startTime;

            const { wpm, accuracy } = getCurrentStats();
            results.textContent = `WPM: ${wpm}, Accuracy: ${accuracy}%`;

            const wordElements = wordDisplay.children;
            const currentWordElement = wordElements[currentWordIndex];
            createExplosion(currentWordElement); // Add explosion effect
            shakeWord(currentWordElement); // Add shake effect

            currentWordIndex++;
            previousEndTime = Date.now();
            highlightNextWord();

            inputField.value = ""; // Clear input field after space
            event.preventDefault(); // Prevent adding extra spaces
        }
    }
};

// Highlight the current word in red
const highlightNextWord = () => {
    const wordElements = wordDisplay.children;

    if (currentWordIndex < wordElements.length) {
        if (currentWordIndex > 0) {
            wordElements[currentWordIndex - 1].style.color = "black";
        }
        wordElements[currentWordIndex].style.color = "pink";
    }
};

// Event listeners
inputField.addEventListener("keydown", (event) => {
    startTimer();
    updateWord(event);
});
modeSelect.addEventListener("change", () => startTest());

// Start the test
startTest();
