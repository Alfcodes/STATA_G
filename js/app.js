// Main application logic for Stata Command Quest
import {
  supabase,
  signUp,
  signIn,
  signOut,
  createRoom,
  joinRoom,
  updateScore,
  subscribeLeaderboard,
  leaveRoom
} from './supabase.js';
import GameEngine, { generateDataset } from './gameEngine.js';

// DOM elements
const authSection = document.getElementById('auth-section');
const lobbySection = document.getElementById('lobby-section');
const gameSection = document.getElementById('game-section');

const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');
const signupBtn = document.getElementById('signup-btn');
const signinBtn = document.getElementById('signin-btn');
const authStatus = document.getElementById('auth-status');

const userEmailSpan = document.getElementById('user-email');
const modeSelect = document.getElementById('mode-select');
const createRoomBtn = document.getElementById('create-room-btn');
const joinCodeInput = document.getElementById('join-code');
const joinRoomBtn = document.getElementById('join-room-btn');
const lobbyStatus = document.getElementById('lobby-status');
const logoutBtn = document.getElementById('logout-btn');

const roomCodeSpan = document.getElementById('room-code');
const scoreboardDiv = document.getElementById('scoreboard');
const missionDescDiv = document.getElementById('mission-description');
const commandInput = document.getElementById('command-input');
const mcqContainer = document.getElementById('mcq-container');
const checkBtn = document.getElementById('check-btn');
const nextMissionBtn = document.getElementById('next-mission-btn');
const leaveRoomBtn = document.getElementById('leave-room-btn');
const gameStatus = document.getElementById('game-status');

let gameEngine = null;
let currentRoomId = null;
let unsubscribeLeaderboard = null;

function showSection(section) {
  authSection.classList.add('hidden');
  lobbySection.classList.add('hidden');
  gameSection.classList.add('hidden');
  section.classList.remove('hidden');
}

// Authentication handlers
signupBtn.addEventListener('click', async () => {
  authStatus.textContent = '';
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) {
    authStatus.textContent = 'Email and password required.';
    return;
  }
  try {
    const { error } = await signUp(email, password);
    if (error) {
      authStatus.textContent = error.message;
    } else {
      authStatus.textContent = 'Signup successful. Please check your email to confirm.';
    }
  } catch (err) {
    authStatus.textContent = err.message;
  }
});

signinBtn.addEventListener('click', async () => {
  authStatus.textContent = '';
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) {
    authStatus.textContent = 'Email and password required.';
    return;
  }
  try {
    const { error } = await signIn(email, password);
    if (error) {
      authStatus.textContent = error.message;
    } else {
      // Get user and proceed
      userEmailSpan.textContent = email;
      showSection(lobbySection);
    }
  } catch (err) {
    authStatus.textContent = err.message;
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut();
  emailInput.value = '';
  passwordInput.value = '';
  showSection(authSection);
});

// Create room
createRoomBtn.addEventListener('click', async () => {
  lobbyStatus.textContent = '';
  const mode = modeSelect.value;
  try {
    const room = await createRoom(mode);
    currentRoomId = room.id;
    roomCodeSpan.textContent = room.code;
    startGame(mode, room.id);
  } catch (err) {
    lobbyStatus.textContent = err.message;
  }
});

// Join room
joinRoomBtn.addEventListener('click', async () => {
  lobbyStatus.textContent = '';
  const code = joinCodeInput.value.trim().toUpperCase();
  if (!code) {
    lobbyStatus.textContent = 'Enter a room code.';
    return;
  }
  try {
    const room = await joinRoom(code);
    currentRoomId = room.id;
    roomCodeSpan.textContent = room.code;
    startGame(room.mode, room.id);
  } catch (err) {
    lobbyStatus.textContent = err.message;
  }
});

