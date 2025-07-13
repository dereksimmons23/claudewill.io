// Kabir Basketball Training App - Complete JavaScript

const PASSWORD = 'sinmiedo';
let data = {
    right: 0,
    left: 0,
    threes: 0,
    fts: 0,
    time: 0,
    date: new Date().toDateString(),
    memories: [],
    sessions: []
};

// -------------------- Auth --------------------
function login() {
    const password = document.getElementById('passwordInput').value;
    if (password === PASSWORD) {
        localStorage.setItem('kabir-logged-in', 'true');
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').style.display = 'block';
        loadData();
    } else {
        alert('Incorrect password! 🔒');
        document.getElementById('passwordInput').value = '';
    }
}

// -------------------- Data Management --------------------
function loadData() {
    const saved = localStorage.getItem('kabir-training-data');
    if (saved) {
        data = JSON.parse(saved);
        updateDisplays();
        loadMemories();
        updateProgress();
    }
}

function saveData() {
    localStorage.setItem('kabir-training-data', JSON.stringify(data));
}

// -------------------- Score Updates --------------------
function updateScore(type, change) {
    const input = document.getElementById(type + 'Score');
    let currentValue = parseInt(input.value) || 0;
    
    if (change !== 0) {
        currentValue += change;
        currentValue = Math.max(0, currentValue);
        
        // Set max values
        const maxValues = { right: 50, left: 50, threes: 30, fts: 25, time: 120 };
        if (maxValues[type]) {
            currentValue = Math.min(currentValue, maxValues[type]);
        }
        
        input.value = currentValue;
    }
    
    data[type] = currentValue;
    updateDisplays();
    saveData();
}

function updateDisplays() {
    // Update display numbers
    document.getElementById('displayRight').textContent = data.right;
    document.getElementById('displayLeft').textContent = data.left;
    document.getElementById('display3s').textContent = data.threes;
    document.getElementById('displayFTs').textContent = data.fts;
    
    // Update progress bars
    updateProgressBar('rightProgress', data.right, 50);
    updateProgressBar('leftProgress', data.left, 50);
    updateProgressBar('threesProgress', data.threes, 30);
    updateProgressBar('ftsProgress', data.fts, 25);
    
    // Update input values
    document.getElementById('rightScore').value = data.right;
    document.getElementById('leftScore').value = data.left;
    document.getElementById('threesScore').value = data.threes;
    document.getElementById('ftsScore').value = data.fts;
    document.getElementById('timeScore').value = data.time;
}

function updateProgressBar(id, current, max) {
    const percentage = (current / max) * 100;
    document.getElementById(id).style.width = percentage + '%';
}

// -------------------- Tab Navigation --------------------
function showTab(event, tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.remove('hidden');
    
    // Add active class to clicked tab
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Fallback for programmatic calls
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }
}

// -------------------- Memory System --------------------
function saveMemory() {
    const input = document.getElementById('memoryInput');
    const text = input.value.trim();
    
    if (text) {
        const memory = {
            text: text,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
        };
        
        data.memories.unshift(memory);
        input.value = '';
        saveData();
        loadMemories();
    }
}

function loadMemories() {
    const container = document.getElementById('memoryList');
    container.innerHTML = '';
    
    data.memories.forEach(memory => {
        const div = document.createElement('div');
        div.className = 'memory-item';
        div.innerHTML = `
            <div class="memory-date">${memory.date}</div>
            <div>${memory.text}</div>
        `;
        container.appendChild(div);
    });
}

// -------------------- Coach D System --------------------
function askCoachD(question) {
    const questionText = question || document.getElementById('coachQuestion').value.trim();
    
    if (!questionText) {
        alert('Please ask a question first!');
        return;
    }
    
    const responses = getCoachResponse(questionText);
    
    document.getElementById('coachText').innerHTML = responses;
    document.getElementById('coachResponse').style.display = 'block';
    
    if (!question) {
        document.getElementById('coachQuestion').value = '';
    }
}

