// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getDatabase, ref, set, get, child, push } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDZQL7yNiw9CWhnyY2_HtB-JXZctToD_ng",
    authDomain: "journal-app-f3d32.firebaseapp.com",
    databaseURL: "https://journal-app-f3d32-default-rtdb.firebaseio.com/",
    projectId: "journal-app-f3d32",
    storageBucket: "journal-app-f3d32.firebasestorage.app",
    messagingSenderId: "1071713060128",
    appId: "1:1071713060128:web:9d88c50599e3db0e0a4345",
    measurementId: "G-LP27JD6EJK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Global variables
let currentUser = null;
let currentView = 'notes';

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const menuBtn = document.getElementById('menuBtn');
const dropdown = document.getElementById('dropdown');
const journalInput = document.getElementById('journalInput');
const saveBtn = document.getElementById('saveBtn');
const contentArea = document.getElementById('contentArea');

// Authentication functions
function showLoginPage() {
    loginContainer.style.display = 'flex';
    mainApp.style.display = 'none';
}

function showMainApp() {
    loginContainer.style.display = 'none';
    mainApp.style.display = 'block';
    loadNotesView();
}

// Toggle between login and signup forms
showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
});

// Login functionality
document.getElementById('loginBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showMainApp();
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});

// Signup functionality
document.getElementById('signupBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        showMainApp();
    } catch (error) {
        alert('Signup failed: ' + error.message);
    }
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        showLoginPage();
    } catch (error) {
        alert('Logout failed: ' + error.message);
    }
});

