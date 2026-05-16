/* ============================================
   Memory Card Game - 4×4 grid, 8 image pairs
   Mobile-friendly with all 8 images
   ============================================ */

// All 8 unique images (each appears twice = 16 cards total)
const cardImages = [
    'image1.jpg',
    'image2.jpg',
    'image3.jpg',
    'image4.jpg',
    'image5.jpg',
    'image6.jpg',
    'image7.jpg',
    'image8.jpg'
];

// Game state
const gameState = {
    moves: 0,
    matches: 0,
    timer: 0,
    timerInterval: null,
    firstCard: null,
    secondCard: null,
    canFlip: true,
    gameStarted: false,
    totalPairs: 8
};

// DOM Elements
const $ = (id) => document.getElementById(id);
const elements = {
    welcomeScreen: $('welcomeScreen'),
    gameScreen: $('gameScreen'),
    inviteScreen: $('inviteScreen'),
    gameBoard: $('gameBoard'),
    moves: $('moves'),
    timer: $('timer'),
    startButton: $('startButton'),
    muteButton: $('muteButton'),
    muteIcon: $('muteIcon'),
    gameAudio: $('gameAudio'),
    confettiContainer: $('confettiContainer')
};

// Fisher-Yates shuffle
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Show specific screen with smooth fade
function showScreen(screenId) {
    [elements.welcomeScreen, elements.gameScreen, elements.inviteScreen].forEach(s => {
        s.classList.remove('active');
    });
    // Delay the new screen activation slightly so old one starts fading first
    setTimeout(() => $(screenId).classList.add('active'), 200);
}

// Create a card element
function createCard(imageSrc, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.symbol = imageSrc;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-label', `Card ${index + 1}`);
    card.setAttribute('tabindex', '0');

    card.innerHTML = `
        <div class="card-face card-back"></div>
        <div class="card-face card-front">
            <img src="${imageSrc}" alt="Card ${index + 1}" loading="lazy" />
        </div>
    `;
    return card;
}

// Initialize game
function initializeGame() {
    elements.gameBoard.innerHTML = '';
    gameState.moves = 0;
    gameState.matches = 0;
    gameState.firstCard = null;
    gameState.secondCard = null;
    gameState.canFlip = true;
    gameState.gameStarted = false;
    gameState.timer = 0;
    
    elements.moves.textContent = '0';
    elements.timer.textContent = '00:00';
    clearInterval(gameState.timerInterval);

    // 8 images × 2 = 16 cards in 4×4 grid
    const cardPairs = [...cardImages, ...cardImages];
    const shuffled = shuffle(cardPairs);

    shuffled.forEach((image, index) => {
        elements.gameBoard.appendChild(createCard(image, index));
    });
}

// Timer
function startTimer() {
    if (gameState.gameStarted) return;
    gameState.gameStarted = true;
    
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        const mins = Math.floor(gameState.timer / 60);
        const secs = gameState.timer % 60;
        elements.timer.textContent = 
            `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
}

// Flip card
function flipCard(card) {
    if (!gameState.canFlip) return;
    if (card.classList.contains('matched')) return;
    if (card.getAttribute('aria-pressed') === 'true') return;

    startTimer();
    card.setAttribute('aria-pressed', 'true');

    if (!gameState.firstCard) {
        gameState.firstCard = card;
    } else if (card !== gameState.firstCard) {
        gameState.secondCard = card;
        gameState.canFlip = false;
        gameState.moves++;
        elements.moves.textContent = gameState.moves;

        if (gameState.firstCard.dataset.symbol === gameState.secondCard.dataset.symbol) {
            handleMatch();
        } else {
            handleMismatch();
        }
    }
}

function handleMatch() {
    gameState.matches++;
    gameState.firstCard.classList.add('matched');
    gameState.secondCard.classList.add('matched');
    
    const lastCard = gameState.secondCard;
    
    gameState.firstCard = null;
    gameState.secondCard = null;
    gameState.canFlip = true;
    
    if (gameState.matches === gameState.totalPairs) {
        lastCard.classList.add('firecracker');
        clearInterval(gameState.timerInterval);
        // Give the firecracker animation time to complete before transitioning
        setTimeout(() => showInviteScreen(), 1500);
    }
}

function handleMismatch() {
    setTimeout(() => {
        if (gameState.firstCard) gameState.firstCard.setAttribute('aria-pressed', 'false');
        if (gameState.secondCard) gameState.secondCard.setAttribute('aria-pressed', 'false');
        gameState.firstCard = null;
        gameState.secondCard = null;
        gameState.canFlip = true;
    }, 900);
}

// Show invite reveal
function showInviteScreen() {
    showScreen('inviteScreen');
    createConfetti();
}

// Confetti
function createConfetti() {
    const colors = ['#c89855', '#5d6f23', '#f0d989', '#c5dde8', '#a17e1a', '#25D366'];
    elements.confettiContainer.innerHTML = '';
    
    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.width = (8 + Math.random() * 8) + 'px';
        confetti.style.height = confetti.style.width;
        elements.confettiContainer.appendChild(confetti);
    }
}

// Event listeners
elements.startButton.addEventListener('click', () => {
    showScreen('gameScreen');
    elements.gameAudio.play().catch(e => console.log('Audio:', e.message));
});

elements.muteButton.addEventListener('click', () => {
    elements.gameAudio.muted = !elements.gameAudio.muted;
    elements.muteIcon.textContent = elements.gameAudio.muted ? '🔇' : '🔊';
});

elements.gameBoard.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) flipCard(card);
});

elements.gameBoard.addEventListener('keydown', (e) => {
    const card = e.target.closest('.card');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        flipCard(card);
    }
});

// Initialize
showScreen('welcomeScreen');
initializeGame();