function getCoachResponse(question) {
    const lowerQ = question.toLowerCase();
    
    if (lowerQ.includes('left hand') || lowerQ.includes('left')) {
        return `<strong>Left Hand Mastery:</strong><br>
        • Start close to the basket - 3 feet out<br>
        • Use your right hand to guide, left hand to finish<br>
        • "Slow is smooth, smooth is fast" - build the muscle memory<br>
        • Focus on high arc and soft touch<br>
        • Practice 10 makes in a row before moving back<br><br>
        <em>Remember: Your left hand is your secret weapon! Most players can't guard it.</em>`;
    }
    
    if (lowerQ.includes('miss') || lowerQ.includes('frustrat')) {
        return `<strong>Missing Shots Mental Reset:</strong><br>
        • "Next shot goes in. Always." - that's your mantra<br>
        • Take 3 deep breaths and reset your feet<br>
        • Check your fundamentals: balance, follow-through, arc<br>
        • Sometimes you need to move closer and rebuild confidence<br>
        • Great shooters have short memories - forget the misses<br><br>
        <em>Champions are made in moments like this. This is your test!</em>`;
    }
    
    if (lowerQ.includes('one leg') || lowerQ.includes('awkward')) {
        return `<strong>One-Leg Shooting Form:</strong><br>
        • Start with both feet, then lift your off-leg as you shoot<br>
        • Keep your shooting shoulder square to the basket<br>
        • Use your core for balance - engage those abs<br>
        • Follow through like you're reaching into a cookie jar<br>
        • Practice makes permanent - rep it until it feels natural<br><br>
        <em>This shot makes you unguardable - they can't contest when you're moving!</em>`;
    }
    
    if (lowerQ.includes('alone') || lowerQ.includes('solo') || lowerQ.includes('tough')) {
        return `<strong>Solo Training Toughness:</strong><br>
        • "Champions are made when no one is watching"<br>
        • Set mini-goals: 5 makes, then 10, then 15<br>
        • Talk to yourself like a coach - be your own motivator<br>
        • Play music that pumps you up<br>
        • Imagine you're in a game situation - crowd noise, pressure<br>
        • Track your progress - small wins add up to big victories<br><br>
        <em>This is where legends are born. You vs. You. Sin Miedo!</em>`;
    }
    
    if (lowerQ.includes('tired') || lowerQ.includes('energy')) {
        return `<strong>Training When Tired:</strong><br>
        • "Training tired is like preparing for the fourth quarter"<br>
        • Focus on perfect form over speed<br>
        • Take water breaks but don't quit<br>
        • Use your voice - yell "YES!" after every make<br>
        • Remember your India goals - they're worth the discomfort<br><br>
        <em>Energy flows from your voice. When you're loud, you're alive!</em>`;
    }
    
    // Default response
    return `<strong>Coach D's Universal Truth:</strong><br>
    • "Aim small, miss small" - pick a specific target<br>
    • "High and soft - three basketballs fit through the rim"<br>
    • "Your inner voice is your champion of success"<br>
    • "Slow is smooth, smooth is fast"<br>
    • "Next shot goes in. Always."<br><br>
    <em>Keep grinding, Kabir. Every rep gets you closer to your India goals! 🏀</em>`;
}

// -------------------- Progress Tracking --------------------
function updateProgress() {
    const sessions = data.sessions || [];
    
    // Calculate totals
    const totalSessions = sessions.length;
    const bestRight = Math.max(...sessions.map(s => s.right || 0), data.right || 0);
    const bestLeft = Math.max(...sessions.map(s => s.left || 0), data.left || 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.time || 0), 0) + (data.time || 0);
    
    // Update progress display
    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('bestRight').textContent = bestRight;
    document.getElementById('bestLeft').textContent = bestLeft;
    document.getElementById('totalMinutes').textContent = totalMinutes;
    
    // Update goal progress bars
    updateProgressBar('rightGoal', bestRight, 50);
    updateProgressBar('leftGoal', bestLeft, 45);
}

function finishSession() {
    if (data.right > 0 || data.left > 0 || data.threes > 0 || data.fts > 0 || data.time > 0) {
        const session = {
            date: new Date().toDateString(),
            right: data.right,
            left: data.left,
            threes: data.threes,
            fts: data.fts,
            time: data.time,
            timestamp: Date.now()
        };
        
        data.sessions.push(session);
        
        // Reset current session
        data.right = 0;
        data.left = 0;
        data.threes = 0;
        data.fts = 0;
        data.time = 0;
        
        updateDisplays();
        updateProgress();
        saveData();
        
        alert('Session saved! Great work today! 🏀');
    }
}

// -------------------- Initialization --------------------
window.addEventListener('load', function() {
    const isLoggedIn = localStorage.getItem('kabir-logged-in');
    
    if (isLoggedIn) {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').style.display = 'block';
        loadData();
    }
    
    // Set up event listeners
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('passwordInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
    
    // Add finish session button (we can add this to the HTML later)
    // For now, sessions auto-save when data changes
});