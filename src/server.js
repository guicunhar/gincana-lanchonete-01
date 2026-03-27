const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const {
  createRoom,
  joinRoom,
  removePlayer,
  rejoinAsHost,
  getRoomByHost,
  getRoom,
  startNextQuestion,
  submitAnswer,
  calculateScores,
  getLeaderboard,
  getRoomPlayerList,
  GAME_CONFIG,
} = require("./gameLogic");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["websocket", "polling"],
});

app.use(express.static(path.join(__dirname, "../public")));

// ─────────────────────────────────────────────
//  Socket.IO events
// ─────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  // ── HOST: Create room ──────────────────────
  socket.on("host:create", ({ hostName }, cb) => {
    const room = createRoom(socket.id, hostName || "Host");
    socket.join(room.code);
    console.log(`[ROOM] Created ${room.code} by ${hostName}`);
    cb({ ok: true, code: room.code });
  });

  socket.on("host:rejoin", ({ code }, cb) => {
    const result = rejoinAsHost(socket.id, code);
    if (result.error) return cb({ error: result.error });
    socket.join(code);
    const room = result.room;
    cb({
      ok: true,
      code,
      status: room.status,
      playerCount: Object.keys(room.players).length,
    });
    io.to(code).emit("room:playerList", getRoomPlayerList(room));
  });

  // ── HOST: Start game ──────────────────────
  socket.on("host:start", (_, cb) => {
    const room = getRoomByHost(socket.id);
    if (!room) return cb?.({ error: "Sala não encontrada." });
    if (Object.keys(room.players).length < GAME_CONFIG.minPlayers) {
      return cb?.({
        error: `Aguarde pelo menos ${GAME_CONFIG.minPlayers} jogador(es).`,
      });
    }

    advanceToNextQuestion(room);
    cb?.({ ok: true });
  });

  // ── HOST: Force end question ──────────────
  socket.on("host:endQuestion", () => {
    const room = getRoomByHost(socket.id);
    if (!room || room.status !== "question") return;
    clearTimeout(room.timer);
    endQuestion(room);
  });

  // ── HOST: Next question ───────────────────
  socket.on("host:next", () => {
    const room = getRoomByHost(socket.id);
    if (!room || room.status !== "scoreboard") return;
    advanceToNextQuestion(room);
  });

  // ── PLAYER: Join room ─────────────────────
  socket.on("player:join", ({ code, name }, cb) => {
    const result = joinRoom(code, socket.id, name);
    if (result.error) return cb({ error: result.error });

    socket.join(result.room.code);
    socket.data.roomCode = result.room.code;
    socket.data.playerName = name;

    // Notify host and all players of new player list
    io.to(result.room.code).emit(
      "room:playerList",
      getRoomPlayerList(result.room)
    );

    console.log(`[JOIN] ${name} joined ${result.room.code}`);
    cb({ ok: true, code: result.room.code, name });
  });

  // ── PLAYER: Submit answer ─────────────────
  socket.on("player:answer", ({ questionId, assignments }, cb) => {
    const code = socket.data.roomCode;
    if (!code) return cb?.({ error: "Não está em uma sala." });

    const room = getRoom(code);
    if (!room || room.status !== "question")
      return cb?.({ error: "Não há pergunta ativa." });

    const result = submitAnswer(room, socket.id, questionId, assignments);
    if (result?.error) return cb?.({ error: result.error });

    // Tell the player their answer was recorded
    cb?.({ ok: true });

    // Count submissions — if all answered, end early
    const totalPlayers = Object.keys(room.players).length;
    const answered = Object.values(room.players).filter(
      (p) => p.answers[questionId]
    ).length;

    // Notify host of progress
    io.to(room.hostSocketId).emit("host:answerProgress", {
      answered,
      total: totalPlayers,
    });

    if (answered === totalPlayers) {
      clearTimeout(room.timer);
      endQuestion(room);
    }
  });

  // ── Disconnect ────────────────────────────
  socket.on("disconnect", () => {
    console.log(`[-] Disconnected: ${socket.id}`);
    const result = removePlayer(socket.id);
    if (!result) return;

    if (result.type === "host_left") {
      io.to(result.code).emit("game:hostLeft");
      console.log(`[ROOM] Closed ${result.code} — host left`);
    } else {
      io.to(result.code).emit(
        "room:playerList",
        getRoomPlayerList(result.room)
      );
      console.log(`[LEAVE] ${result.name} left ${result.code}`);
    }
  });
});

// ─────────────────────────────────────────────
//  Game flow helpers
// ─────────────────────────────────────────────
function advanceToNextQuestion(room) {
  const question = startNextQuestion(room);

  if (!question) {
    // Game over
    const leaderboard = getLeaderboard(room);
    io.to(room.code).emit("game:finished", { leaderboard });
    console.log(`[GAME] ${room.code} finished`);
    return;
  }

  const questionIndex = room.currentQuestion;
  const totalQuestions = room.questions.length;

  io.to(room.code).emit("game:question", {
    question,
    questionIndex,
    totalQuestions,
  });

  console.log(
    `[Q] ${room.code} question ${questionIndex + 1}/${totalQuestions}`
  );

  // Auto-end after timeLimit
  room.timer = setTimeout(() => {
    if (room.status === "question") endQuestion(room);
  }, question.timeLimit * 1000);
}

function endQuestion(room) {
  room.status = "scoreboard";
  const q = room.questions[room.currentQuestion];
  const scores = calculateScores(room);
  const leaderboard = getLeaderboard(room);

  // Build full category answers for reveal
  const categoryAnswers = {};
  for (const cat of q.categories) {
    categoryAnswers[cat.id] = cat.correct;
  }

  io.to(room.code).emit("game:scoreboard", {
    scores,
    leaderboard,
    categoryAnswers,
    questionId: q.id,
    isLast: room.currentQuestion === room.questions.length - 1,
  });

  console.log(`[SCORE] ${room.code} — scoreboard shown`);
}

// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🎮 GINCANA running at http://localhost:${PORT}\n`);
});
