/* ─────────────────────────────────────────────────────────────
   QuizMaster — Frontend App
   ───────────────────────────────────────────────────────────── */

const socket = io();

const App = (() => {

  // ─── State ───────────────────────────────────────────────────
  let state = {
    role: null,         // 'host' | 'player'
    roomCode: null,
    playerName: null,
    currentQuestion: null,
    totalQuestions: 0,
    questionIndex: 0,
    selectedItem: null,   // item chip currently selected (for assign flow)
    assignments: {},      // { categoryId: [items...] }
    timerInterval: null,
    timerEnd: null,
    submitted: false,
  };

  // ─── Routing / Screen ────────────────────────────────────────
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  // ─── Toast ───────────────────────────────────────────────────
  function toast(msg, type = '') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'show ' + type;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3200);
  }

  // ─── Host: Create Room ───────────────────────────────────────
  function createRoom() {
    const name = document.getElementById('host-name').value.trim();
    if (!name) return toast('Digite seu nome.', 'error');

    socket.emit('host:create', { hostName: name }, (res) => {
      if (res.error) return toast(res.error, 'error');
      state.role = 'host';
      state.roomCode = res.code;
      document.getElementById('lobby-code').textContent = res.code;
      document.getElementById('btn-start').disabled = true;
      document.getElementById('start-hint').textContent = 'Aguardando jogadores...';
      showScreen('screen-host-lobby');
    });
  }

  // ─── Player: Join Room ───────────────────────────────────────
  function joinRoom() {
    const code = document.getElementById('join-code').value.trim().toUpperCase();
    const name = document.getElementById('join-name').value.trim();
    if (!code || code.length < 4) return toast('Digite o código da sala.', 'error');
    if (!name) return toast('Digite seu apelido.', 'error');

    socket.emit('player:join', { code, name }, (res) => {
      if (res.error) return toast(res.error, 'error');
      state.role = 'player';
      state.roomCode = res.code;
      state.playerName = res.name;
      document.getElementById('player-lobby-code').textContent = res.code;
      showScreen('screen-player-lobby');
    });
  }

  // ─── Host: Start Game ────────────────────────────────────────
  function startGame() {
    socket.emit('host:start', {}, (res) => {
      if (res?.error) return toast(res.error, 'error');
    });
  }

  // ─── Host: End question early ─────────────────────────────────
  function endQuestion() {
    socket.emit('host:endQuestion');
  }

  // ─── Host: Next question ──────────────────────────────────────
  function nextQuestion() {
    socket.emit('host:next');
  }

  // ─── Timer ───────────────────────────────────────────────────
  function startTimer(seconds, barId, valueId) {
    clearInterval(state.timerInterval);
    state.timerEnd = Date.now() + seconds * 1000;

    const bar = document.getElementById(barId);
    const val = document.getElementById(valueId);

    function tick() {
      const remaining = Math.max(0, Math.ceil((state.timerEnd - Date.now()) / 1000));
      const pct = (remaining / seconds) * 100;

      if (bar) bar.style.width = pct + '%';
      if (val) {
        val.textContent = remaining;
        val.className = 'timer-value' + (remaining <= 5 ? ' danger' : remaining <= 10 ? ' warning' : '');
      }
      if (bar) bar.className = 'timer-bar' + (remaining <= 10 ? ' warning' : '');

      if (remaining <= 0) { clearInterval(state.timerInterval); return; }
    }

    tick();
    state.timerInterval = setInterval(tick, 500);
  }

  function stopTimer() {
    clearInterval(state.timerInterval);
  }

  // ─── Render Question (Player) ─────────────────────────────────
  function renderQuestion(data) {
    const { question, questionIndex, totalQuestions } = data;
    state.currentQuestion = question;
    state.questionIndex = questionIndex;
    state.totalQuestions = totalQuestions;
    state.assignments = {};
    state.selectedItem = null;
    state.submitted = false;

    // Init empty arrays for each category
    question.categories.forEach(c => { state.assignments[c.id] = []; });

    // Meta
    document.getElementById('q-meta').textContent =
      `Pergunta ${questionIndex + 1} de ${totalQuestions}`;
    document.getElementById('q-title').textContent = question.title;

    // Progress dots
    const dots = document.getElementById('progress-dots');
    dots.innerHTML = '';
    for (let i = 0; i < totalQuestions; i++) {
      const d = document.createElement('div');
      d.className = 'dot' + (i < questionIndex ? ' done' : i === questionIndex ? ' current' : '');
      dots.appendChild(d);
    }

    // Items pool
    renderItemsPool(question.items, []);

    // Categories
    renderCategories(question.categories);

    // Submit button
    document.getElementById('btn-submit').disabled = true;

    // Timer
    startTimer(question.timeLimit, 'timer-bar', 'timer-value');

    showScreen('screen-question');
  }

  function renderItemsPool(allItems, placedItems) {
    const pool = document.getElementById('items-pool');
    pool.innerHTML = '';

    allItems.forEach(item => {
      const placed = placedItems.includes(item);
      const chip = document.createElement('div');
      chip.className = 'item-chip' + (placed ? ' placed' : '');
      chip.textContent = item;
      chip.dataset.item = item;

      if (!placed) {
        chip.addEventListener('click', () => handleItemClick(item, chip));
      }
      pool.appendChild(chip);
    });
  }

  function renderCategories(categories) {
    const grid = document.getElementById('categories-grid');
    grid.innerHTML = '';

    categories.forEach(cat => {
      const zone = document.createElement('div');
      zone.className = 'category-zone';
      zone.style.borderColor = cat.color + '55';
      zone.dataset.catId = cat.id;

      zone.innerHTML = `
        <div class="category-header" style="color:${cat.color}">
          ${cat.label}
          <span class="category-slots" id="slots-${cat.id}">0/${cat.slots}</span>
        </div>
        <div class="category-items" id="cat-items-${cat.id}"></div>
      `;

      // Click on category to assign selected item
      zone.addEventListener('click', (e) => {
        if (state.selectedItem && !e.target.classList.contains('item-chip')) {
          handleCategoryClick(cat);
        }
      });

      grid.appendChild(zone);
    });
  }

  function handleItemClick(item, chipEl) {
    if (state.submitted) return;

    // Check if item is in any category already
    const inCategory = Object.values(state.assignments).flat().includes(item);
    if (inCategory) {
      // Remove from category
      for (const catId of Object.keys(state.assignments)) {
        const idx = state.assignments[catId].indexOf(item);
        if (idx !== -1) {
          state.assignments[catId].splice(idx, 1);
          // Remove chip from category
          const catChip = document.querySelector(`#cat-items-${catId} [data-item="${item}"]`);
          if (catChip) catChip.remove();
          // Update slot count
          updateSlotCount(catId);
          // Re-add to pool as available
          chipEl.classList.remove('placed', 'selected');
          break;
        }
      }
      state.selectedItem = null;
      clearSelection();
      updateSubmitButton();
      return;
    }

    // Select / deselect
    if (state.selectedItem === item) {
      state.selectedItem = null;
      chipEl.classList.remove('selected');
    } else {
      clearSelection();
      state.selectedItem = item;
      chipEl.classList.add('selected');
      toast('Agora clique em uma categoria para classificar', '');
    }
  }

  function handleCategoryClick(cat) {
    if (!state.selectedItem || state.submitted) return;

    const current = state.assignments[cat.id] || [];
    if (current.length >= cat.slots) {
      return toast(`Categoria "${cat.label}" já está cheia!`, 'error');
    }

    const item = state.selectedItem;

    // Add to category
    state.assignments[cat.id].push(item);

    // Mark chip in pool as placed
    const poolChip = document.querySelector(`#items-pool [data-item="${item}"]`);
    if (poolChip) {
      poolChip.classList.remove('selected');
      poolChip.classList.add('placed');
    }

    // Add chip inside category
    const catItems = document.getElementById(`cat-items-${cat.id}`);
    const chip = document.createElement('div');
    chip.className = 'item-chip placed';
    chip.style.borderColor = cat.color;
    chip.style.color = cat.color;
    chip.dataset.item = item;
    chip.textContent = item;
    chip.title = 'Clique no item do pool para remover';
    catItems.appendChild(chip);

    updateSlotCount(cat.id);
    state.selectedItem = null;
    clearSelection();
    updateSubmitButton();
  }

  function updateSlotCount(catId) {
    const q = state.currentQuestion;
    if (!q) return;
    const cat = q.categories.find(c => c.id === catId);
    if (!cat) return;
    const el = document.getElementById(`slots-${catId}`);
    if (el) el.textContent = `${state.assignments[catId].length}/${cat.slots}`;
  }

  function clearSelection() {
    document.querySelectorAll('.item-chip.selected').forEach(c => c.classList.remove('selected'));
  }

  function updateSubmitButton() {
    const totalAssigned = Object.values(state.assignments).flat().length;
    document.getElementById('btn-submit').disabled = totalAssigned === 0;
  }

  // ─── Submit Answer ────────────────────────────────────────────
  function submitAnswer() {
    if (state.submitted) return;
    const q = state.currentQuestion;
    if (!q) return;

    state.submitted = true;
    document.getElementById('btn-submit').disabled = true;
    document.getElementById('btn-submit').textContent = '✓ Resposta Enviada!';

    socket.emit('player:answer', {
      questionId: q.id,
      assignments: state.assignments,
    }, (res) => {
      if (res?.error) {
        state.submitted = false;
        document.getElementById('btn-submit').disabled = false;
        document.getElementById('btn-submit').textContent = '✓ Enviar Resposta';
        return toast(res.error, 'error');
      }
      toast('Resposta enviada! Aguardando...', 'success');
      stopTimer();
    });
  }

  // ─── Render Scoreboard ────────────────────────────────────────
  function renderScoreboard(data) {
    stopTimer();
    const { scores, leaderboard, categoryAnswers, questionId, isLast } = data;

    document.getElementById('scoreboard-subtitle').textContent =
      isLast ? 'Última pergunta!' : 'Placar parcial';

    // My result (players only)
    const myResult = document.getElementById('my-result');
    if (state.role === 'player') {
      const myScore = Object.values(scores).find(s => s.name === state.playerName);
      if (myScore) {
        myResult.style.display = '';
        document.getElementById('my-score-line').textContent =
          `+${myScore.roundPoints} pts | ${myScore.correct}/${myScore.totalSlots} acertos` +
          (myScore.isPerfect ? ' 🏆 Perfeito!' : '');

        // Answer review per category
        const q = state.currentQuestion;
        const review = document.getElementById('answer-review');
        review.innerHTML = '';

        if (q && q.categories) {
          q.categories.forEach(cat => {
            const catResult = myScore.categoryResults[cat.id];
            if (!catResult) return;

            const block = document.createElement('div');
            block.className = 'review-cat';
            block.style.borderColor = cat.color;

            const header = document.createElement('div');
            header.className = 'review-cat-header';
            header.style.color = cat.color;
            header.textContent = cat.label;
            block.appendChild(header);

            const items = document.createElement('div');
            items.className = 'review-items';

            const correctSet = new Set(catResult.correct);
            const chosenSet = new Set(catResult.chosen);

            // Show chosen items (hit or miss)
            catResult.chosen.forEach(item => {
              const chip = document.createElement('span');
              chip.className = 'review-item ' + (correctSet.has(item) ? 'hit' : 'miss');
              chip.textContent = item;
              items.appendChild(chip);
            });

            // Show correct items not chosen
            catResult.correct.forEach(item => {
              if (!chosenSet.has(item)) {
                const chip = document.createElement('span');
                chip.className = 'review-item correct-not-chosen';
                chip.textContent = '+ ' + item;
                items.appendChild(chip);
              }
            });

            block.appendChild(items);
            review.appendChild(block);
          });
        }
      }
    } else {
      myResult.style.display = 'none';
    }

    // Leaderboard
    const lb = document.getElementById('leaderboard');
    lb.innerHTML = '';
    leaderboard.forEach((entry, i) => {
      const scoreData = scores[entry.id];
      const delta = scoreData ? `+${scoreData.roundPoints}` : '';
      lb.innerHTML += `
        <div class="lb-entry" style="animation-delay:${i * 0.06}s">
          <div class="lb-rank">${i + 1}</div>
          <div class="lb-name">${entry.name}</div>
          <div class="lb-delta">${delta}</div>
          <div class="lb-score">${entry.score}</div>
        </div>`;
    });

    // Host controls
    document.getElementById('host-next-wrap').style.display = state.role === 'host' ? '' : 'none';
    document.getElementById('waiting-next').style.display = state.role === 'player' ? '' : 'none';
    if (state.role === 'host') {
      const btn = document.querySelector('#host-next-wrap button');
      btn.textContent = isLast ? '🏆 Ver Ranking Final' : 'Próxima Pergunta →';
    }

    showScreen('screen-scoreboard');
  }

  // ─── Render Final ─────────────────────────────────────────────
  function renderFinal(data) {
    stopTimer();
    const { leaderboard } = data;
    const lb = document.getElementById('final-leaderboard');
    lb.innerHTML = '';
    leaderboard.forEach((entry, i) => {
      const medal = ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;
      lb.innerHTML += `
        <div class="lb-entry" style="animation-delay:${i * 0.08}s">
          <div class="lb-rank">${medal}</div>
          <div class="lb-name">${entry.name}</div>
          <div class="lb-score">${entry.score} pts</div>
        </div>`;
    });
    showScreen('screen-final');
  }

  // ─── Socket Events ────────────────────────────────────────────
  socket.on('room:playerList', (players) => {
    // Update both host and player lobby lists
    const hostList = document.getElementById('lobby-player-list');
    const playerList = document.getElementById('player-lobby-list');
    const count = document.getElementById('lobby-count');

    const html = players.map(p =>
      `<div class="player-chip">${p.name}</div>`
    ).join('');

    if (hostList) hostList.innerHTML = html;
    if (playerList) playerList.innerHTML = html;
    if (count) count.textContent = players.length;

    // Enable start button for host
    if (state.role === 'host') {
      const btn = document.getElementById('btn-start');
      btn.disabled = players.length < 1;
      document.getElementById('start-hint').textContent =
        players.length >= 1 ? `${players.length} jogador(es) pronto(s)!` : 'Aguardando jogadores...';
    }
  });

  socket.on('game:question', (data) => {
    if (state.role === 'host') {
      // Host sees monitoring screen
      state.questionIndex = data.questionIndex;
      state.totalQuestions = data.totalQuestions;
      state.currentQuestion = data.question;
      document.getElementById('host-q-meta').textContent =
        `Pergunta ${data.questionIndex + 1} de ${data.totalQuestions}`;
      document.getElementById('host-q-title').textContent = data.question.title;
      document.getElementById('host-answered').textContent = '0';
      document.getElementById('host-total').textContent = '?';
      startTimer(data.question.timeLimit, 'host-timer-bar', 'host-timer-value');
      showScreen('screen-host-question');
    } else {
      renderQuestion(data);
    }
  });

  socket.on('host:answerProgress', ({ answered, total }) => {
    document.getElementById('host-answered').textContent = answered;
    document.getElementById('host-total').textContent = total;
  });

  socket.on('game:scoreboard', (data) => {
    renderScoreboard(data);
  });

  socket.on('game:finished', (data) => {
    renderFinal(data);
  });

  socket.on('game:hostLeft', () => {
    toast('O host saiu. A sala foi encerrada.', 'error');
    setTimeout(() => location.reload(), 2500);
  });

  socket.on('connect_error', () => {
    toast('Erro de conexão. Tentando reconectar...', 'error');
  });

  // ─── Public API ───────────────────────────────────────────────
  return {
    showScreen,
    createRoom,
    joinRoom,
    startGame,
    endQuestion,
    nextQuestion,
    submitAnswer,
  };

})();

// ─── Enter key support ───────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const active = document.querySelector('.screen.active')?.id;
  if (active === 'screen-host-setup') App.createRoom();
  if (active === 'screen-join') App.joinRoom();
});
