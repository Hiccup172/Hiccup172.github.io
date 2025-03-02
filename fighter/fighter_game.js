// ----------------------------
// Global Move Configurations
// ----------------------------
const moveConfigs = {
    punchLight: { duration: 15, hitFrame: 8, damage: 5, hitbox: { offsetX: 50, offsetY: 20, width: 30, height: 20 } },
    punchMedium: { duration: 20, hitFrame: 10, damage: 10, hitbox: { offsetX: 50, offsetY: 20, width: 40, height: 20 } },
    punchHeavy: { duration: 25, hitFrame: 12, damage: 15, hitbox: { offsetX: 50, offsetY: 20, width: 50, height: 20 } },
    kickLight: { duration: 15, hitFrame: 8, damage: 6, hitbox: { offsetX: 50, offsetY: 60, width: 30, height: 20 } },
    kickMedium: { duration: 20, hitFrame: 10, damage: 11, hitbox: { offsetX: 50, offsetY: 60, width: 40, height: 20 } },
    kickHeavy: { duration: 25, hitFrame: 12, damage: 16, hitbox: { offsetX: 50, offsetY: 60, width: 50, height: 20 } },
    throwGrab: { duration: 20, hitFrame: 10, damage: 20, hitbox: { offsetX: 40, offsetY: 40, width: 40, height: 40 } }
  };
  
  // ----------------------------
  // Input Manager with "Just Pressed" Support
  // ----------------------------
  class InputManager {
    constructor() {
      this.keys = {};
      this.prevKeys = {};
      window.addEventListener('keydown', (e) => {
        this.keys[e.key] = true;
      });
      window.addEventListener('keyup', (e) => {
        this.keys[e.key] = false;
      });
    }
    
    isKeyDown(key) {
      return !!this.keys[key];
    }
    
    wasKeyJustPressed(key) {
      return this.keys[key] && !this.prevKeys[key];
    }
    
    // Call this at the end of the game loop to capture the current state as "previous" for next frame.
    update() {
      this.prevKeys = { ...this.keys };
    }
  }
  
  // ----------------------------
  // Character Class with States and Moves
  // ----------------------------
  class Character {
    constructor({ name, x, y, color, controls }) {
      this.name = name;
      this.x = x;
      this.y = y;
      this.width = 50;
      this.height = 100;
      this.color = color;
      this.health = 100;
      this.maxHealth = 100;
      this.controls = controls;
      this.state = 'idle';
      this.stateTimer = 0;
      this.hitRegistered = false;
      this.vx = 0;
      this.vy = 0;
      this.onGround = true;
      this.direction = 1; // 1 = right, -1 = left
      this.walkSpeed = 3;
      this.dashSpeed = 8;
    }
    
    startMove(moveName) {
      this.state = moveName;
      if (moveConfigs[moveName]) {
        this.stateTimer = moveConfigs[moveName].duration;
      } else if (moveName === 'dashing') {
        this.stateTimer = 10;
      } else if (moveName === 'blockStanding' || moveName === 'blockCrouching') {
        this.stateTimer = 15;
      } else {
        this.stateTimer = 10;
      }
      this.hitRegistered = false;
    }
    
    update(input, deltaTime) {
      // If in a discrete move state (attack, dash, jump, block, throw), count down the timer.
      if (this.state !== 'idle' && this.state !== 'walking' && this.state !== 'crouching') {
        this.stateTimer--;
        if (this.stateTimer <= 0) {
          this.state = 'idle';
        }
      }
      
      // If idle/walking/crouching, process movement and attack inputs.
      if (this.state === 'idle' || this.state === 'walking' || this.state === 'crouching') {
        // Movement (left/right)
        let moving = false;
        if (input.isKeyDown(this.controls.left)) {
          this.vx = -this.walkSpeed;
          this.direction = -1;
          moving = true;
        } else if (input.isKeyDown(this.controls.right)) {
          this.vx = this.walkSpeed;
          this.direction = 1;
          moving = true;
        } else {
          this.vx = 0;
        }
        
        // Crouch
        if (input.isKeyDown(this.controls.crouch)) {
          this.state = 'crouching';
        } else if (!moving && this.state === 'crouching') {
          this.state = 'idle';
        } else if (moving && this.state !== 'walking') {
          this.state = 'walking';
        }
        
        // Jump
        if (input.wasKeyJustPressed(this.controls.jump) && this.onGround) {
          this.state = 'jumping';
          this.vy = -12;
          this.onGround = false;
        }
        
        // Dash
        if (input.wasKeyJustPressed(this.controls.dash)) {
          this.startMove('dashing');
          this.vx = this.direction * this.dashSpeed;
        }
        
        // Attack moves (only trigger if in idle/walking/crouching)
        if (this.state === 'idle' || this.state === 'walking' || this.state === 'crouching') {
          if (input.wasKeyJustPressed(this.controls.throwGrab)) {
            this.startMove('throwGrab');
          } else if (input.wasKeyJustPressed(this.controls.blockStanding) || input.wasKeyJustPressed(this.controls.blockCrouching)) {
            if (input.isKeyDown(this.controls.crouch)) {
              this.startMove('blockCrouching');
            } else {
              this.startMove('blockStanding');
            }
          } else if (input.wasKeyJustPressed(this.controls.punchHeavy)) {
            this.startMove('punchHeavy');
          } else if (input.wasKeyJustPressed(this.controls.punchMedium)) {
            this.startMove('punchMedium');
          } else if (input.wasKeyJustPressed(this.controls.punchLight)) {
            this.startMove('punchLight');
          } else if (input.wasKeyJustPressed(this.controls.kickHeavy)) {
            this.startMove('kickHeavy');
          } else if (input.wasKeyJustPressed(this.controls.kickMedium)) {
            this.startMove('kickMedium');
          } else if (input.wasKeyJustPressed(this.controls.kickLight)) {
            this.startMove('kickLight');
          }
        }
      }
      
      // Apply physics: update position.
      this.x += this.vx;
      this.vy += 0.5; // gravity
      this.y += this.vy;
      
      // Ground collision (ground at y = 500)
      const groundY = 500;
      if (this.y + this.height >= groundY) {
        this.y = groundY - this.height;
        this.vy = 0;
        this.onGround = true;
        if (this.state === 'jumping') {
          this.state = 'idle';
        }
      }
      
      // Keep within stage boundaries.
      if (this.x < 0) this.x = 0;
      if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }
    
    // Return an attack hitbox when the move is in its "hit frame" (only once per move).
    getCurrentAttackHitbox() {
      if (moveConfigs[this.state] && this.stateTimer === moveConfigs[this.state].hitFrame && !this.hitRegistered) {
        let cfg = moveConfigs[this.state];
        let hb = cfg.hitbox;
        let attackX = this.direction === 1 ? this.x + this.width : this.x - hb.width;
        let attackY = this.y + hb.offsetY;
        return { x: attackX, y: attackY, width: hb.width, height: hb.height, damage: cfg.damage };
      }
      return null;
    }
    
    // Render the character with simple "animations" based on state.
    render(ctx) {
      let bodyWidth = this.width;
      let bodyHeight = this.height;
      let offsetX = this.x;
      let offsetY = this.y;
      
      switch(this.state) {
        case 'idle':
        case 'walking':
          ctx.fillStyle = this.color;
          ctx.fillRect(offsetX, offsetY, bodyWidth, bodyHeight);
          break;
        case 'dashing':
          ctx.fillStyle = this.color;
          ctx.fillRect(offsetX, offsetY, bodyWidth, bodyHeight);
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fillRect(offsetX - this.direction * 10, offsetY, bodyWidth, bodyHeight);
          break;
        case 'jumping':
          ctx.fillStyle = this.color;
          ctx.fillRect(offsetX, offsetY, bodyWidth, bodyHeight);
          break;
        case 'crouching':
          ctx.fillStyle = this.color;
          ctx.fillRect(offsetX, offsetY + 40, bodyWidth, bodyHeight - 40);
          break;
        // Punch animations
        case 'punchLight':
        case 'punchMedium':
        case 'punchHeavy': {
          ctx.fillStyle = this.color;
          ctx.fillRect(offsetX, offsetY, bodyWidth, bodyHeight);
          let cfg = moveConfigs[this.state];
          let hb = cfg.hitbox;
          let punchX = this.direction === 1 ? offsetX + bodyWidth : offsetX - hb.width;
          let punchY = offsetY + hb.offsetY;
          ctx.fillStyle = 'yellow';
          ctx.fillRect(punchX, punchY, hb.width, hb.height);
          ctx.fillStyle = 'orange';
          ctx.beginPath();
          if (this.direction === 1) {
            ctx.moveTo(punchX + hb.width, punchY + hb.height/2);
            ctx.lineTo(punchX + hb.width + 10, punchY + hb.height/2 - 5);
            ctx.lineTo(punchX + hb.width + 10, punchY + hb.height/2 + 5);
          } else {
            ctx.moveTo(punchX, punchY + hb.height/2);
            ctx.lineTo(punchX - 10, punchY + hb.height/2 - 5);
            ctx.lineTo(punchX - 10, punchY + hb.height/2 + 5);
          }
          ctx.closePath();
          ctx.fill();
          break;
        }
        // Kick animations
        case 'kickLight':
        case 'kickMedium':
        case 'kickHeavy': {
          ctx.fillStyle = this.color;
          ctx.fillRect(offsetX, offsetY, bodyWidth, bodyHeight);
          let cfgKick = moveConfigs[this.state];
          let hbKick = cfgKick.hitbox;
          let kickX = this.direction === 1 ? offsetX + bodyWidth : offsetX - hbKick.width;
          let kickY = offsetY + hbKick.offsetY;
          ctx.fillStyle = 'lightblue';
          ctx.fillRect(kickX, kickY, hbKick.width, hbKick.height);
          ctx.fillStyle = 'blue';
          ctx.beginPath();
          if (this.direction === 1) {
            ctx.moveTo(kickX + hbKick.width, kickY + hbKick.height/2);
            ctx.lineTo(kickX + hbKick.width + 10, kickY + hbKick.height/2 - 5);
            ctx.lineTo(kickX + hbKick.width + 10, kickY + hbKick.height/2 + 5);
          } else {
            ctx.moveTo(kickX, kickY + hbKick.height/2);
            ctx.lineTo(kickX - 10, kickY + hbKick.height/2 - 5);
            ctx.lineTo(kickX - 10, kickY + hbKick.height/2 + 5);
          }
          ctx.closePath();
          ctx.fill();
          break;
        }
        // Block animations
        case 'blockStanding': {
          ctx.fillStyle = this.color;
          ctx.fillRect(offsetX, offsetY, bodyWidth, bodyHeight);
          ctx.strokeStyle = 'cyan';
          ctx.lineWidth = 3;
          ctx.strokeRect(offsetX - 5, offsetY - 5, bodyWidth + 10, bodyHeight + 10);
          break;
        }
        case 'blockCrouching': {
          ctx.fillStyle = this.color;
          ctx.fillRect(offsetX, offsetY + 40, bodyWidth, bodyHeight - 40);
          ctx.strokeStyle = 'cyan';
          ctx.lineWidth = 3;
          ctx.strokeRect(offsetX - 5, offsetY + 35, bodyWidth + 10, bodyHeight - 30);
          break;
        }
        // Throw/Grab animation
        case 'throwGrab': {
          ctx.fillStyle = this.color;
          ctx.fillRect(offsetX, offsetY, bodyWidth, bodyHeight);
          let cfgThrow = moveConfigs['throwGrab'];
          let hbThrow = cfgThrow.hitbox;
          let throwX = this.direction === 1 ? offsetX + bodyWidth : offsetX - hbThrow.width;
          let throwY = offsetY + hbThrow.offsetY;
          ctx.fillStyle = 'magenta';
          ctx.fillRect(throwX, throwY, hbThrow.width, hbThrow.height);
          ctx.fillStyle = 'red';
          ctx.beginPath();
          if (this.direction === 1) {
            ctx.moveTo(throwX + hbThrow.width, throwY + hbThrow.height/2);
            ctx.lineTo(throwX + hbThrow.width + 10, throwY + hbThrow.height/2 - 5);
            ctx.lineTo(throwX + hbThrow.width + 10, throwY + hbThrow.height/2 + 5);
          } else {
            ctx.moveTo(throwX, throwY + hbThrow.height/2);
            ctx.lineTo(throwX - 10, throwY + hbThrow.height/2 - 5);
            ctx.lineTo(throwX - 10, throwY + hbThrow.height/2 + 5);
          }
          ctx.closePath();
          ctx.fill();
          break;
        }
        default:
          ctx.fillStyle = this.color;
          ctx.fillRect(offsetX, offsetY, bodyWidth, bodyHeight);
          break;
      }
    }
    
    // Reset character for a new round.
    reset(initialX, initialY) {
      this.health = this.maxHealth;
      this.x = initialX;
      this.y = initialY;
      this.vx = 0;
      this.vy = 0;
      this.state = 'idle';
    }
  }
  
  // ----------------------------
  // Rectangle Intersection Utility
  // ----------------------------
  function rectIntersect(r1, r2) {
    return !(r2.x > r1.x + r1.width ||
             r2.x + r2.width < r1.x ||
             r2.y > r1.y + r1.height ||
             r2.y + r2.height < r1.y);
  }
  
  // ----------------------------
  // Game Class
  // ----------------------------
  class Game {
    constructor(player1Character, player2Character) {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.input = new InputManager();
      
      // Define control mappings.
      this.player1Controls = {
        left: 'a',
        right: 'd',
        jump: 'w',
        crouch: 's',
        dash: 'q',
        punchLight: 't',
        punchMedium: 'y',
        punchHeavy: 'u',
        kickLight: 'g',
        kickMedium: 'h',
        kickHeavy: 'j',
        blockStanding: 'b',
        blockCrouching: 'n',
        throwGrab: 'm'
      };
      
      this.player2Controls = {
        left: 'ArrowLeft',
        right: 'ArrowRight',
        jump: 'ArrowUp',
        crouch: 'ArrowDown',
        dash: '0',
        punchLight: '7',
        punchMedium: '8',
        punchHeavy: '9',
        kickLight: '4',
        kickMedium: '5',
        kickHeavy: '6',
        blockStanding: '1',
        blockCrouching: '2',
        throwGrab: '3'
      };
      
      // Create fighters with initial positions.
      this.player1 = new Character({
        name: player1Character,
        x: 100,
        y: 400,
        color: player1Character === 'blade' ? 'blue' : 'green',
        controls: this.player1Controls
      });
      
      this.player2 = new Character({
        name: player2Character,
        x: 1100,
        y: 400,
        color: player2Character === 'blade' ? 'red' : 'purple',
        controls: this.player2Controls
      });
      
      // Round and match state.
      this.round = 1;
      this.player1RoundsWon = 0;
      this.player2RoundsWon = 0;
      this.gameOver = false;
      this.lastTime = 0;
    }
    
    update(deltaTime) {
      // Update both fighters.
      this.player1.update(this.input, deltaTime);
      this.player2.update(this.input, deltaTime);
      
      // Check for attack collisions.
      this.checkAttacks(this.player1, this.player2);
      this.checkAttacks(this.player2, this.player1);
      
      // Check for round end.
      if (this.player1.health <= 0 || this.player2.health <= 0) {
        if (this.player1.health <= 0 && this.player2.health > 0) {
          this.player2RoundsWon++;
        } else if (this.player2.health <= 0 && this.player1.health > 0) {
          this.player1RoundsWon++;
        }
        this.round++;
        
        if (this.player1RoundsWon === 2 || this.player2RoundsWon === 2) {
          this.gameOver = true;
        } else {
          this.resetRound();
        }
      }
    }
    
    checkAttacks(attacker, defender) {
      let attackHitbox = attacker.getCurrentAttackHitbox();
      if (attackHitbox) {
        // If defender is blocking (standing or crouching) and the attack is not a throw, ignore damage.
        if ((defender.state === 'blockStanding' || defender.state === 'blockCrouching') && attacker.state !== 'throwGrab') {
          attacker.hitRegistered = true;
          return;
        }
        // Defender's hurtbox.
        let defenderHurtbox = { x: defender.x, y: defender.y, width: defender.width, height: defender.height };
        if (rectIntersect(attackHitbox, defenderHurtbox)) {
          defender.health -= attackHitbox.damage;
          attacker.hitRegistered = true;
          if (defender.health < 0) defender.health = 0;
        }
      }
    }
    
    resetRound() {
      // Reset fighters and update round counter.
      this.player1.reset(100, 400);
      this.player2.reset(1100, 400);
      document.getElementById('round-counter').innerText = `Round: ${this.round}`;
    }
    
    render() {
      // Clear the canvas.
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.renderBackground();
      this.player1.render(this.ctx);
      this.player2.render(this.ctx);
      this.updateUI();
    }
    
    renderBackground() {
      // Draw a simple urban stage background.
      this.ctx.fillStyle = '#444';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      // Draw ground.
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(0, 500, this.canvas.width, 100);
    }
    
    updateUI() {
      // Update health bars.
      const player1HealthBar = document.getElementById('player1-health');
      const player2HealthBar = document.getElementById('player2-health');
      const p1HealthPercent = (this.player1.health / this.player1.maxHealth) * 100;
      const p2HealthPercent = (this.player2.health / this.player2.maxHealth) * 100;
      player1HealthBar.style.background = `linear-gradient(to right, #0f0 ${p1HealthPercent}%, #555 ${p1HealthPercent}%)`;
      player2HealthBar.style.background = `linear-gradient(to left, #0f0 ${p2HealthPercent}%, #555 ${p2HealthPercent}%)`;
      
      // If match is over, display winner.
      if (this.gameOver) {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '50px Arial';
        let message = this.player1RoundsWon === 2 ? 'Player One Wins!' : 'Player Two Wins!';
        this.ctx.fillText(message, this.canvas.width/2 - 200, this.canvas.height/2);
      }
    }
    
    gameLoop(timestamp) {
      let deltaTime = timestamp - this.lastTime;
      this.lastTime = timestamp;
      if (!this.gameOver) {
        this.update(deltaTime);
      }
      this.render();
      // Update input state at the end of the loop so that wasKeyJustPressed works correctly.
      this.input.update();
      requestAnimationFrame((ts) => this.gameLoop(ts));
    }
    
    start() {
      requestAnimationFrame((ts) => {
        this.lastTime = ts;
        this.gameLoop(ts);
      });
    }
  }
  
  // ----------------------------
  // Setup: Tutorial, Selection, and Game Start
  // ----------------------------
  document.addEventListener('DOMContentLoaded', function() {
    // Expose canvas globally (used by Character boundaries).
    const canvas = document.getElementById('gameCanvas');
    window.canvas = canvas;
    
    // Tutorial overlay.
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    const tutorialContinue = document.getElementById('tutorial-continue');
    tutorialContinue.addEventListener('click', () => {
      tutorialOverlay.style.display = 'none';
      // Show character selection.
      document.getElementById('selection-overlay').style.display = 'flex';
    });
    
    // Character selection handling.
    let player1Selection = null;
    let player2Selection = null;
    const player1Buttons = document.querySelectorAll('#player1-selection .character-button');
    const player2Buttons = document.querySelectorAll('#player2-selection .character-button');
    const startGameButton = document.getElementById('start-game-button');
    
    player1Buttons.forEach(button => {
      button.addEventListener('click', () => {
        player1Selection = button.getAttribute('data-character');
        player1Buttons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        checkSelections();
      });
    });
    
    player2Buttons.forEach(button => {
      button.addEventListener('click', () => {
        player2Selection = button.getAttribute('data-character');
        player2Buttons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        checkSelections();
      });
    });
    
    function checkSelections() {
      if (player1Selection && player2Selection) {
        startGameButton.disabled = false;
      }
    }
    
    startGameButton.addEventListener('click', () => {
      document.getElementById('selection-overlay').style.display = 'none';
      const game = new Game(player1Selection, player2Selection);
      game.start();
    });
  });
  