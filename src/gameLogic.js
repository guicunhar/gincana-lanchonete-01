const { QUESTIONS, GAME_CONFIG } = require('./gameData');

// Rooms stored in memory: { roomCode: RoomState }
const rooms = {};

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createRoom(hostSocketId, hostName) {
  let code;
  do { code = generateCode(); } while (rooms[code]);

  rooms[code] = {
    code,
    hostSocketId,
    hostName,
    status: 'lobby',       // lobby | question | scoreboard | finished
    players: {},           // socketId -> { name, score, answers }
    currentQuestion: -1,
    questions: shuffle(QUESTIONS).slice(0, 5), // 5 perguntas aleatórias
    timer: null,
    questionStartTime: null,
  };

  return rooms[code];
}

function joinRoom(code, socketId, playerName) {
  const room = rooms[code.toUpperCase()];
  if (!room) return { error: 'Sala não encontrada.' };
  if (room.status !== 'lobby') return { error: 'O jogo já começou.' };
  if (Object.keys(room.players).length >= 30) return { error: 'Sala cheia.' };

  const nameTaken = Object.values(room.players).some(
    p => p.name.toLowerCase() === playerName.toLowerCase()
  );
  if (nameTaken) return { error: 'Nome já em uso nessa sala.' };

  room.players[socketId] = {
    name: playerName,
    score: 0,
    answers: {},   // questionId -> { assignments: {categoryId: [items]} }
  };

  return { room, player: room.players[socketId] };
}

function removePlayer(socketId) {
  for (const code of Object.keys(rooms)) {
    const room = rooms[code];
    if (room.hostSocketId === socketId) {
      // Host left — clean up room
      clearTimeout(room.timer);
      delete rooms[code];
      return { type: 'host_left', code };
    }
    if (room.players[socketId]) {
      const name = room.players[socketId].name;
      delete room.players[socketId];
      return { type: 'player_left', code, name, room };
    }
  }
  return null;
}

function getRoomByHost(socketId) {
  return Object.values(rooms).find(r => r.hostSocketId === socketId);
}

function getRoomByPlayer(socketId) {
  return Object.values(rooms).find(r => r.players[socketId]);
}

function getRoom(code) {
  return rooms[code.toUpperCase()];
}

function getPublicQuestion(q) {
  return {
    id: q.id,
    title: q.title,
    timeLimit: q.timeLimit,
    items: shuffle(q.items),  // shuffle each time so all clients get random order
    categories: q.categories.map(c => ({
      id: c.id,
      label: c.label,
      color: c.color,
      slots: c.slots,
    })),
  };
}

function startNextQuestion(room) {
  room.currentQuestion++;
  if (room.currentQuestion >= room.questions.length) {
    room.status = 'finished';
    return null;
  }
  room.status = 'question';
  room.questionStartTime = Date.now();
  const q = room.questions[room.currentQuestion];
  return getPublicQuestion(q);
}

function submitAnswer(room, socketId, questionId, assignments) {
  // assignments: { categoryId: [item, item, ...], ... }
  const player = room.players[socketId];
  if (!player) return null;

  const q = room.questions[room.currentQuestion];
  if (!q || q.id !== questionId) return null;

  // Prevent duplicate items across categories
  const allChosen = Object.values(assignments).flat();
  const unique = new Set(allChosen);
  if (unique.size !== allChosen.length) return { error: 'Item duplicado.' };

  // Store answer
  player.answers[questionId] = { assignments, submittedAt: Date.now() };

  return { ok: true };
}

function calculateScores(room) {
  const q = room.questions[room.currentQuestion];
  if (!q) return;

  const results = {};

  for (const [socketId, player] of Object.entries(room.players)) {
    const answer = player.answers[q.id];
    const assignments = answer ? answer.assignments : {};

    let correct = 0;
    let total = 0;
    const categoryResults = {};

    for (const cat of q.categories) {
      const chosen = assignments[cat.id] || [];
      const correctSet = new Set(cat.correct);
      let catCorrect = 0;

      for (const item of chosen) {
        total++;
        if (correctSet.has(item)) catCorrect++;
      }

      correct += catCorrect;
      categoryResults[cat.id] = {
        chosen,
        correct: cat.correct,
        hits: catCorrect,
      };
    }

    const totalSlots = q.categories.reduce((s, c) => s + c.slots, 0);
    const roundPoints = correct * GAME_CONFIG.pointsPerCorrectSlot;
    const isPerfect = correct === totalSlots;
    const bonus = isPerfect ? GAME_CONFIG.bonusForPerfect : 0;

    player.score += roundPoints + bonus;

    results[socketId] = {
      name: player.name,
      roundPoints: roundPoints + bonus,
      totalScore: player.score,
      correct,
      totalSlots,
      isPerfect,
      categoryResults,
    };
  }

  return results;
}

function getLeaderboard(room) {
  return Object.entries(room.players)
    .map(([id, p]) => ({ id, name: p.name, score: p.score }))
    .sort((a, b) => b.score - a.score);
}

function getRoomPlayerList(room) {
  return Object.values(room.players).map(p => ({ name: p.name }));
}

module.exports = {
  createRoom, joinRoom, removePlayer,
  getRoomByHost, getRoomByPlayer, getRoom,
  startNextQuestion, submitAnswer,
  calculateScores, getLeaderboard,
  getRoomPlayerList, GAME_CONFIG,
};