// Menu dropdown functionality
menuBtn.addEventListener('click', () => {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// Menu options functionality
document.getElementById('notesOption').addEventListener('click', () => {
    currentView = 'notes';
    loadNotesView();
    dropdown.style.display = 'none';
});

document.getElementById('chatOption').addEventListener('click', () => {
    currentView = 'chat';
    loadChatView();
    dropdown.style.display = 'none';
});

document.getElementById('overviewOption').addEventListener('click', () => {
    currentView = 'overview';
    loadOverviewView();
    dropdown.style.display = 'none';
});

// Save journal entry
saveBtn.addEventListener('click', async () => {
    if (!currentUser) return;
    
    const content = journalInput.value.trim();
    if (!content) {
        alert('Please write something before saving!');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const userJournalsRef = ref(database, users/${currentUser.uid}/journals/${today});
        await set(userJournalsRef, {
            content: content,
            timestamp: Date.now(),
            date: today
        });
        
        journalInput.value = '';
        alert('Journal entry saved successfully!');
    } catch (error) {
        alert('Failed to save journal: ' + error.message);
    }
});

// Load different views
function loadNotesView() {
    contentArea.innerHTML = `
        <div class="notes-container">
            <h2>Today's Journal</h2>
            <div class="journal-editor">
                <textarea id="journalInput" placeholder="What happened today? Write your thoughts here..."></textarea>
                <button id="saveBtn" class="save-btn">Save Entry</button>
            </div>
        </div>
    `;
    
    // Re-attach event listeners
    const newJournalInput = document.getElementById('journalInput');
    const newSaveBtn = document.getElementById('saveBtn');
    
    newSaveBtn.addEventListener('click', async () => {
        if (!currentUser) return;
        
        const content = newJournalInput.value.trim();
        if (!content) {
            alert('Please write something before saving!');
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        
        try {
            const userJournalsRef = ref(database, users/${currentUser.uid}/journals/${today});
            await set(userJournalsRef, {
                content: content,
                timestamp: Date.now(),
                date: today
            });
            
            newJournalInput.value = '';
            alert('Journal entry saved successfully!');
        } catch (error) {
            alert('Failed to save journal: ' + error.message);
        }
    });
}

function loadChatView() {
    contentArea.innerHTML = `
        <div class="chat-container">
            <h2>AI Chat Companion</h2>
            <div class="chat-messages" id="chatMessages">
                <div class="chat-message ai-message">
                    <p>Hello! I'm here to chat with you. How are you feeling today?</p>
                </div>
            </div>
            <div class="chat-input-container">
                <input type="text" id="chatInput" placeholder="Type your message here..." />
                <button id="sendBtn" class="send-btn">Send</button>
            </div>
        </div>
    `;
    
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user-message';
        userMessageDiv.innerHTML = <p>${message}</p>;
        chatMessages.appendChild(userMessageDiv);
        
        chatInput.value = '';
        
        // Simulate AI response (you can integrate with actual AI API)
        setTimeout(() => {
            const aiResponse = generateAIResponse(message);
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.className = 'chat-message ai-message';
            aiMessageDiv.innerHTML = <p>${aiResponse}</p>;
            chatMessages.appendChild(aiMessageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function generateAIResponse(userMessage) {
        const responses = [
            "That's interesting! Tell me more about how you're feeling.",
            "I understand. It sounds like you've had quite a day.",
            "Thank you for sharing that with me. How did that make you feel?",
            "That's a great perspective. What are you looking forward to tomorrow?",
            "I appreciate you opening up. Is there anything specific on your mind?",
            "It sounds like you're processing a lot. Take your time.",
            "That's completely normal to feel that way. You're doing great by expressing it."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

function loadOverviewView() {
    contentArea.innerHTML = `
        <div class="overview-container">
            <h2>Journal Overview</h2>
            <div class="calendar-container">
                <div id="calendar"></div>
            </div>
            <div id="selectedEntry" class="entry-display">
                <p>Select a date from the calendar to view your journal entry.</p>
            </div>
        </div>
    `;
    
    loadCalendar();
}

async function loadCalendar() {
    const calendar = document.getElementById('calendar');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get journal entries for current month
    let journalDates = [];
    if (currentUser) {
        try {
            const userJournalsRef = ref(database, users/${currentUser.uid}/journals);
            const snapshot = await get(userJournalsRef);
            if (snapshot.exists()) {
                journalDates = Object.keys(snapshot.val());
            }
        } catch (error) {
            console.error('Error loading journal dates:', error);
        }
    }
    
    // Generate calendar
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    let calendarHTML = `
        <div class="calendar-header">
            <h3>${today.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
        </div>
        <div class="calendar-grid">
            <div class="day-header">Sun</div>
            <div class="day-header">Mon</div>
            <div class="day-header">Tue</div>
            <div class="day-header">Wed</div>
            <div class="day-header">Thu</div>
            <div class="day-header">Fri</div>
            <div class="day-header">Sat</div>
    `;
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = ${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')};
        const hasEntry = journalDates.includes(dateString);
        const isToday = day === today.getDate();
        
        calendarHTML += `
            <div class="calendar-day ${hasEntry ? 'has-entry' : ''} ${isToday ? 'today' : ''}" 
                 data-date="${dateString}" onclick="loadJournalEntry('${dateString}')">
                ${day}
                ${hasEntry ? '<div class="entry-dot"></div>' : ''}
            </div>
        `;
    }
    
    calendarHTML += '</div>';
    calendar.innerHTML = calendarHTML;
}

async function loadJournalEntry(date) {
    if (!currentUser) return;
    
    const selectedEntry = document.getElementById('selectedEntry');
    
    try {
        const entryRef = ref(database, users/${currentUser.uid}/journals/${date});
        const snapshot = await get(entryRef);
        
        if (snapshot.exists()) {
            const entry = snapshot.val();
            selectedEntry.innerHTML = `
                <div class="journal-entry">
                    <h3>Journal Entry - ${date}</h3>
                    <p class="entry-content">${entry.content}</p>
                    <p class="entry-timestamp">Saved on: ${new Date(entry.timestamp).toLocaleString()}</p>
                </div>
            `;
        } else {
            selectedEntry.innerHTML = `
                <div class="no-entry">
                    <h3>${date}</h3>
                    <p>No journal entry found for this date.</p>
                </div>
            `;
        }
    } catch (error) {
        selectedEntry.innerHTML = <p>Error loading journal entry: ${error.message}</p>;
    }
}

// Make loadJournalEntry globally accessible
window.loadJournalEntry = loadJournalEntry;

// Auth state observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        showMainApp();
    } else {
        currentUser = null;
        showLoginPage();
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (auth.currentUser) {
        currentUser = auth.currentUser;
        showMainApp();
    } else {
        showLoginPage();
    }
});
