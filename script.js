// Game State
let state = {
  scene: 0, // 0=start, 1=form, 2=greeting, 3=adventure, 4=mini-game, 5=end
  name: '',
  birthdate: '',
  giftsCaught: 0,
  miniGameActive: false
};

const screen = document.getElementById('screen');
const controls = document.getElementById('controls');

// Utility: pastel confetti colors
const confettiColors = ['#f9c3d1', '#ffe7b3', '#a7c7e7', '#cbe2b0', '#e2d1f9'];

function showStartScreen() {
  state.scene = 0;
  screen.innerHTML = `
    <div style="text-align:center;">
      <h2 style="font-size:1.2em; margin-bottom:2rem;">Welcome!</h2>
      <div style="font-size:0.90em; color:#42484f; margin-bottom:2rem;">Game Boy Birthday Wish</div>
      <button class="gb-btn" id="start-btn">Start Game</button>
    </div>
  `;
  controls.innerHTML = '';
  document.getElementById('start-btn').onclick = showFormScreen;
}

function showFormScreen() {
  state.scene = 1;
  screen.innerHTML = `
    <div style="text-align:center;">
      <label for="name">What's your name?</label>
      <input id="name" type="text" maxlength="16" autocomplete="off" placeholder="Your name" required>
      <label for="birthdate" style="margin-top:1.1em;">When's your birthday?</label>
      <input id="birthdate" class="date-picker" type="date" required>
      <button class="gb-btn" id="continue-btn">Continue</button>
    </div>
  `;
  controls.innerHTML = '';
  document.getElementById('continue-btn').onclick = () => {
    const name = document.getElementById('name').value.trim() || 'Player';
    const birthdate = document.getElementById('birthdate').value;
    if (name && birthdate) {
      state.name = name;
      state.birthdate = birthdate;
      showGreetingScreen();
    } else {
      alert('Please enter your name and birthday!');
    }
  };
}

function showGreetingScreen() {
  state.scene = 2;
  screen.innerHTML = `
    <div style="text-align:center;">
      <div class="pixel-calendar">
        <div class="pixel-calendar-date">${formatBirthdate(state.birthdate)}</div>
      </div>
      <h2 style="margin-bottom:0.7em;">Happy Birthday, ${sanitize(state.name)}!</h2>
      <div id="confetti-holder"></div>
      <button class="gb-btn" id="letsplay-btn">Let's Play!</button>
    </div>
  `;
  controls.innerHTML = '';
  animateConfetti('confetti-holder', 18);
  document.getElementById('letsplay-btn').onclick = showAdventureScene;
}

function showAdventureScene() {
  state.scene = 3;
  screen.innerHTML = `
    <div class="pixel-bedroom">
      <div class="balloons">🎈🎈</div>
      <div class="coffee-icon">☕</div>
    </div>
    <div style="text-align:center;">
      <h3>Wake up, ${sanitize(state.name)}!<br>Your birthday adventure begins.</h3>
      <button class="gb-btn" id="adventure-continue">Continue</button>
    </div>
  `;
  controls.innerHTML = '';
  document.getElementById('adventure-continue').onclick = showGiftCatchMiniGame;
}

// Mini-game logic
function showGiftCatchMiniGame() {
  state.scene = 4;
  state.giftsCaught = 0;
  state.miniGameActive = true;
  screen.innerHTML = `
    <div style="text-align:center;">
      <div class="gift-catch-area" id="gift-area">
        <div class="player" id="player">🙂</div>
      </div>
      <div style="margin-bottom:0.4em;">Catch as many gifts as you can!</div>
      <div id="score" style="font-size:1em;color:#42484f;">Score: 0</div>
      <button class="gb-btn" id="start-mini-btn">Start</button>
    </div>
  `;
  controls.innerHTML = `
    <button class="gb-btn" id="left-btn" style="margin-right:14px;">◀</button>
    <button class="gb-btn" id="right-btn">▶</button>
  `;
  document.getElementById('start-mini-btn').onclick = startMiniGame;
  document.getElementById('left-btn').onclick = () => movePlayer(-1);
  document.getElementById('right-btn').onclick = () => movePlayer(1);
  // Also listen for arrow keys
  document.onkeydown = function(e) {
    if (!state.miniGameActive) return;
    if (e.key === "ArrowLeft") movePlayer(-1);
    if (e.key === "ArrowRight") movePlayer(1);
  };
}

