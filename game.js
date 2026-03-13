(function () {
  'use strict';

  // ==================== Constants ====================
  var W = 800, H = 600;
  var BORDER = 10;
  var PLAYER_RADIUS = 2;
  var PLAYER_SPEED = 120;
  var ENEMY_RADIUS = 6;
  var INITIAL_LIVES = 3;
  var SWIPE_THRESHOLD = 15;

  var LEVELS = [
    {
      name: 'Training',
      enemies: 1,
      enemySpeed: 60,
      winPercent: 80,
      walls: [
        [{ x: 300, y: 200 }, { x: 360, y: 200 }, { x: 360, y: 260 }, { x: 300, y: 260 }],
        [{ x: 500, y: 350 }, { x: 560, y: 350 }, { x: 560, y: 410 }, { x: 500, y: 410 }]
      ]
    },
    {
      name: 'Islands',
      enemies: 2,
      enemySpeed: 70,
      winPercent: 80,
      walls: [
        [{ x: 200, y: 150 }, { x: 280, y: 150 }, { x: 280, y: 230 }, { x: 200, y: 230 }],
        [{ x: 400, y: 250 }, { x: 460, y: 250 }, { x: 460, y: 350 }, { x: 400, y: 350 }],
        [{ x: 550, y: 100 }, { x: 650, y: 100 }, { x: 650, y: 180 }, { x: 550, y: 180 }],
        [{ x: 150, y: 380 }, { x: 250, y: 380 }, { x: 250, y: 460 }, { x: 150, y: 460 }]
      ]
    },
    {
      name: 'Corridor',
      enemies: 2,
      enemySpeed: 80,
      winPercent: 80,
      walls: [
        [{ x: 200, y: 100 }, { x: 260, y: 100 }, { x: 260, y: 350 }, { x: 200, y: 350 }],
        [{ x: 260, y: 290 }, { x: 450, y: 290 }, { x: 450, y: 350 }, { x: 260, y: 350 }],
        [{ x: 550, y: 400 }, { x: 620, y: 400 }, { x: 620, y: 470 }, { x: 550, y: 470 }]
      ]
    },
    {
      name: 'Open Field',
      enemies: 3,
      enemySpeed: 85,
      winPercent: 80,
      walls: [
        [{ x: 380, y: 280 }, { x: 420, y: 280 }, { x: 420, y: 320 }, { x: 380, y: 320 }]
      ]
    },
    {
      name: 'Hell',
      enemies: 4,
      enemySpeed: 100,
      winPercent: 80,
      walls: []
    }
  ];

  var COLORS = {
    BG: '#3d2b1f',           // Rich soil brown
    SAFE: '#4a8c38',         // Lush grass green
    CAPTURED: '#5a9a44',     // Brighter grass
    BORDER_ZONE: '#8b6914',  // Wooden fence brown
    WALL: '#7a7a6e',         // Stone gray
    PLAYER: '#ffe066',       // Bright farmer yellow
    ENEMY: '#9b59b6',        // Purple slime
    TRAIL: '#d4a437',        // Golden wheat
    TEXT: '#fdf6e3'          // Warm cream
  };

  function TextureManager() {
    this.patterns = {};
    this.init();
  }

  TextureManager.prototype.init = function () {
    this.patterns.grass = this.makeGrassPattern();
    this.patterns.dirt = this.makeDirtPattern();
    this.patterns.wood = this.makeWoodPattern();
    this.patterns.stone = this.makeStonePattern();
  };

  TextureManager.prototype.createTile = function (size) {
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    return canvas;
  };

  TextureManager.prototype.makeGrassPattern = function () {
    var size = 32;
    var canvas = this.createTile(size);
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#4a8c38';
    ctx.fillRect(0, 0, size, size);

    var total = size * size;
    var darkCount = Math.floor(total * 0.2);
    var lightCount = Math.floor(total * 0.15);
    var tipCount = Math.floor(total * 0.06);
    var depthCount = Math.floor(total * 0.05);

    ctx.fillStyle = '#3a7028';
    for (var i = 0; i < darkCount; i++) {
      ctx.fillRect((Math.random() * size) | 0, (Math.random() * size) | 0, 1, 1);
    }

    ctx.fillStyle = '#5da845';
    for (var i = 0; i < lightCount; i++) {
      ctx.fillRect((Math.random() * size) | 0, (Math.random() * size) | 0, 1, 1);
    }

    ctx.fillStyle = '#8bc34a';
    for (var i = 0; i < tipCount; i++) {
      var x = (Math.random() * size) | 0;
      var y = (Math.random() * size) | 0;
      ctx.fillRect(x, y, 1, 1);
      if (Math.random() > 0.6) ctx.fillRect(Math.min(size - 1, x + 1), y, 1, 1);
      if (Math.random() > 0.7) ctx.fillRect(x, Math.min(size - 1, y + 1), 1, 1);
    }

    ctx.fillStyle = '#2d5a1f';
    for (var i = 0; i < depthCount; i++) {
      ctx.fillRect((Math.random() * size) | 0, (Math.random() * size) | 0, 1, 1);
    }

    return ctx.createPattern(canvas, 'repeat');
  };

  TextureManager.prototype.makeDirtPattern = function () {
    var size = 32;
    var canvas = this.createTile(size);
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#3d2b1f';
    ctx.fillRect(0, 0, size, size);

    var total = size * size;
    var lightCount = Math.floor(total * 0.15);
    var darkCount = Math.floor(total * 0.1);
    var pebbleCount = Math.floor(total * 0.03);

    ctx.fillStyle = '#5a4030';
    for (var i = 0; i < lightCount; i++) {
      ctx.fillRect((Math.random() * size) | 0, (Math.random() * size) | 0, 1, 1);
    }

    ctx.fillStyle = '#2a1a10';
    for (var i = 0; i < darkCount; i++) {
      ctx.fillRect((Math.random() * size) | 0, (Math.random() * size) | 0, 1, 1);
    }

    ctx.fillStyle = '#6a5a4a';
    for (var i = 0; i < pebbleCount; i++) {
      ctx.fillRect((Math.random() * size) | 0, (Math.random() * size) | 0, 1, 1);
    }

    return ctx.createPattern(canvas, 'repeat');
  };

  TextureManager.prototype.makeWoodPattern = function () {
    var size = 32;
    var canvas = this.createTile(size);
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#8b6914';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#7a5810';
    for (var y = 0; y < size; y += 5) {
      var jitter = (Math.random() * 2) | 0;
      ctx.fillRect(0, y + jitter, size, 1);
    }

    ctx.fillStyle = '#a08020';
    for (var i = 0; i < size; i += 3) {
      var yPos = ((i * 3) % size) | 0;
      ctx.fillRect(i, yPos, 1, 1);
    }

    ctx.fillStyle = '#5a3d0a';
    for (var k = 0; k < 3; k++) {
      var cx = 6 + Math.random() * (size - 12);
      var cy = 6 + Math.random() * (size - 12);
      ctx.beginPath();
      ctx.arc(cx, cy, 2 + Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    return ctx.createPattern(canvas, 'repeat');
  };

  TextureManager.prototype.makeStonePattern = function () {
    var size = 32;
    var canvas = this.createTile(size);
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#7a7a6e';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#5a5a50';
    for (var y = 0; y < size; y += 8) {
      var offset = (Math.random() * 4) | 0;
      ctx.fillRect(0, y + offset, size, 1);
    }
    for (var x = 0; x < size; x += 8) {
      var offsetX = (Math.random() * 4) | 0;
      ctx.fillRect(x + offsetX, 0, 1, size);
    }

    ctx.fillStyle = '#8a8a7e';
    for (var i = 0; i < 30; i++) {
      ctx.fillRect((Math.random() * size) | 0, (Math.random() * size) | 0, 2, 2);
    }

    ctx.fillStyle = 'rgba(40, 40, 35, 0.4)';
    for (var i = 0; i < 80; i++) {
      ctx.fillRect((Math.random() * size) | 0, (Math.random() * size) | 0, 1, 1);
    }

    return ctx.createPattern(canvas, 'repeat');
  };

  var PlayerState = { IDLE: 0, MOVING_SAFE: 1, DRAWING: 2 };
  var GameState = { MENU: 0, PLAYING: 1, PAUSED: 2, LEVEL_COMPLETE: 3, GAME_OVER: 4, VICTORY: 5 };

  // ==================== Geometry Utilities ====================

  function texNoise(x, y, seed) {
    var n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  }

  function dist(ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function shoelaceArea(pts) {
    var n = pts.length, s = 0;
    for (var i = 0; i < n; i++) {
      var j = (i + 1) % n;
      s += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    }
    return s * 0.5;
  }

  function absArea(pts) {
    return Math.abs(shoelaceArea(pts));
  }

  function pointInPolygon(px, py, poly) {
    var inside = false, n = poly.length;
    for (var i = 0, j = n - 1; i < n; j = i++) {
      var xi = poly[i].x, yi = poly[i].y;
      var xj = poly[j].x, yj = poly[j].y;
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  function pointToSegmentDistSq(px, py, ax, ay, bx, by) {
    var abx = bx - ax, aby = by - ay;
    var len2 = abx * abx + aby * aby;
    if (len2 < 1e-10) return (px - ax) * (px - ax) + (py - ay) * (py - ay);
    var t = clamp(((px - ax) * abx + (py - ay) * aby) / len2, 0, 1);
    var cx = ax + t * abx, cy = ay + t * aby;
    var dx = px - cx, dy = py - cy;
    return dx * dx + dy * dy;
  }

  function segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
    var denom = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
    if (Math.abs(denom) < 1e-10) return false;
    var t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / denom;
    var u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / denom;
    return t > 1e-8 && t < 1 - 1e-8 && u > 1e-8 && u < 1 - 1e-8;
  }

  function pointOnSegment(px, py, ax, ay, bx, by, eps) {
    var lenAB = dist(ax, ay, bx, by);
    if (lenAB < 1e-10) return dist(px, py, ax, ay) < eps;
    var t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / (lenAB * lenAB);
    if (t < -0.01 || t > 1.01) return false;
    t = clamp(t, 0, 1);
    var cx = ax + t * (bx - ax), cy = ay + t * (by - ay);
    return dist(px, py, cx, cy) < eps;
  }

  function findEdgeIndex(poly, px, py, eps) {
    for (var i = 0; i < poly.length; i++) {
      var j = (i + 1) % poly.length;
      if (pointOnSegment(px, py, poly[i].x, poly[i].y, poly[j].x, poly[j].y, eps)) {
        return i;
      }
    }
    return -1;
  }

  function edgeParam(px, py, ax, ay, bx, by) {
    var abx = bx - ax, aby = by - ay;
    var len2 = abx * abx + aby * aby;
    if (len2 < 1e-10) return 0;
    return clamp(((px - ax) * abx + (py - ay) * aby) / len2, 0, 1);
  }

  function polyToRegion(pts) {
    var region = [];
    for (var i = 0; i < pts.length; i++) {
      region.push([pts[i].x, pts[i].y]);
    }
    return region;
  }

  function regionToPoly(region) {
    var pts = [];
    for (var i = 0; i < region.length; i++) {
      pts.push({ x: region[i][0], y: region[i][1] });
    }
    return pts;
  }

  // ==================== Offscreen Canvas Cache ====================

  function SafeZoneCache(w, h) {
    this.w = w;
    this.h = h;
    this.canvas = document.createElement('canvas');
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.dirty = true;
  }

  SafeZoneCache.prototype.rebuild = function (safeZones) {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.fillStyle = '#ff0000';
    for (var i = 0; i < safeZones.length; i++) {
      var poly = safeZones[i];
      if (poly.length < 3) continue;
      ctx.beginPath();
      ctx.moveTo(poly[0].x, poly[0].y);
      for (var j = 1; j < poly.length; j++) {
        ctx.lineTo(poly[j].x, poly[j].y);
      }
      ctx.closePath();
      ctx.fill();
    }
    this.dirty = false;
  };

  SafeZoneCache.prototype.isPointSafe = function (x, y) {
    var ix = Math.round(x), iy = Math.round(y);
    if (ix < 0 || ix >= this.w || iy < 0 || iy >= this.h) return true;
    var data = this.ctx.getImageData(ix, iy, 1, 1).data;
    return data[0] > 128;
  };

  // ==================== Sound System ====================

  function SoundManager() {
    this.ctx = null;
    this.enabled = true;
  }

  SoundManager.prototype.init = function () {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { /* no audio */ }
  };

  SoundManager.prototype.play = function (type) {
    if (!this.enabled || !this.ctx) return;
    var ac = this.ctx;
    var now = ac.currentTime;
    var osc, gain;

    if (type === 'move') {
      osc = ac.createOscillator();
      gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.frequency.setValueAtTime(200, now);
      osc.type = 'square';
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'capture') {
      osc = ac.createOscillator();
      gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      osc.type = 'square';
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'death') {
      osc = ac.createOscillator();
      gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'levelup') {
      var playNote = function (freq, t, dur) {
        var o = ac.createOscillator();
        var g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.frequency.setValueAtTime(freq, t);
        o.type = 'square';
        g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.start(t); o.stop(t + dur);
      };
      playNote(523, now, 0.1);
      playNote(659, now + 0.1, 0.1);
      playNote(784, now + 0.2, 0.2);
    }
  };

  // ==================== Particle System ====================

  function ParticleSystem() {
    this.particles = [];
  }

  ParticleSystem.prototype.emit = function (x, y, count, color, spread) {
    spread = spread || 20;
    for (var i = 0; i < count; i++) {
      this.particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * spread,
        vy: (Math.random() - 0.5) * spread,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        color: color,
        size: 1 + Math.random() * 2
      });
    }
  };

  ParticleSystem.prototype.update = function (dt) {
    for (var i = this.particles.length - 1; i >= 0; i--) {
      var p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  };

  ParticleSystem.prototype.render = function (ctx) {
    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  // ==================== Player ====================

  function Player() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.state = PlayerState.IDLE;
    this.trail = [];
    this.pendingDx = 0;
    this.pendingDy = 0;
  }

  Player.prototype.reset = function (x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.state = PlayerState.IDLE;
    this.trail = [];
    this.pendingDx = 0;
    this.pendingDy = 0;
  };

  Player.prototype.setDirection = function (dx, dy) {
    var cvx = this.vx, cvy = this.vy;
    if (cvx > 0 && dx === -1) return false;
    if (cvx < 0 && dx === 1) return false;
    if (cvy > 0 && dy === -1) return false;
    if (cvy < 0 && dy === 1) return false;

    if (dx !== 0) {
      this.vx = dx * PLAYER_SPEED;
      this.vy = 0;
    } else if (dy !== 0) {
      this.vx = 0;
      this.vy = dy * PLAYER_SPEED;
    }
    return true;
  };

  Player.prototype.stop = function () {
    if (this.state !== PlayerState.DRAWING) {
      this.vx = 0;
      this.vy = 0;
      this.state = PlayerState.IDLE;
    }
  };

  Player.prototype.addTrailTurn = function () {
    var last = this.trail.length > 0 ? this.trail[this.trail.length - 1] : null;
    if (!last || dist(last.x, last.y, this.x, this.y) > 0.5) {
      this.trail.push({ x: this.x, y: this.y });
    }
  };

  Player.prototype.getTrailWithCurrent = function () {
    var arr = this.trail.slice();
    var last = arr.length > 0 ? arr[arr.length - 1] : null;
    if (!last || dist(last.x, last.y, this.x, this.y) > 0.5) {
      arr.push({ x: this.x, y: this.y });
    }
    return arr;
  };

  // ==================== Enemy ====================

  function Enemy(x, y, speed) {
    this.x = x;
    this.y = y;
    this.radius = ENEMY_RADIUS;
    var angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.speed = speed;
  }

  // ==================== Main Game ====================

  function Game() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = W;
    this.canvas.height = H;

    this.elLives = document.getElementById('lives');
    this.elLevel = document.getElementById('level');
    this.elProgress = document.getElementById('progress');
    this.elScore = document.getElementById('score');

    this.sound = new SoundManager();
    this.particles = new ParticleSystem();
    this.cache = new SafeZoneCache(W, H);
    this.textures = new TextureManager();
    this.maskCanvas = document.createElement('canvas');
    this.maskCanvas.width = W;
    this.maskCanvas.height = H;
    this.maskCtx = this.maskCanvas.getContext('2d');
    this.maskImageData = this.maskCtx.createImageData(W, H);
    this.grassCanvas = document.createElement('canvas');
    this.grassCanvas.width = W;
    this.grassCanvas.height = H;
    this.grassCtx = this.grassCanvas.getContext('2d');

    this.gameState = GameState.MENU;
    this.currentLevel = 0;
    this.lives = INITIAL_LIVES;
    this.score = 0;
    this.progress = 0;
    this.highScore = parseInt(localStorage.getItem('xonix_hs') || '0', 10);

    this.safeZones = [];
    this.player = new Player();
    this.enemies = [];

    this.difficulty = 1;
    this.customEnemies = 0;
    this.menuSelection = 0;

    this.totalArea = W * H;
    this.scale = 1;
    this.lastTime = 0;
    this.gameTime = 0;
    this.touchStart = null;

    this.gameLoop = this.gameLoop.bind(this);
    this.bindEvents();
    this.handleResize();
    window.addEventListener('resize', this.handleResize.bind(this));
    requestAnimationFrame(this.gameLoop);
  }

  // ---- Resize ----
  Game.prototype.handleResize = function () {
    var sw = window.innerWidth * 0.95;
    var sh = window.innerHeight * 0.85;
    this.scale = Math.min(sw / W, sh / H);
    this.canvas.style.width = (W * this.scale) + 'px';
    this.canvas.style.height = (H * this.scale) + 'px';
  };

  // ---- Safe Zone Management ----

  Game.prototype.buildInitialSafeZones = function () {
    this.safeZones = [];

    var B = BORDER;

    this.safeZones.push([
      { x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: B }, { x: 0, y: B }
    ]);
    this.safeZones.push([
      { x: 0, y: H - B }, { x: W, y: H - B }, { x: W, y: H }, { x: 0, y: H }
    ]);
    this.safeZones.push([
      { x: 0, y: B }, { x: B, y: B }, { x: B, y: H - B }, { x: 0, y: H - B }
    ]);
    this.safeZones.push([
      { x: W - B, y: B }, { x: W, y: B }, { x: W, y: H - B }, { x: W - B, y: H - B }
    ]);

    var level = LEVELS[this.currentLevel];
    if (level.walls) {
      for (var w = 0; w < level.walls.length; w++) {
        this.safeZones.push(level.walls[w].slice());
      }
    }

    this.rebuildCache();
  };

  Game.prototype.rebuildCache = function () {
    this.cache.rebuild(this.safeZones);
  };

  Game.prototype.isPointSafe = function (x, y) {
    return this.cache.isPointSafe(x, y);
  };

  Game.prototype.computeSafeArea = function () {
    var ctx = this.cache.ctx;
    var data = ctx.getImageData(0, 0, W, H).data;
    var count = 0;
    for (var i = 0; i < data.length; i += 4) {
      if (data[i] > 128) count++;
    }
    return count;
  };

  // ---- Level Management ----

  Game.prototype.startGame = function () {
    this.sound.init();
    this.currentLevel = 0;
    this.lives = INITIAL_LIVES;
    this.score = 0;
    this.startLevel();
  };

  Game.prototype.startLevel = function () {
    this.buildInitialSafeZones();

    var spawnX = W / 2;
    var spawnY = BORDER / 2;
    this.player.reset(spawnX, spawnY);

    this.spawnEnemies();
    this.updateProgress();
    this.gameState = GameState.PLAYING;
  };

  Game.prototype.getEnemyCount = function () {
    var level = LEVELS[this.currentLevel];
    if (this.customEnemies > 0) return this.customEnemies;
    var diffMult = [0.5, 1, 1.5][this.difficulty] || 1;
    return Math.max(1, Math.round(level.enemies * diffMult));
  };

  Game.prototype.getEnemySpeed = function () {
    var level = LEVELS[this.currentLevel];
    var diffMult = [0.7, 1, 1.4][this.difficulty] || 1;
    return level.enemySpeed * diffMult;
  };

  Game.prototype.spawnEnemies = function () {
    this.enemies = [];
    var count = this.getEnemyCount();
    var speed = this.getEnemySpeed();
    var margin = BORDER + ENEMY_RADIUS * 2 + 10;

    for (var i = 0; i < count; i++) {
      var attempts = 0;
      while (attempts < 100) {
        var ex = margin + Math.random() * (W - 2 * margin);
        var ey = margin + Math.random() * (H - 2 * margin);
        if (!this.isPointSafe(ex, ey)) {
          this.enemies.push(new Enemy(ex, ey, speed));
          break;
        }
        attempts++;
      }
      if (attempts >= 100) {
        this.enemies.push(new Enemy(W / 2, H / 2, speed));
      }
    }
  };

  Game.prototype.nextLevel = function () {
    this.currentLevel++;
    if (this.currentLevel >= LEVELS.length) {
      this.gameState = GameState.VICTORY;
      this.saveHighScore();
    } else {
      this.startLevel();
    }
  };

  Game.prototype.togglePause = function () {
    if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
    } else if (this.gameState === GameState.PAUSED) {
      this.gameState = GameState.PLAYING;
    }
  };

  Game.prototype.updateProgress = function () {
    var safePixels = this.computeSafeArea();
    this.progress = Math.round((safePixels / this.totalArea) * 100);
    this.progress = clamp(this.progress, 0, 100);
  };

  Game.prototype.saveHighScore = function () {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('xonix_hs', this.highScore.toString());
    }
  };

  Game.prototype.levelComplete = function () {
    this.score += 1000 * (this.currentLevel + 1);
    this.sound.play('levelup');
    this.gameState = GameState.LEVEL_COMPLETE;
    this.saveHighScore();
  };

  Game.prototype.gameOver = function () {
    this.gameState = GameState.GAME_OVER;
    this.saveHighScore();
  };

  Game.prototype.backToMenu = function () {
    this.gameState = GameState.MENU;
  };

  // ---- Input ----

  Game.prototype.bindEvents = function () {
    var self = this;

    document.addEventListener('keydown', function (e) { self.handleKeyDown(e); });
    document.addEventListener('touchstart', function (e) { self.handleTouchStart(e); }, { passive: false });
    document.addEventListener('touchend', function (e) { self.handleTouchEnd(e); }, { passive: false });
    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
    this.canvas.addEventListener('click', function (e) {
      if (self.gameState === GameState.MENU) {
        var rect = self.canvas.getBoundingClientRect();
        var mx = (e.clientX - rect.left) / self.scale;
        var my = (e.clientY - rect.top) / self.scale;
        self.handleMenuClick(mx, my);
      }
    });
  };

  Game.prototype.handleKeyDown = function (e) {
    var dx = 0, dy = 0, isDir = false;
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': dy = -1; isDir = true; break;
      case 'ArrowDown': case 's': case 'S': dy = 1; isDir = true; break;
      case 'ArrowLeft': case 'a': case 'A': dx = -1; isDir = true; break;
      case 'ArrowRight': case 'd': case 'D': dx = 1; isDir = true; break;
    }

    if (this.gameState === GameState.MENU) {
      e.preventDefault();
      if (e.key === ' ' || e.key === 'Enter') {
        this.startGame();
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this.menuSelection = (this.menuSelection - 1 + 2) % 2;
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        this.menuSelection = (this.menuSelection + 1) % 2;
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (this.menuSelection === 0) {
          this.difficulty = Math.max(0, this.difficulty - 1);
        } else {
          this.customEnemies = Math.max(0, this.customEnemies - 1);
        }
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (this.menuSelection === 0) {
          this.difficulty = Math.min(2, this.difficulty + 1);
        } else {
          this.customEnemies = Math.min(20, this.customEnemies + 1);
        }
        return;
      }
      return;
    }

    if (this.gameState === GameState.GAME_OVER || this.gameState === GameState.VICTORY) {
      if (e.key === ' ' || e.key === 'Enter') this.backToMenu();
      return;
    }

    if (this.gameState === GameState.LEVEL_COMPLETE) {
      if (e.key === ' ' || e.key === 'Enter') this.nextLevel();
      return;
    }

    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      this.togglePause();
      return;
    }

    if (this.gameState !== GameState.PLAYING) return;

    if (isDir) {
      e.preventDefault();
      this.handleDirectionInput(dx, dy);
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      this.player.stop();
    }
  };

  Game.prototype.handleTouchStart = function (e) {
    e.preventDefault();
    if (!this.sound.ctx) this.sound.init();
    if (e.touches.length > 0) {
      this.touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  Game.prototype.handleTouchEnd = function (e) {
    e.preventDefault();

    if (this.gameState === GameState.MENU) {
      if (!this.touchStart || e.changedTouches.length === 0) return;
      var endX = e.changedTouches[0].clientX;
      var endY = e.changedTouches[0].clientY;
      var ddx = endX - this.touchStart.x;
      var ddy = endY - this.touchStart.y;
      if (Math.abs(ddx) < SWIPE_THRESHOLD && Math.abs(ddy) < SWIPE_THRESHOLD) {
        this.startGame();
      } else if (Math.abs(ddx) > Math.abs(ddy)) {
        if (this.menuSelection === 0) {
          this.difficulty = clamp(this.difficulty + (ddx > 0 ? 1 : -1), 0, 2);
        } else {
          this.customEnemies = clamp(this.customEnemies + (ddx > 0 ? 1 : -1), 0, 20);
        }
      } else {
        this.menuSelection = ddy > 0 ? 1 : 0;
      }
      this.touchStart = null;
      return;
    }
    if (this.gameState === GameState.GAME_OVER || this.gameState === GameState.VICTORY) { this.backToMenu(); return; }
    if (this.gameState === GameState.LEVEL_COMPLETE) { this.nextLevel(); return; }

    if (!this.touchStart || e.changedTouches.length === 0) return;

    var endX = e.changedTouches[0].clientX;
    var endY = e.changedTouches[0].clientY;
    var ddx = endX - this.touchStart.x;
    var ddy = endY - this.touchStart.y;

    if (Math.abs(ddx) < SWIPE_THRESHOLD && Math.abs(ddy) < SWIPE_THRESHOLD) return;

    var dx = 0, dy = 0;
    if (Math.abs(ddx) > Math.abs(ddy)) {
      dx = ddx > 0 ? 1 : -1;
    } else {
      dy = ddy > 0 ? 1 : -1;
    }
    this.handleDirectionInput(dx, dy);
    this.touchStart = null;
  };

  Game.prototype.handleDirectionInput = function (dx, dy) {
    if (dx === 0 && dy === 0) return;

    var p = this.player;
    var wasMoving = p.vx !== 0 || p.vy !== 0;
    var changed = p.setDirection(dx, dy);

    if (changed && wasMoving && p.state === PlayerState.DRAWING) {
      p.addTrailTurn();
    }

    if (p.state === PlayerState.IDLE) {
      p.state = PlayerState.MOVING_SAFE;
    }
  };

  // ---- Game Loop ----

  Game.prototype.gameLoop = function (timestamp) {
    var dt = this.lastTime ? (timestamp - this.lastTime) / 1000 : 0;
    this.lastTime = timestamp;
    this.gameTime = timestamp;

    var cappedDt = Math.min(dt, 0.033);

    if (this.gameState === GameState.PLAYING) {
      this.update(cappedDt);
    }

    this.particles.update(cappedDt);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  // ---- Update ----

  Game.prototype.update = function (dt) {
    var p = this.player;
    if (p.vx === 0 && p.vy === 0) {
      this.updateEnemies(dt);
      if (p.state === PlayerState.DRAWING) {
        this.checkCollisions();
      }
      return;
    }

    var prevX = p.x, prevY = p.y;
    var wasInSafe = this.isPointSafe(prevX, prevY);

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    this.handlePlayerBoundary();

    var isInSafe = this.isPointSafe(p.x, p.y);

    if (p.state === PlayerState.MOVING_SAFE && wasInSafe && !isInSafe) {
      p.trail = [{ x: prevX, y: prevY }];
      p.state = PlayerState.DRAWING;
      this.sound.play('move');
    } else if (p.state === PlayerState.DRAWING && !wasInSafe && isInSafe) {
      p.addTrailTurn();
      this.completeCut();
      p.trail = [];
      p.state = PlayerState.MOVING_SAFE;
    }

    if (p.state === PlayerState.MOVING_SAFE && !isInSafe && wasInSafe) {
      p.trail = [{ x: prevX, y: prevY }];
      p.state = PlayerState.DRAWING;
      this.sound.play('move');
    }

    this.updateEnemies(dt);
    this.checkCollisions();
  };

  Game.prototype.handlePlayerBoundary = function () {
    var p = this.player;
    var hitBoundary = false;

    if (p.x < 0) { p.x = 0; if (p.vx < 0) { p.vx = 0; hitBoundary = true; } }
    if (p.x > W) { p.x = W; if (p.vx > 0) { p.vx = 0; hitBoundary = true; } }
    if (p.y < 0) { p.y = 0; if (p.vy < 0) { p.vy = 0; hitBoundary = true; } }
    if (p.y > H) { p.y = H; if (p.vy > 0) { p.vy = 0; hitBoundary = true; } }

    if (hitBoundary && p.state === PlayerState.DRAWING) {
      p.addTrailTurn();
      this.completeCut();
      p.trail = [];
      p.state = PlayerState.MOVING_SAFE;
    }

    if (p.vx === 0 && p.vy === 0 && p.state === PlayerState.MOVING_SAFE) {
      p.state = PlayerState.IDLE;
    }
  };

  // ---- Enemy Update ----

  Game.prototype.updateEnemies = function (dt) {
    for (var e = 0; e < this.enemies.length; e++) {
      var enemy = this.enemies[e];
      var nx = enemy.x + enemy.vx * dt;
      var ny = enemy.y + enemy.vy * dt;
      var r = enemy.radius;

      var bounced = false;
      var steps = 3;

      for (var s = 0; s < steps; s++) {
        var testX = enemy.x + enemy.vx * dt / steps;
        var testY = enemy.y + enemy.vy * dt / steps;

        var hitX = this.isPointSafe(testX + (enemy.vx > 0 ? r : -r), enemy.y);
        var hitY = this.isPointSafe(enemy.x, testY + (enemy.vy > 0 ? r : -r));

        if (hitX) {
          enemy.vx = -enemy.vx;
          testX = enemy.x;
        }
        if (hitY) {
          enemy.vy = -enemy.vy;
          testY = enemy.y;
        }

        enemy.x = testX;
        enemy.y = testY;
      }

      enemy.x = clamp(enemy.x, BORDER + r, W - BORDER - r);
      enemy.y = clamp(enemy.y, BORDER + r, H - BORDER - r);

      if (this.isPointSafe(enemy.x, enemy.y)) {
        this.pushEnemyOutOfSafe(enemy);
      }
    }
  };

  Game.prototype.pushEnemyOutOfSafe = function (enemy) {
    var bestX = enemy.x, bestY = enemy.y;
    var found = false;

    for (var angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      for (var d = 1; d < 40; d += 2) {
        var tx = enemy.x + Math.cos(angle) * d;
        var ty = enemy.y + Math.sin(angle) * d;
        if (tx > BORDER + enemy.radius && tx < W - BORDER - enemy.radius &&
          ty > BORDER + enemy.radius && ty < H - BORDER - enemy.radius &&
          !this.isPointSafe(tx, ty)) {
          enemy.x = tx;
          enemy.y = ty;
          found = true;
          break;
        }
      }
      if (found) break;
    }
  };

  // ---- Collision Detection ----

  Game.prototype.checkCollisions = function () {
    var p = this.player;
    if (p.state !== PlayerState.DRAWING) return;

    var trailFull = p.getTrailWithCurrent();

    for (var e = 0; e < this.enemies.length; e++) {
      var enemy = this.enemies[e];
      var ecx = enemy.x, ecy = enemy.y;
      var er = enemy.radius;

      if (dist(ecx, ecy, p.x, p.y) < er + PLAYER_RADIUS) {
        this.playerDeath();
        return;
      }

      for (var i = 0; i < trailFull.length - 1; i++) {
        var a = trailFull[i], b = trailFull[i + 1];
        var d2 = pointToSegmentDistSq(ecx, ecy, a.x, a.y, b.x, b.y);
        if (d2 < er * er) {
          this.playerDeath();
          return;
        }
      }
    }

    if (trailFull.length >= 4) {
      var last = trailFull.length - 1;
      var ax = trailFull[last - 1].x, ay = trailFull[last - 1].y;
      var bx = trailFull[last].x, by = trailFull[last].y;

      for (var i = 0; i < last - 2; i++) {
        var cx = trailFull[i].x, cy = trailFull[i].y;
        var dx = trailFull[i + 1].x, dy = trailFull[i + 1].y;
        if (segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy)) {
          this.playerDeath();
          return;
        }
      }
    }
  };

  Game.prototype.playerDeath = function () {
    this.lives--;
    this.particles.emit(this.player.x, this.player.y, 20, COLORS.ENEMY, 50);
    this.sound.play('death');

    var spawnX = W / 2;
    var spawnY = BORDER / 2;
    this.player.reset(spawnX, spawnY);

    if (this.lives <= 0) {
      this.gameOver();
    }
  };

  // ---- Polygon Cutting ----

  Game.prototype.completeCut = function () {
    var p = this.player;
    var trail = p.getTrailWithCurrent();
    if (trail.length < 2) return;

    var snapStart = this.snapToSafeBoundary(trail[0].x, trail[0].y);
    var snapEnd = this.snapToSafeBoundary(trail[trail.length - 1].x, trail[trail.length - 1].y);
    if (snapStart) trail[0] = { x: snapStart.x, y: snapStart.y };
    if (snapEnd) trail[trail.length - 1] = { x: snapEnd.x, y: snapEnd.y };

    var cacheCtx = this.cache.ctx;

    cacheCtx.strokeStyle = '#ff0000';
    cacheCtx.lineWidth = 3;
    cacheCtx.lineCap = 'round';
    cacheCtx.lineJoin = 'round';
    cacheCtx.beginPath();
    cacheCtx.moveTo(trail[0].x, trail[0].y);
    for (var i = 1; i < trail.length; i++) cacheCtx.lineTo(trail[i].x, trail[i].y);
    cacheCtx.stroke();

    var imgData = cacheCtx.getImageData(0, 0, W, H);
    var pix = imgData.data;
    var grid = new Uint8Array(W * H);
    for (var i = 0; i < W * H; i++) {
      grid[i] = pix[i * 4] > 128 ? 1 : 0;
    }

    var regions = [];
    var regionMap = new Int32Array(W * H);
    for (var i = 0; i < regionMap.length; i++) regionMap[i] = -1;

    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var pos = y * W + x;
        if (grid[pos] === 0 && regionMap[pos] === -1) {
          var regionId = regions.length;
          var count = this.floodFillAndCount(grid, regionMap, W, H, x, y, regionId);
          var hasEnemy = false;
          for (var e = 0; e < this.enemies.length; e++) {
            var ex = clamp(Math.round(this.enemies[e].x), 0, W - 1);
            var ey = clamp(Math.round(this.enemies[e].y), 0, H - 1);
            if (regionMap[ey * W + ex] === regionId) { hasEnemy = true; break; }
          }
          regions.push({ id: regionId, count: count, hasEnemy: hasEnemy });
        }
      }
    }

    if (regions.length < 2) return;

    var enemyRegions = [];
    var noEnemyRegions = [];
    for (var r = 0; r < regions.length; r++) {
      if (regions[r].hasEnemy) enemyRegions.push(regions[r]);
      else noEnemyRegions.push(regions[r]);
    }

    var captureRegionIds = {};
    var capturedCount = 0;

    if (enemyRegions.length > 0) {
      var maxEnemyRegion = enemyRegions[0];
      for (var r = 1; r < enemyRegions.length; r++) {
        if (enemyRegions[r].count > maxEnemyRegion.count) maxEnemyRegion = enemyRegions[r];
      }
      for (var r = 0; r < regions.length; r++) {
        if (regions[r].id !== maxEnemyRegion.id) {
          captureRegionIds[regions[r].id] = true;
          capturedCount += regions[r].count;
        }
      }
    } else {
      var smallest = regions[0];
      for (var r = 1; r < regions.length; r++) {
        if (regions[r].count < smallest.count) smallest = regions[r];
      }
      captureRegionIds[smallest.id] = true;
      capturedCount = smallest.count;
    }

    if (capturedCount < 10) return;

    for (var i = 0; i < W * H; i++) {
      if (regionMap[i] >= 0 && captureRegionIds[regionMap[i]]) {
        grid[i] = 1;
      }
    }

    var newData = cacheCtx.createImageData(W, H);
    for (var i = 0; i < W * H; i++) {
      var v = grid[i] ? 255 : 0;
      newData.data[i * 4] = v;
      newData.data[i * 4 + 1] = 0;
      newData.data[i * 4 + 2] = 0;
      newData.data[i * 4 + 3] = 255;
    }
    cacheCtx.putImageData(newData, 0, 0);

    var killedEnemies = [];
    for (var i = this.enemies.length - 1; i >= 0; i--) {
      var en = this.enemies[i];
      var ex = clamp(Math.round(en.x), 0, W - 1);
      var ey = clamp(Math.round(en.y), 0, H - 1);
      if (regionMap[ey * W + ex] >= 0 && captureRegionIds[regionMap[ey * W + ex]]) {
        killedEnemies.push(this.enemies.splice(i, 1)[0]);
      }
    }

    for (var i = 0; i < killedEnemies.length; i++) {
      this.particles.emit(killedEnemies[i].x, killedEnemies[i].y, 15, COLORS.ENEMY, 40);
      this.score += 500;
    }

    var areaPercent = (capturedCount / this.totalArea) * 100;
    this.score += Math.round(areaPercent * 100);
    this.particles.emit(this.player.x, this.player.y, 10, COLORS.CAPTURED, 30);
    this.sound.play('capture');

    this.updateProgress();

    for (var i = 0; i < this.enemies.length; i++) {
      if (this.isPointSafe(this.enemies[i].x, this.enemies[i].y)) {
        this.pushEnemyOutOfSafe(this.enemies[i]);
      }
    }

    var level = LEVELS[this.currentLevel];
    if (this.progress >= level.winPercent) {
      this.levelComplete();
    }
  };

  Game.prototype.snapToSafeBoundary = function (px, py) {
    var best = null, bestDist = 20;
    for (var z = 0; z < this.safeZones.length; z++) {
      var poly = this.safeZones[z];
      var n = poly.length;
      for (var i = 0; i < n; i++) {
        var j = (i + 1) % n;
        var d = pointToSegmentDistSq(px, py, poly[i].x, poly[i].y, poly[j].x, poly[j].y);
        d = Math.sqrt(d);
        if (d < bestDist) {
          bestDist = d;
          var ax = poly[i].x, ay = poly[i].y, bx = poly[j].x, by = poly[j].y;
          var abx = bx - ax, aby = by - ay;
          var apx = px - ax, apy = py - ay;
          var ab2 = abx * abx + aby * aby;
          var t = ab2 > 0 ? Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2)) : 0;
          best = { x: ax + t * abx, y: ay + t * aby };
        }
      }
    }
    return best;
  };

  Game.prototype.floodFillAndCount = function (grid, regionMap, w, h, startX, startY, regionId) {
    var count = 0;
    var stack = [[startX, startY]];
    while (stack.length > 0) {
      var coord = stack.pop();
      var cx = coord[0], cy = coord[1];
      if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
      var cpos = cy * w + cx;
      if (grid[cpos] !== 0 || regionMap[cpos] !== -1) continue;
      regionMap[cpos] = regionId;
      count++;
      stack.push([cx + 1, cy]);
      stack.push([cx - 1, cy]);
      stack.push([cx, cy + 1]);
      stack.push([cx, cy - 1]);
    }
    return count;
  };

  Game.prototype.completeCutFallback = function (trail) {
    if (trail.length < 2) return;

    var cutCanvas = document.createElement('canvas');
    cutCanvas.width = W;
    cutCanvas.height = H;
    var cutCtx = cutCanvas.getContext('2d', { willReadFrequently: true });

    cutCtx.fillStyle = '#000000';
    cutCtx.fillRect(0, 0, W, H);

    cutCtx.fillStyle = '#ffffff';
    for (var i = 0; i < this.safeZones.length; i++) {
      var poly = this.safeZones[i];
      if (poly.length < 3) continue;
      cutCtx.beginPath();
      cutCtx.moveTo(poly[0].x, poly[0].y);
      for (var j = 1; j < poly.length; j++) cutCtx.lineTo(poly[j].x, poly[j].y);
      cutCtx.closePath();
      cutCtx.fill();
    }

    cutCtx.strokeStyle = '#ffffff';
    cutCtx.lineWidth = 3;
    cutCtx.lineCap = 'round';
    cutCtx.lineJoin = 'round';
    cutCtx.beginPath();
    cutCtx.moveTo(trail[0].x, trail[0].y);
    for (var i = 1; i < trail.length; i++) cutCtx.lineTo(trail[i].x, trail[i].y);
    cutCtx.stroke();

    var imgData = cutCtx.getImageData(0, 0, W, H);
    var pix = imgData.data;
    var grid = new Uint8Array(W * H);

    for (var i = 0; i < W * H; i++) {
      grid[i] = pix[i * 4] > 128 ? 1 : 0;
    }

    var regions = [];
    var regionMap = new Int32Array(W * H);
    for (var i = 0; i < regionMap.length; i++) regionMap[i] = -1;

    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var pos = y * W + x;
        if (grid[pos] === 0 && regionMap[pos] === -1) {
          var regionId = regions.length;
          var count = 0;
          var hasEnemy = false;
          var stack = [[x, y]];

          while (stack.length > 0) {
            var coord = stack.pop();
            var cx = coord[0], cy = coord[1];
            if (cx < 0 || cx >= W || cy < 0 || cy >= H) continue;
            var cpos = cy * W + cx;
            if (grid[cpos] !== 0 || regionMap[cpos] !== -1) continue;
            regionMap[cpos] = regionId;
            count++;
            stack.push([cx + 1, cy]);
            stack.push([cx - 1, cy]);
            stack.push([cx, cy + 1]);
            stack.push([cx, cy - 1]);
          }

          for (var e = 0; e < this.enemies.length; e++) {
            var ex = clamp(Math.round(this.enemies[e].x), 0, W - 1);
            var ey = clamp(Math.round(this.enemies[e].y), 0, H - 1);
            if (regionMap[ey * W + ex] === regionId) {
              hasEnemy = true;
              break;
            }
          }

          regions.push({ id: regionId, count: count, hasEnemy: hasEnemy });
        }
      }
    }

    if (regions.length < 2) return;

    var captureRegions = [];
    var totalDanger = 0;
    for (var r = 0; r < regions.length; r++) totalDanger += regions[r].count;

    for (var r = 0; r < regions.length; r++) {
      if (!regions[r].hasEnemy && regions[r].count < totalDanger * 0.8) {
        captureRegions.push(regions[r].id);
      }
    }

    if (captureRegions.length === 0) {
      var smallest = null;
      for (var r = 0; r < regions.length; r++) {
        if (!smallest || regions[r].count < smallest.count) {
          smallest = regions[r];
        }
      }
      if (smallest && smallest.count < totalDanger * 0.8) {
        captureRegions.push(smallest.id);
      }
    }

    if (captureRegions.length === 0) return;

    var capturedCount = 0;
    var captureSet = {};
    for (var c = 0; c < captureRegions.length; c++) captureSet[captureRegions[c]] = true;

    for (var i = 0; i < W * H; i++) {
      if (regionMap[i] >= 0 && captureSet[regionMap[i]]) {
        grid[i] = 1;
        capturedCount++;
      }
    }

    if (capturedCount < 10) return;

    var newData = this.cache.ctx.createImageData(W, H);
    for (var i = 0; i < W * H; i++) {
      var v = grid[i] ? 255 : 0;
      newData.data[i * 4] = v;
      newData.data[i * 4 + 1] = 0;
      newData.data[i * 4 + 2] = 0;
      newData.data[i * 4 + 3] = 255;
    }
    this.cache.ctx.putImageData(newData, 0, 0);

    var minX = W, minY = H, maxX = 0, maxY = 0;
    for (var y = BORDER; y < H - BORDER; y++) {
      for (var x = BORDER; x < W - BORDER; x++) {
        var pos = y * W + x;
        if (regionMap[pos] >= 0 && captureSet[regionMap[pos]]) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX > minX && maxY > minY) {
      this.safeZones.push([
        { x: minX, y: minY }, { x: maxX, y: minY },
        { x: maxX, y: maxY }, { x: minX, y: maxY }
      ]);
    }

    var killedEnemies = [];
    for (var i = this.enemies.length - 1; i >= 0; i--) {
      var en = this.enemies[i];
      var ex = clamp(Math.round(en.x), 0, W - 1);
      var ey = clamp(Math.round(en.y), 0, H - 1);
      var epos = ey * W + ex;
      if (regionMap[epos] >= 0 && captureSet[regionMap[epos]]) {
        killedEnemies.push(this.enemies.splice(i, 1)[0]);
      }
    }

    for (var i = 0; i < killedEnemies.length; i++) {
      this.particles.emit(killedEnemies[i].x, killedEnemies[i].y, 15, COLORS.ENEMY, 40);
      this.score += 500;
    }

    var areaPercent = (capturedCount / this.totalArea) * 100;
    this.score += Math.round(areaPercent * 100);
    this.particles.emit(this.player.x, this.player.y, 10, COLORS.CAPTURED, 30);
    this.sound.play('capture');

    this.updateProgress();

    for (var i = 0; i < this.enemies.length; i++) {
      if (this.isPointSafe(this.enemies[i].x, this.enemies[i].y)) {
        this.pushEnemyOutOfSafe(this.enemies[i]);
      }
    }

    var level = LEVELS[this.currentLevel];
    if (this.progress >= level.winPercent) {
      this.levelComplete();
    }
  };
  Game.prototype.wasPointSafeBefore = function (x, y) {
    for (var i = 0; i < this.safeZones.length; i++) {
      if (pointInPolygon(x, y, this.safeZones[i])) return true;
    }
    return false;
  };

  Game.prototype.floodFillGrid = function (grid, w, h, startX, startY, fillValue) {
    var stack = [[startX, startY]];
    while (stack.length > 0) {
      var coord = stack.pop();
      var x = coord[0], y = coord[1];
      if (x < 0 || x >= w || y < 0 || y >= h) continue;
      var pos = y * w + x;
      if (grid[pos] !== 0) continue;
      grid[pos] = fillValue;
      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }
  };

  Game.prototype.trySafeMerge = function () {
    if (this.safeZones.length < 2) return;

    try {
      var current = { regions: [polyToRegion(this.safeZones[0])], inverted: false };
      for (var i = 1; i < this.safeZones.length; i++) {
        var next = { regions: [polyToRegion(this.safeZones[i])], inverted: false };
        current = PolyBool.union(current, next);
      }

      if (current && current.regions && current.regions.length > 0) {
        var newZones = [];
        for (var i = 0; i < current.regions.length; i++) {
          var pts = regionToPoly(current.regions[i]);
          if (pts.length >= 3 && absArea(pts) > 10) {
            newZones.push(pts);
          }
        }
        if (newZones.length > 0) {
          this.safeZones = newZones;
        }
      }
    } catch (e) {
      // PolyBool union failed on degenerate geometry — keep existing zones
    }
  };

  // ---- Rendering ----

  Game.prototype.render = function () {
    var ctx = this.ctx;
    ctx.fillStyle = COLORS.BG;
    ctx.fillRect(0, 0, W, H);

    if (this.gameState === GameState.MENU) {
      this.renderMenu();
      this.updateUI();
      return;
    }

    this.renderSafeZones();
    this.renderEnemies();
    this.renderTrail();
    this.renderPlayer();
    this.particles.render(ctx);
    this.updateUI();

    if (this.gameState === GameState.PAUSED) this.renderOverlay('PAUSED', 'Press ESC to continue', 'rgba(0,0,0,0.7)');
    else if (this.gameState === GameState.LEVEL_COMPLETE) this.renderLevelComplete();
    else if (this.gameState === GameState.GAME_OVER) this.renderOverlay('GAME OVER', 'Score: ' + this.score + '  |  High: ' + this.highScore, 'rgba(50,0,0,0.8)');
    else if (this.gameState === GameState.VICTORY) this.renderVictory();
  };

  Game.prototype.renderSafeZones = function () {
    var ctx = this.ctx;
    var cacheData = this.cache.ctx.getImageData(0, 0, W, H);
    var pix = cacheData.data;

    ctx.fillStyle = this.textures.patterns.dirt;
    ctx.fillRect(0, 0, W, H);

    var maskData = this.maskImageData.data;
    for (var i = 0; i < W * H; i++) {
      var isSafe = pix[i * 4] > 128;
      var idx = i * 4;
      maskData[idx] = 255;
      maskData[idx + 1] = 255;
      maskData[idx + 2] = 255;
      maskData[idx + 3] = isSafe ? 255 : 0;
    }
    this.maskCtx.putImageData(this.maskImageData, 0, 0);

    this.grassCtx.clearRect(0, 0, W, H);
    this.grassCtx.fillStyle = this.textures.patterns.grass;
    this.grassCtx.fillRect(0, 0, W, H);
    this.grassCtx.globalCompositeOperation = 'destination-in';
    this.grassCtx.drawImage(this.maskCanvas, 0, 0);
    this.grassCtx.globalCompositeOperation = 'source-over';

    ctx.drawImage(this.grassCanvas, 0, 0);

    ctx.fillStyle = this.textures.patterns.wood;
    ctx.fillRect(0, 0, W, BORDER);
    ctx.fillRect(0, H - BORDER, W, BORDER);
    ctx.fillRect(0, BORDER, BORDER, H - 2 * BORDER);
    ctx.fillRect(W - BORDER, BORDER, BORDER, H - 2 * BORDER);

    var level = LEVELS[this.currentLevel];
    if (level.walls) {
      ctx.fillStyle = this.textures.patterns.stone;
      for (var w = 0; w < level.walls.length; w++) {
        var wall = level.walls[w];
        ctx.beginPath();
        ctx.moveTo(wall[0].x, wall[0].y);
        for (var j = 1; j < wall.length; j++) ctx.lineTo(wall[j].x, wall[j].y);
        ctx.closePath();
        ctx.fill();
      }
    }
  };

  Game.prototype.isBorderPoly = function (poly) {
    for (var i = 0; i < poly.length; i++) {
      var p = poly[i];
      if (p.x <= 0 || p.x >= W || p.y <= 0 || p.y >= H) return true;
    }
    return false;
  };

  Game.prototype.renderTrail = function () {
    var p = this.player;
    if (p.state !== PlayerState.DRAWING || p.trail.length === 0) return;

    var trail = p.getTrailWithCurrent();
    var ctx = this.ctx;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(61, 43, 31, 0.6)';
    ctx.beginPath();
    ctx.moveTo(trail[0].x + 1, trail[0].y + 1);
    for (var i = 1; i < trail.length; i++) {
      ctx.lineTo(trail[i].x + 1, trail[i].y + 1);
    }
    ctx.stroke();

    ctx.strokeStyle = COLORS.TRAIL;
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    for (var i = 1; i < trail.length; i++) {
      ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.stroke();
  };

  Game.prototype.renderPlayer = function () {
    var p = this.player;
    var ctx = this.ctx;
    var t = this.gameTime / 1000;
    var pulse = 0.9 + 0.1 * Math.sin(t * 6);

    ctx.fillStyle = 'rgba(61, 43, 31, 0.55)';
    ctx.beginPath();
    ctx.ellipse(p.x + 1.2, p.y + 2, PLAYER_RADIUS + 1, PLAYER_RADIUS * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d4a437';
    ctx.beginPath();
    ctx.arc(p.x, p.y, PLAYER_RADIUS + 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.PLAYER;
    ctx.beginPath();
    ctx.arc(p.x, p.y, (PLAYER_RADIUS + 1.4) * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f6c453';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, PLAYER_RADIUS + 2.6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(p.x - 0.8, p.y - 0.8, 1, 0, Math.PI * 2);
    ctx.fill();
  };

  Game.prototype.renderEnemies = function () {
    var ctx = this.ctx;
    var t = this.gameTime / 1000;

    for (var i = 0; i < this.enemies.length; i++) {
      var e = this.enemies[i];
      var wobble = Math.sin(t * 5 + i) * 0.4;
      var stretch = 0.85 + 0.15 * Math.sin(t * 3 + i);

      ctx.fillStyle = 'rgba(44, 24, 16, 0.4)';
      ctx.beginPath();
      ctx.ellipse(e.x + 0.5, e.y + e.radius + 2, e.radius * 0.8, e.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = COLORS.ENEMY;
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, e.radius + wobble, (e.radius + wobble) * stretch, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#b07cc6';
      ctx.beginPath();
      ctx.ellipse(e.x - 1.5, e.y - 2, e.radius * 0.45, e.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      var eyeOff = e.radius * 0.35;
      ctx.beginPath();
      ctx.arc(e.x - eyeOff, e.y - eyeOff * 0.6, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(e.x + eyeOff, e.y - eyeOff * 0.6, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2c1810';
      ctx.beginPath();
      ctx.arc(e.x - eyeOff + 0.6, e.y - eyeOff * 0.6, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(e.x + eyeOff + 0.6, e.y - eyeOff * 0.6, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  Game.prototype.updateUI = function () {
    this.elLives.textContent = this.lives;
    this.elLevel.textContent = this.currentLevel + 1;
    this.elProgress.textContent = this.progress;
    this.elScore.textContent = this.score;
  };

  Game.prototype.handleMenuClick = function (mx, my) {
    var cx = W / 2, cy = H / 2;
    var diffY = cy + 10;
    var enemyY = cy + 75;
    var startY = cy + 150;

    if (my > diffY - 18 && my < diffY + 18) {
      for (var d = 0; d < 3; d++) {
        var dx = cx - 140 + d * 140;
        if (mx > dx - 50 && mx < dx + 50) {
          this.difficulty = d;
          this.menuSelection = 0;
          return;
        }
      }
    }

    if (my > enemyY - 18 && my < enemyY + 18) {
      this.menuSelection = 1;
      if (mx < cx - 40) {
        this.customEnemies = Math.max(0, this.customEnemies - 1);
      } else if (mx > cx + 40) {
        this.customEnemies = Math.min(20, this.customEnemies + 1);
      }
      return;
    }

    if (my > startY - 22 && my < startY + 22) {
      this.startGame();
    }
  };

  Game.prototype.renderMenu = function () {
    var ctx = this.ctx;
    var cx = W / 2, cy = H / 2;
    var t = this.gameTime / 1000;
    var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#3a4f6b');
    skyGrad.addColorStop(0.5, '#5c4a3b');
    skyGrad.addColorStop(1, '#2c1810');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    for (var i = 0; i < 28; i++) {
      var sx = (Math.sin(t * 0.3 + i * 0.6) * 120 + cx + i * 22) % W;
      var sy = ((i * 14 + t * 18) % (H * 0.7)) + 40;
      var flicker = 0.35 + Math.sin(t * 4 + i) * 0.2;
      ctx.fillStyle = 'rgba(255, 224, 102, ' + flicker + ')';
      ctx.beginPath();
      ctx.arc(sx, sy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 64px "Rajdhani", sans-serif';
    ctx.fillStyle = '#3d2b1f';
    ctx.fillText('XONIX', cx + 3, cy - 120 + 3);
    ctx.fillStyle = '#d4a437';
    ctx.fillText('XONIX', cx, cy - 120);

    ctx.font = 'italic 18px "Rajdhani", sans-serif';
    ctx.fillStyle = 'rgba(253, 246, 227, 0.8)';
    ctx.fillText('~ Farm Defense ~', cx, cy - 85);

    ctx.font = 'bold 16px "Rajdhani", sans-serif';
    ctx.fillStyle = '#f5e7c9';
    ctx.fillText('HIGH SCORE: ' + this.highScore, cx, cy - 55);

    ctx.fillStyle = '#6b4423';
    ctx.fillRect(cx - 210, cy - 15, 420, 150);
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 210, cy - 15, 420, 150);
    ctx.strokeStyle = 'rgba(255, 239, 213, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 208, cy - 13, 416, 146);

    var diffY = cy + 10;
    var diffNames = ['EASY', 'NORMAL', 'HARD'];
    ctx.font = '14px "Rajdhani", sans-serif';
    ctx.fillStyle = this.menuSelection === 0 ? COLORS.TEXT : 'rgba(253, 246, 227, 0.6)';
    ctx.fillText('DIFFICULTY', cx, diffY - 25);

    for (var d = 0; d < 3; d++) {
      var dx = cx - 140 + d * 140;
      var isSelected = (this.difficulty === d);
      ctx.fillStyle = isSelected ? '#5a9a44' : 'rgba(61, 43, 31, 0.4)';
      ctx.fillRect(dx - 50, diffY - 14, 100, 28);
      ctx.strokeStyle = isSelected ? '#d4a437' : 'rgba(255, 239, 213, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(dx - 50, diffY - 14, 100, 28);
      ctx.font = isSelected ? 'bold 17px "Rajdhani", sans-serif' : '16px "Rajdhani", sans-serif';
      ctx.fillStyle = isSelected ? '#fdf6e3' : 'rgba(253, 246, 227, 0.6)';
      ctx.fillText(diffNames[d], dx, diffY);
    }

    var enemyY = cy + 75;
    ctx.font = '14px "Rajdhani", sans-serif';
    ctx.fillStyle = this.menuSelection === 1 ? COLORS.TEXT : 'rgba(253, 246, 227, 0.6)';
    ctx.fillText('ENEMIES', cx, enemyY - 22);

    ctx.font = 'bold 24px "Rajdhani", sans-serif';
    ctx.fillStyle = '#f5e7c9';
    ctx.fillText('<', cx - 80, enemyY);
    ctx.fillText('>', cx + 80, enemyY);

    var enemyLabel = this.customEnemies === 0 ? 'AUTO' : '' + this.customEnemies;
    ctx.font = this.customEnemies === 0 ? 'bold 20px "Rajdhani", sans-serif' : 'bold 24px "Rajdhani", sans-serif';
    ctx.fillStyle = this.customEnemies === 0 ? 'rgba(253, 246, 227, 0.8)' : COLORS.ENEMY;
    ctx.fillText(enemyLabel, cx, enemyY);

    var panelY = cy + 140;
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(cx - 170, panelY - 18, 340, 36);
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 170, panelY - 18, 340, 36);

    var pulse = 0.5 + 0.5 * Math.sin(t * 3);
    if (Math.floor(this.gameTime / 400) % 2 === 0) {
      ctx.font = 'bold 18px "Rajdhani", sans-serif';
      ctx.fillStyle = 'rgba(255, 224, 102, ' + (0.7 + pulse * 0.3) + ')';
      ctx.fillText('PRESS SPACE TO START', cx, panelY);
    }

    ctx.font = '13px "Rajdhani", sans-serif';
    ctx.fillStyle = 'rgba(253, 246, 227, 0.6)';
    ctx.fillText('← → adjust  ↑ ↓ select  SPACE start', cx, cy + 190);
    ctx.fillText('WASD / Arrow Keys / Swipe to move', cx, cy + 210);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  };

  Game.prototype.renderOverlay = function (title, sub, bg) {
    var ctx = this.ctx;
    var cx = W / 2, cy = H / 2;

    ctx.fillStyle = 'rgba(44, 24, 16, 0.8)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#6b4423';
    ctx.fillRect(cx - 240, cy - 105, 480, 210);
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 4;
    ctx.strokeRect(cx - 240, cy - 105, 480, 210);
    ctx.strokeStyle = 'rgba(255, 239, 213, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 238, cy - 103, 476, 206);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 46px "Rajdhani", sans-serif';
    ctx.fillStyle = '#3d2b1f';
    ctx.fillText(title, cx + 2, cy - 20 + 2);
    ctx.fillStyle = COLORS.TEXT;
    ctx.fillText(title, cx, cy - 20);

    ctx.font = '18px "Rajdhani", sans-serif';
    ctx.fillStyle = 'rgba(253, 246, 227, 0.85)';
    ctx.fillText(sub, cx, cy + 30);

    if (Math.floor(this.gameTime / 400) % 2 === 0) {
      var pulse = 0.5 + 0.5 * Math.sin(this.gameTime / 250);
      ctx.font = 'bold 16px "Rajdhani", sans-serif';
      ctx.fillStyle = 'rgba(255, 224, 102, ' + (0.6 + pulse * 0.4) + ')';
      ctx.fillText('PRESS SPACE', cx, cy + 80);
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  };

  Game.prototype.renderLevelComplete = function () {
    var ctx = this.ctx;
    var cx = W / 2, cy = H / 2;
    var level = LEVELS[this.currentLevel];
    var t = this.gameTime / 1000;

    ctx.fillStyle = 'rgba(44, 24, 16, 0.85)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#6b4423';
    ctx.fillRect(cx - 270, cy - 125, 540, 250);
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 5;
    ctx.strokeRect(cx - 270, cy - 125, 540, 250);
    ctx.strokeStyle = 'rgba(255, 239, 213, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 268, cy - 123, 536, 246);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 40px "Rajdhani", sans-serif';
    ctx.fillStyle = '#3d2b1f';
    ctx.fillText('LEVEL COMPLETE!', cx + 2, cy - 65 + 2);
    ctx.fillStyle = COLORS.PLAYER;
    ctx.fillText('LEVEL COMPLETE!', cx, cy - 65);

    ctx.font = '20px "Rajdhani", sans-serif';
    ctx.fillStyle = 'rgba(253, 246, 227, 0.85)';
    ctx.fillText('"' + level.name + '" Cleared', cx, cy - 25);

    ctx.font = 'bold 18px "Rajdhani", sans-serif';
    ctx.fillStyle = '#e2c36b';
    ctx.fillText('Captured: ' + this.progress + '%', cx, cy + 15);
    ctx.fillText('Score: ' + this.score, cx, cy + 45);

    var pulse = 0.5 + 0.5 * Math.sin(t * 3);
    if (Math.floor(this.gameTime / 400) % 2 === 0) {
      ctx.font = 'bold 16px "Rajdhani", sans-serif';
      ctx.fillStyle = 'rgba(255, 224, 102, ' + (0.6 + pulse * 0.4) + ')';
      ctx.fillText('PRESS SPACE FOR NEXT LEVEL', cx, cy + 95);
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  };

  Game.prototype.renderVictory = function () {
    var ctx = this.ctx;
    var cx = W / 2, cy = H / 2;
    var t = this.gameTime / 1000;

    var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#3a4f6b');
    skyGrad.addColorStop(0.5, '#6a4b2a');
    skyGrad.addColorStop(1, '#2c1810');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    for (var i = 0; i < 40; i++) {
      var sx = (Math.sin(t * 0.5 + i * 0.3) * 150 + cx + i * 15) % W;
      var sy = ((i * 10 + t * 25) % H);
      ctx.fillStyle = 'rgba(255, 224, 102, ' + (0.45 + Math.sin(t * 3 + i) * 0.25) + ')';
      ctx.beginPath();
      ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#6b4423';
    ctx.fillRect(cx - 270, cy - 125, 540, 250);
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 5;
    ctx.strokeRect(cx - 270, cy - 125, 540, 250);
    ctx.strokeStyle = 'rgba(255, 239, 213, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 268, cy - 123, 536, 246);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    var pulse = 0.8 + 0.2 * Math.sin(t * 4);
    ctx.font = 'bold 54px "Rajdhani", sans-serif';
    ctx.fillStyle = '#3d2b1f';
    ctx.fillText('VICTORY!', cx + 2, cy - 60 + 2);
    ctx.fillStyle = COLORS.PLAYER;
    ctx.fillText('VICTORY!', cx, cy - 60);

    ctx.font = '22px "Rajdhani", sans-serif';
    ctx.fillStyle = COLORS.TEXT;
    ctx.fillText('All Levels Cleared!', cx, cy - 10);

    ctx.font = 'bold 20px "Rajdhani", sans-serif';
    ctx.fillStyle = '#e2c36b';
    ctx.fillText('FINAL SCORE: ' + this.score, cx, cy + 30);

    if (this.score >= this.highScore) {
      ctx.font = 'bold 18px "Rajdhani", sans-serif';
      ctx.fillStyle = '#5a9a44';
      ctx.fillText('★ NEW HIGH SCORE! ★', cx, cy + 65);
    }

    if (Math.floor(this.gameTime / 400) % 2 === 0) {
      ctx.font = 'bold 16px "Rajdhani", sans-serif';
      ctx.fillStyle = 'rgba(255, 224, 102, ' + (0.6 + pulse * 0.4) + ')';
      ctx.fillText('PRESS SPACE', cx, cy + 105);
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  };

  // ---- Init ----
  window.addEventListener('DOMContentLoaded', function () {
    window.game = new Game();
  });

})();