function startGame(mode, roomId) {
  // Initialize game engine
  gameEngine = new GameEngine(mode);
  // Subscribe to leaderboard
  if (unsubscribeLeaderboard) unsubscribeLeaderboard();
  unsubscribeLeaderboard = subscribeLeaderboard(roomId, handleLeaderboardChange);
  // Render initial scoreboard
  fetchAndRenderScoreboard(roomId);
  // Show game UI
  showSection(gameSection);
  missionDescDiv.textContent = '';
  commandInput.value = '';
  commandInput.classList.add('hidden');
  mcqContainer.innerHTML = '';
  mcqContainer.classList.add('hidden');
  gameStatus.textContent = '';
}

// Fetch current leaderboard snapshot (room_players) via supabase
async function fetchAndRenderScoreboard(roomId) {
  const { data, error } = await supabase
    .from('room_players')
    .select('*')
    .eq('room_id', roomId)
    .order('score', { ascending: false });
  if (error) {
    console.error(error);
    return;
  }
  renderScoreboard(data);
}

// Handle realtime leaderboard changes
async function handleLeaderboardChange(payload) {
  // On any change, re-fetch scoreboard for ordering
  if (!currentRoomId) return;
  fetchAndRenderScoreboard(currentRoomId);
}

function renderScoreboard(players) {
  let html = '<table><thead><tr><th>Player</th><th>Score</th></tr></thead><tbody>';
  players.forEach((p) => {
    html += `<tr><td>${p.display_name}</td><td>${p.score}</td></tr>`;
  });
  html += '</tbody></table>';
  scoreboardDiv.innerHTML = html;
}

// Next mission
nextMissionBtn.addEventListener('click', () => {
  gameStatus.textContent = '';
  if (!gameEngine) return;
  const mission = gameEngine.nextMission();
  if (!mission) {
    missionDescDiv.textContent = 'No missions available.';
    return;
  }
  missionDescDiv.textContent = mission.missionText;
  if (mission.type === 'code') {
    commandInput.value = '';
    commandInput.classList.remove('hidden');
    mcqContainer.classList.add('hidden');
  } else if (mission.type === 'mcq') {
    commandInput.classList.add('hidden');
    mcqContainer.innerHTML = '';
    mission.choices.forEach((choice, index) => {
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'mcq-option';
      radio.value = index.toString();
      label.appendChild(radio);
      label.append(` ${choice}`);
      mcqContainer.appendChild(label);
    });
    mcqContainer.classList.remove('hidden');
  }
});

// Check mission answer
checkBtn.addEventListener('click', async () => {
  if (!gameEngine || !gameEngine.currentMission) {
    gameStatus.textContent = 'No mission to check.';
    return;
  }
  let result = false;
  if (gameEngine.currentMission.type === 'code') {
    const commands = commandInput.value || '';
    result = gameEngine.checkAnswer(commands);
  } else if (gameEngine.currentMission.type === 'mcq') {
    const selected = document.querySelector('input[name="mcq-option"]:checked');
    if (!selected) {
      gameStatus.textContent = 'Select an answer.';
      return;
    }
    result = gameEngine.checkAnswer(selected.value);
  }
  if (result) {
    gameStatus.textContent = '✅ Correct!';
  } else {
    gameStatus.textContent = '❌ Try again or move to the next mission.';
  }
  // Update score in Supabase
  try {
    await updateScore(currentRoomId, gameEngine.getScore());
  } catch (err) {
    console.error('Score update failed:', err);
  }
});

leaveRoomBtn.addEventListener('click', async () => {
  if (!currentRoomId) return;
  // leave room players table
  try {
    await leaveRoom(currentRoomId);
  } catch (err) {
    console.error(err);
  }
  if (unsubscribeLeaderboard) unsubscribeLeaderboard();
  currentRoomId = null;
  showSection(lobbySection);
});

// On load, check if already signed in
window.addEventListener('load', async () => {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    // Already logged in
    const { user } = data.session;
    userEmailSpan.textContent = user.email;
    showSection(lobbySection);
  } else {
    showSection(authSection);
  }
});