function startMiniGame() {
  state.giftsCaught = 0;
  document.getElementById('score').textContent = "Score: 0";
  let area = document.getElementById('gift-area');
  let player = document.getElementById('player');
  let playerPos = 98; // px from left
  player.style.left = playerPos + 'px';
  state.miniGameActive = true;

  // Gifts array
  let gifts = [];
  let giftInterval, gameTimer;
  let gameDuration = 10; // seconds
  let startTime = Date.now();

  function spawnGift() {
    let gift = document.createElement('div');
    gift.className = 'gift';
    let left = Math.floor(Math.random() * (area.offsetWidth - 26));
    gift.style.left = left + 'px';
    gift.style.top = '0px';
    gift.innerHTML = '🎁';
    area.appendChild(gift);
    gifts.push({el: gift, x: left, y: 0});
  }

  function moveGifts() {
    gifts.forEach(obj => {
      obj.y += 6;
      obj.el.style.top = obj.y + 'px';
      // Collision
      if (obj.y > area.offsetHeight - 32) {
        // Check overlap with player
        let playerX = playerPos;
        if (Math.abs(obj.x - playerX) < 26) {
          // Caught!
          state.giftsCaught++;
          document.getElementById('score').textContent = "Score: " + state.giftsCaught;
          obj.el.remove();
          obj.caught = true;
        }
      }
    });
    gifts = gifts.filter(g => !g.caught && g.y < area.offsetHeight);
  }

  giftInterval = setInterval(spawnGift, 400);
  let moveInterval = setInterval(moveGifts, 60);

  gameTimer = setTimeout(() => {
    // End game
    clearInterval(giftInterval);
    clearInterval(moveInterval);
    state.miniGameActive = false;
    showEndScene();
  }, gameDuration * 1000);
  
  // Let player move
  window.movePlayer = function(dir) {
    if (!state.miniGameActive) return;
    playerPos += dir * 22;
    playerPos = Math.max(0, Math.min(area.offsetWidth - 26, playerPos));
    player.style.left = playerPos + 'px';
  };
}

function showEndScene() {
  state.scene = 5;
  screen.innerHTML = `
    <div class="party-scene">
      <div class="party-cake">🎂</div>
      <div class="party-coffee">☕</div>
      <div class="party-confetti" id="party-confetti"></div>
    </div>
    <div style="text-align:center;">
      <h2>Congrats, ${sanitize(state.name)}!</h2>
      <div>Hope you have the sweetest birthday ever!</div>
      <div style="margin:1.2em 0;">
        <span style="font-size:1.1em;">🎁 Gifts caught: ${state.giftsCaught}</span>
      </div>
      <div class="badge">
        ${sanitize(state.name)}'s Birthday<br>
        <span style="font-size:0.97em;">${formatBirthdate(state.birthdate)}</span>
      </div>
      <button class="gb-btn" id="play-again-btn">Play Again</button>
    </div>
  `;
  controls.innerHTML = '';
  animateConfetti('party-confetti', 16);
  document.getElementById('play-again-btn').onclick = showStartScreen;
}

// Utility: Confetti animation
function animateConfetti(holderId, count) {
  const holder = document.getElementById(holderId);
  if (!holder) return;
  holder.innerHTML = '';
  for (let i = 0; i < count; i++) {
    let c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 90 + 'px';
    c.style.top = Math.random() * 18 + 'px';
    c.style.background = confettiColors[i % confettiColors.length];
    c.style.animationDelay = (Math.random() * 1.1) + 's';
    holder.appendChild(c);
  }
}

// Format birthdate: yyyy-mm-dd => MMM DD
function formatBirthdate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Sanitize input (basic)
function sanitize(str) {
  return String(str).replace(/[<>&"]/g, function(c) {
    return ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]);
  });
}

// Start
showStartScreen();