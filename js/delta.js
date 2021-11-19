var Delta = function(morganaId) {

    'use strict';

  //===============================================================================================
  // CONSTANTS
  //===============================================================================================
var cWIDTH = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

var cHEIGHT = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

var HEIGHT = cHEIGHT;
var WIDTH = HEIGHT /16*9;

if (cWIDTH > WIDTH){
    document.getElementById("scoreboard").style.width = WIDTH + "px";
}else{
    WIDTH = cWIDTH;
}

  var FPS      = 60,
      // WIDTH    = 1024,
      // HEIGHT   = 768,
      RATIO    = WIDTH/HEIGHT,
      HITBOX   = 1,
      COOLDOWN = 15,
      alienCOOLDOWN = 60,
      jumpCOOLDOWN = 1,
      // godCooldown = 180,
      godCooldown = 180,
      reviveCooldown = 60,
      pressedUp = false,
      HSPEED   = 200,
      VSPEED   = 300,
      dVSPEED  = 0,
      thrust   = 300,
      GRAVITY  = 10,
      PLAYER   = { X: 50, Y: 150, W: 128,  H: 128, BULLET_SPEED: 1000 },
      ALIEN    = {                W: 32,  H: 32, BULLET_SPEED: { MIN: 400, MAX: 600 } },
      ROCK     = {                W: 256, H: 128, DX: -375 },
      playerCanvas, playerCtx


      document.getElementById("delta").style.width = WIDTH + "px";
      document.getElementById("delta").style.height = HEIGHT + "px";

      console.log(WIDTH);
      console.log(HEIGHT);



  //===============================================================================================
  // CONFIGURATION
  //===============================================================================================

  var cfg = {

    // fpsmeter: { anchor: 'delta', decimals: 0, graph: true, heat: true, theme: 'dark', left: 'auto', right: '-120px' },

    images: [
      { id: "sprites", url: "images/sprites.png" },
      { id: "aliens",  url: "images/aliens.png"  },
      { id: "rocks",   url: "images/rocks.png"   },
      { id: "bullets", url: "images/bullets.png" },
      { id: "player", url: "images/bullets.png" },
      { id: "player1", url: "images/morgana/"+morganaId+".png" },
      { id: "bg_Mo_fair", url: "images/bg_Mo_fair.png" },
      { id: "bg_Mo_middle", url: "images/bg_Mo_middle.png" },
      { id: "bg_Mo_close", url: "images/bg_Mo_close.png" },
      { id: "energy_ball", url: "images/attack/energy_ball.png" },
      { id: "fire", url: "images/attack/fireball1.png" },
      { id: "ice", url: "images/attack/icespike1.png" }
    ],

    sounds: [
      { id: "title",   name: "sounds/title",   formats: ['mp3'], volume: 1,  loop: true },
      { id: "game",    name: "sounds/game",    formats: ['mp3'], volume: 0.25,  loop: true },
      { id: "shoot",   name: "sounds/shoot",   formats: ['mp3'], volume: 0.03, pool: 5 },
      { id: "explode", name: "sounds/explode", formats: ['mp3'], volume: 0.10, pool: 5 }
    ],

    state: {
      events: [
        { name: 'boot',    from: ['none'],                 to: 'booting'   },
        { name: 'booted',  from: ['booting'],              to: 'title'     },
        { name: 'start',   from: ['title'],                to: 'preparing' },
        { name: 'play',    from: ['preparing'],            to: 'playing'   },
        { name: 'quit',    from: ['preparing', 'playing'], to: 'title'     }
      ]
    },

    keys: [
      { key: Game.Key.SPACE,                    mode: 'up',   state: 'title',                  action: function() { engine.start();             } },
      { key: Game.Key.ESC,                      mode: 'up',   state: 'playing',                action: function() { engine.quit();              } },
      { key: [Game.Key.SPACE],      mode: 'down', state: ['preparing', 'playing'], action: function() { player.movingUp    = pressedUp ? false : true;  pressedUp = true; } },
      { key: [Game.Key.SPACE],      mode: 'up',   state: ['preparing', 'playing'], action: function() { player.movingUp    = false; pressedUp = false;} },
    ],

    stars: [
      { x: -(1052/2-WIDTH/2), y: 0, speed: { min:   0, max:   0 }, image: "bg_Mo_fair" }, // 1 in 3 get a tint of red
      {  x: 0, y: 0, speed: { min:   16, max:  16 }, image: "bg_Mo_middle" },
      {  x: 1052, y: 0, speed: { min:   16, max:  16 }, image: "bg_Mo_middle" },
      {  x: 0, y: 0, speed: { min: 32, max: 32 }, image: "bg_Mo_close" },
      {  x: 1052, y: 0, speed: { min: 32, max: 32 }, image: "bg_Mo_close" },
    ],

    sprites: {

      player: { fps: 20, frames: [
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
                                  { x: 0, y: 0, w: 101, h: 101 },
      ] },

      thrust: { fps: 20, frames: [ { x: 134, y: 18, w: 32, h: 32 },
                                   { x: 167, y: 18, w: 32, h: 32 },
                                   { x: 200, y: 18, w: 32, h: 32 },
                                   { x: 233, y: 18, w: 32, h: 32 },
                                   { x: 233, y: 18, w: 32, h: 32 },
                                   { x: 200, y: 18, w: 32, h: 32 },
                                   { x: 167, y: 18, w: 32, h: 32 },
                                   { x: 134, y: 18, w: 32, h: 32 } ] },

      alien1: { fps: 5, frames: [ //phantam
                                    { x: (0*34) + 1, y: 0+1, w: 32, h: 32 },
                                    { x: (1*34) + 1, y: 0+1, w: 32, h: 32 },
                                    { x: (2*34) + 1, y: 0+1, w: 32, h: 32 },
                                    { x: (3*34) + 1, y: 0+1, w: 32, h: 32 },
                                    { x: (4*34) + 1, y: 0+1, w: 32, h: 32 },
                                    { x: (5*34) + 1, y: 0+1, w: 32, h: 32 },
                                    { x: (6*34) + 1, y: 0+1, w: 32, h: 32 },
                                    { x: (7*34) + 1, y: 0+1, w: 32, h: 32 }
                                  ] },

      alien2: { fps: 5, frames: [ //pumpkin
                                    { x: (0*34) + 1, y: 64+1, w: 32, h: 32 },
                                    { x: (1*34) + 1, y: 64+1, w: 32, h: 32 },
                                    { x: (2*34) + 1, y: 64+1, w: 32, h: 32 },
                                    { x: (3*34) + 1, y: 64+1, w: 32, h: 32 },
                                    { x: (4*34) + 1, y: 64+1, w: 32, h: 32 },
                                    { x: (5*34) + 1, y: 64+1, w: 32, h: 32 },
                                    { x: (6*34) + 1, y: 64+1, w: 32, h: 32 },
                                    { x: (7*34) + 1, y: 64+1, w: 32, h: 32 }
                                  ] },

      alien3: { fps: 5, frames: [ //ghost fire
                                   { x: (0*34) + 1, y: 32+1, w: 32, h: 32 },
                                   { x: (1*34) + 1, y: 32+1, w: 32, h: 32 },
                                   { x: (2*34) + 1, y: 32+1, w: 32, h: 32 },
                                   { x: (3*34) + 1, y: 32+1, w: 32, h: 32 },
                                   { x: (4*34) + 1, y: 32+1, w: 32, h: 32 },
                                   { x: (5*34) + 1, y: 32+1, w: 32, h: 32 },
                                   { x: (6*34) + 1, y: 32+1, w: 32, h: 32 },
                                   { x: (7*34) + 1, y: 32+1, w: 32, h: 32 }
                                  ] },

      explosion: { fps: 15, frames: [
        { x: 247, y: 302, w: 18, h: 18 },
        { x: 217, y: 296, w: 28, h: 28 },
        { x: 182, y: 294, w: 32, h: 32 },
        { x: 146, y: 294, w: 32, h: 32 },
        { x: 109, y: 294, w: 32, h: 32 },
        { x:  72, y: 294, w: 32, h: 32 }
      ]},

      bullet1: { fps: 10, frames: [
        { x: (0), y: 0, w: 50, h: 50 },
        { x: (0), y: 0, w: 50, h: 50 },
        { x: (0), y: 0, w: 50, h: 50 },
        { x: (0), y: 0, w: 50, h: 50 },
        { x: (0), y: 0, w: 50, h: 50 },
        { x: (0), y: 0, w: 50, h: 50 }
      ]},

      bullet2: { fps: 10, frames: [
        { x: (0 * 14), y: 14 + 1, w: 14, h: 12 },
        { x: (1 * 14), y: 14 + 1, w: 14, h: 12 },
        { x: (2 * 14), y: 14 + 1, w: 14, h: 12 },
        { x: (3 * 14), y: 14 + 1, w: 14, h: 12 },
        { x: (4 * 14), y: 14 + 1, w: 14, h: 12 },
        { x: (5 * 14), y: 14 + 1, w: 14, h: 12 }
      ]},

      rock: { fps: 10, frames: [
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (1 * 65), y: 1, w: 65, h: 32 },
              { x: (1 * 65), y: 1, w: 65, h: 32 },
              { x: (2 * 65), y: 1, w: 65, h: 32 },
              { x: (2 * 65), y: 1, w: 65, h: 32 },
              { x: (3 * 65), y: 1, w: 65, h: 32 },
              { x: (3 * 65), y: 1, w: 65, h: 32 },
              { x: (3 * 65), y: 1, w: 65, h: 32 },
              { x: (3 * 65), y: 1, w: 65, h: 32 },
              { x: (3 * 65), y: 1, w: 65, h: 32 },
              { x: (2 * 65), y: 1, w: 65, h: 32 },
              { x: (2 * 65), y: 1, w: 65, h: 32 },
              { x: (1 * 65), y: 1, w: 65, h: 32 },
              { x: (1 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
              { x: (0 * 65), y: 1, w: 65, h: 32 },
      ]}

    }

  };

  //===============================================================================================
  // VARIABLES
  //===============================================================================================

  var engine,
      renderer,
      sounds,
      player,
      bullets,
      aliens,
      rocks,
      effects,
      stars;

  //===============================================================================================
  // SETUP
  //===============================================================================================

  function run() {

    run.engine   = engine   = new Engine();
    run.renderer = renderer = new Renderer();
    run.sounds   = sounds   = new Sounds();
    run.player   = player   = new Player();
    run.bullets  = bullets  = new Bullets();
    run.aliens   = aliens   = new Aliens();
    run.rocks    = rocks    = new Rocks();
    run.effects  = effects  = new Effects();
    run.stars    = stars    = new Stars();

    Game.run({
      fps:       FPS,
      // fpsmeter:  cfg.fpsmeter,
      update:    engine.update.bind(engine),
      render:    engine.render.bind(engine)
    });

    engine.boot();

          document.getElementById("delta").style.width = WIDTH + "px";
          document.getElementById("delta").style.height = HEIGHT + "px";


    document.getElementById('delta').addEventListener('click', event => {
      if(engine.isTitle()){
        engine.start();
      }
    });

    document.getElementById('delta').addEventListener('mousedown', event => {
      if(engine.current === 'playing' || engine.current === 'preparing'){
        player.movingUp = true;
        pressedUp = true
      }
    });

    document.getElementById('delta').addEventListener('mouseup', event => {
      if(engine.current === 'playing' || engine.current === 'preparing'){
        player.movingUp = false;
        pressedUp = false;
      }
    });

    document.getElementById('delta').addEventListener("touchstart", function(){

      if(engine.current === 'playing' || engine.current === 'preparing'){
        player.movingUp = true;
        pressedUp = true
      }
    }, false);
    document.getElementById('delta').addEventListener("touchend", function(){

      if(engine.current === 'playing' || engine.current === 'preparing'){
        player.movingUp = false;
        pressedUp = false
      }
    }, false);

  }

  //===============================================================================================
  // GAME ENGINE
  //===============================================================================================

  var Engine = Class.create({

    initialize: function() {
      StateMachine.create(cfg.state, this);
      PubSub.enable(this);
      Game.Key.map(cfg.keys, this);
      this.storage = Game.storage();
    },

    isBooting:   function() { return this.is('booting') || this.is('none'); },
    isTitle:     function() { return this.is('title');                      },
    isPreparing: function() { return this.is('preparing');                  },
    isPlaying:   function() { return this.is('playing');                    },

    onboot: function() {
      Game.Load.resources(cfg.images, cfg.sounds, function(resources) {
        renderer.reset(resources.images);
        sounds.reset(resources.sounds);
        engine.booted();
      });
    },

    onstart: function() {
      player.reset(true);
      bullets.reset();
      aliens.reset();
      rocks.reset();
      effects.reset();
      // stars.reset();
      setTimeout(this.play.bind(this), 2000);
    },

    onenterbooting:   function() { $('booting').show();                                              },
    onleavebooting:   function() { $('booting').hide();                                              },
    onentertitle:     function() { $('title').fadein();  $('start').show(); sounds.playTitleMusic(); window.closeNav(); $('cn-wrapper').fadeout(); $('cn-button').fadeout();  },
    onleavetitle:     function() { $('title').fadeout(); $('start').hide();                          },
    onenterpreparing: function() { $('prepare').fadein(); sounds.playGameMusic();$('cn-wrapper').show();$('cn-button').fadein();window.openNav();                  },
    onleavepreparing: function() { $('prepare').fadeout(); },

    onenterstate: function(event, from, to) {

      console.log(document.getElementById("delta").style.width);
      console.log(document.getElementById("delta").style.height);
      $('delta').removeClassName(from);
      $('delta').addClassName(to);
    },

    update: function(dt) {
      if (this.isPreparing()) {
        stars.update(dt);
        player.update(dt);
        bullets.update(dt);
        rocks.update(dt);
      }
      else if (this.isPlaying()) {
        stars.update(dt);
        player.update(dt);
        bullets.update(dt);
        aliens.update(dt);
        rocks.update(dt);
        effects.update(dt);
        this.detectCollisions();
      }else if (this.isTitle()){
          stars.update(dt);
      }
    },

    render: function(dt) {
      renderer.clear();
      if (this.isPreparing() || this.isPlaying()) {
        renderer.renderStars(dt);
        renderer.renderPlayer(dt);
        renderer.renderAliens(dt);
        renderer.renderRocks(dt);
        renderer.renderBullets(dt);
        renderer.renderEffects(dt);
      }else if(this.isTitle()){
          renderer.renderStars(dt);
      }
    },

    detectCollisions: function() { // UGH. HIDEOUS CODE. DON'T LOOK AT ME!

      var a, b, r, maxAliens, maxBullets, maxRocks, alien, bullet, rock;

      // check if any aliens hit the player or were hit by a player bullet
      for(a = 0, maxAliens = aliens.aliens.length ; a < maxAliens ; a++) {
        alien = aliens.aliens[a];
        if (!alien.dead) {
          if (!player.godMode && !player.dead && Game.Math.overlap(player.x + HITBOX, player.y + HITBOX, player.w - 2*HITBOX, player.h - 2*HITBOX,
                                                alien.x  + HITBOX, alien.y  + HITBOX, alien.w  - 2*HITBOX, alien.h  - 2*HITBOX)) {
            effects.explode(10, player.x + player.w/2, player.y + player.h/2, player.dx, player.dy);
            player.die();
            aliens.die(alien);
            sounds.explode();
          }
          for(b = 0, maxBullets = bullets.pool.allocated() ; b < maxBullets ; b++) {
            bullet = bullets.pool.store[b];
            if ( alien.acceptAttack.indexOf(bullet.attack) !== -1 && bullet.player && Game.Math.overlap(bullet.x, bullet.y, bullet.size, bullet.size,
                                                   alien.x,  alien.y,  alien.w,  alien.h)) {
              effects.explode(1, alien.x + alien.w/2, alien.y + alien.h/2, alien.dx, alien.dy);
              aliens.die(alien);
              bullets.die(bullet);
              sounds.explode();
              b--;
              maxBullets--;
              player.increaseScore(alien.score);
            }
          }
        }
      }

      // check if any alien bullets hit the player
      for(b = 0, maxBullets = bullets.pool.allocated() ; b < maxBullets ; b++) {
        bullet = bullets.pool.store[b];
        if (!player.godMode && !bullet.player && !player.dead && Game.Math.overlap(bullet.x, bullet.y, bullet.size, bullet.size,
                                                                player.x + HITBOX, player.y + HITBOX, player.w - 2*HITBOX, player.h - 2*HITBOX)) {
          effects.explode(10, player.x + player.w/2, player.y + player.h/2, player.dx, player.dy);
          player.die();
          bullets.die(bullet);
          sounds.explode();
        }
      }

      // check if the player hit any rocks
      for(r = 0, maxRocks = rocks.rocks.length ; r < maxRocks ; r++) {
        rock = rocks.rocks[r];
        if (!player.godMode && rock.enabled && !player.dead && Game.Math.overlap(rock.x + rock.hitbox.x, rock.y + (rock.top ? 0 : rock.hitbox.y), rock.w - (2*rock.hitbox.x), rock.h - rock.hitbox.y,
                                                              player.x + HITBOX, player.y + HITBOX, player.w - 2*HITBOX, player.h - 2*HITBOX)) {
          effects.explode(10, player.x + player.w/2, player.y + player.h/2, player.dx, player.dy);
          player.die();
          sounds.explode();
        }
      }

      // check if any player bullets hit any rocks
      for(b = 0, maxBullets = bullets.pool.allocated() ; b < maxBullets ; b++) {
        bullet = bullets.pool.store[b];
        if (bullet.player) {
          for(r = 0, maxRocks = rocks.rocks.length ; r < maxRocks ; r++) {
            rock = rocks.rocks[r];
            if (rock.enabled && Game.Math.overlap(rock.x + rock.hitbox.x, rock.y + (rock.top ? 0 : rock.hitbox.y), rock.w - (2*rock.hitbox.x), rock.h - rock.hitbox.y,
                                                  bullet.x, bullet.y, bullet.size, bullet.size)) {
              bullets.die(bullet);
            }
          }
        }
      }

    }

  });

  //===============================================================================================
  // PLAYER
  //===============================================================================================

  var Player = Class.create({

    reset: function(hard) {
      this.dead   = false;
      this.x      = PLAYER.X;
      this.y      = PLAYER.Y;
      this.w      = PLAYER.W;
      this.h      = PLAYER.H;
      this.dx     = 0;
      this.dy     = 0;
      this.miny   = 0;
      this.maxy   = HEIGHT-PLAYER.W+20;
      this.minx   = 20;
      this.maxx   = WIDTH/2-PLAYER.W;
      this.sprite = cfg.sprites.player;
      this.thrust = { sprite: cfg.sprites.thrust };
      this.godCooldown = godCooldown;
      this.godMode = true;
      this.attack = this.attack ? this.attack : 'ice';
      if (hard) {
        this.setScore(0);
        this.setLives(3);
      }
      Game.animate(this);
      Game.animate(this.thrust);

    },

    setLives: function(n) {
      this.lives = Math.max(0, n);
      var ele = $$('#scoreboard .lives')[0];
      ele.toggleClassName('zero',  this.lives === 0);
      ele.toggleClassName('one',   this.lives === 1);
      ele.toggleClassName('two',   this.lives === 2);
      ele.toggleClassName('three', this.lives === 3);
    },

    setScore: function(s) {
      var label = ("000000" + Math.floor(s)).slice(-5);
      this.score = s;
      $$('#scoreboard .score .value')[0].update(label);
    },

    increaseScore: function(s) {
      this.setScore(this.score + s);
    },

    update: function(dt) {
      if (!this.dead) {
        Game.animate(this);
        Game.animate(this.thrust);
        this.dx = (this.movingLeft ? -HSPEED : this.movingRight ? HSPEED : 0);
        if(this.movingUp && !this.jumpCOOLDOWN){
          this.dy = -thrust;
          this.jumpCOOLDOWN = jumpCOOLDOWN;
          this.movingUp = false;
          this.anim.frame = 0;
        }else{
          this.dy += GRAVITY;
        }

        if (this.jumpCOOLDOWN){
          this.jumpCOOLDOWN--;
        }
        this.x  = Game.Math.bound(this.x  + (dt * this.dx), this.minx, this.maxx);
        this.y  = Game.Math.bound(this.y  + (dt * this.dy), this.miny, this.maxy);
        if(this.y >= this.maxy){
          // this.y = this.maxy;
          this.die();
          effects.explode(5, player.x + player.w/2, player.y + player.h/2, 10, 10);
          sounds.explode();
            this.x = player.X;
            this.y = player.Y;
        }

        if (!this.cooldown) {
          sounds.shoot();
          bullets.fire(this, this.x + this.w, this.y + this.h/2);
          this.cooldown = COOLDOWN;
        }
        if (this.cooldown)
          this.cooldown--;
        if (this.godCooldown){
            this.godCooldown--;
        }else{
            this.godMode = false;
        }

        // console.log(this.movingUp);
      }

        if (this.dead && this.reviveCooldown > 0 && this.lives > 0){
            this.reviveCooldown--;
        }else if(this.dead && this.reviveCooldown >= 0 && this.lives > 0){
            this.reset();
        }
    },

    die: function() {
        if(!this.godMode || this.y >= this.maxy){
            this.dead = true;
            this.setLives(this.lives-1);
            this.anim.frame = 0;
            this.reviveCooldown = reviveCooldown;
            if (!this.lives){
                updateScore(this.score, 'getScore');
                setTimeout(engine.quit.bind(engine), 4000);
            }
        }
    }

  });

  //===============================================================================================
  // BULLETS
  //===============================================================================================

  var Bullet = Class.create({

    initialize: function(entity, x, y) {
      this.player = (entity == player);
      this.x      = x;
      this.y      = y;
      this.size   = this.player ? 50 : Game.Math.randomInt(8, 16);
      this.image  = this.player ? player.attack: "bullets";
      this.attack  = this.player ? player.attack: false;
      this.sprite = this.player ? cfg.sprites.bullet1 : cfg.sprites.bullet2;
      this.speed  = this.player ? PLAYER.BULLET_SPEED : (x > player.x ? -1 : -1) * Game.Math.random(ALIEN.BULLET_SPEED.MIN, ALIEN.BULLET_SPEED.MAX);
      Game.animate(this);
    }

  });

  var Bullets = Class.create({

    reset: function() {
      this.pool = new ObjectPool(Bullet, {
        name: 'bullets',
        size: 100,
        initializer: Bullet.prototype.initialize
      });
    },

    fire: function(entity, x, y) {
      var bullet = this.pool.allocate(entity, x, y);
    },

    die: function(bullet) {
      this.pool.free(bullet);
    },

    update: function(dt) {

        // console.log(this.image);
      var n, max, bullet;
      for(n = 0, max = this.pool.allocated() ; n < max ; n++) {
        bullet = this.pool.store[n];
        bullet.x = bullet.x + (dt * bullet.speed);
        Game.animate(bullet);
        if (( (bullet.speed > 0) && (bullet.x > WIDTH)) ||
            ( (bullet.speed < 0) && (bullet.x + bullet.size < 0))) {
          this.die(bullet);
          n   = n   - 1;
          max = max - 1;
        }
      }
    }

  });

  //===============================================================================================
  // ROCKS
  //===============================================================================================

  var Rocks = Class.create({

    initialize: function() {
      this.enabled = false;
      this.rocks = [
        { top: true,  x: -1000, y: 0,             w: ROCK.W, h: ROCK.H, dx: ROCK.DX, sprite: cfg.sprites.rock },
        { top: true,  x: -1000, y: 0,             w: ROCK.W, h: ROCK.H, dx: ROCK.DX, sprite: cfg.sprites.rock },
        { top: true,  x: -1000, y: 0,             w: ROCK.W, h: ROCK.H, dx: ROCK.DX, sprite: cfg.sprites.rock },
        { top: false, x: -1000, y: HEIGHT-ROCK.H, w: ROCK.W, h: ROCK.H, dx: ROCK.DX, sprite: cfg.sprites.rock },
        { top: false, x: -1000, y: HEIGHT-ROCK.H, w: ROCK.W, h: ROCK.H, dx: ROCK.DX, sprite: cfg.sprites.rock },
        { top: false, x: -1000, y: HEIGHT-ROCK.H, w: ROCK.W, h: ROCK.H, dx: ROCK.DX, sprite: cfg.sprites.rock }
      ];
      this.hitbox = [
        { x: 16, y: 32 },
        { x: 16, y: 36 },
        { x: 16, y: 64 },
        { x: 16, y: 80 }
      ];
      this.sprite = cfg.sprites.rock;
      Game.animate(this);
    },

    reset: function() {
    },

    enable: function(on) {
      this.enabled = on;
    },

    update: function(dt) {
      var n, max, rock;
      Game.animate(this);
      for(n = 0, max = this.rocks.length ; n < max ; n++) {
        rock = this.rocks[n];
        if ((rock.x + rock.w) >= 0) {
          rock.x = rock.x + (dt * rock.dx);
        }
        else if (this.enabled) {
          rock.n = Game.Math.randomInt(0, 3);
          rock.hitbox = this.hitbox[rock.n];
          rock.x = WIDTH + Game.Math.random(0, WIDTH);
          rock.enabled = true;
        }
        else {
          rock.enabled = false;
        }
      }
    }

  });

  //===============================================================================================
  // ALIENS
  //===============================================================================================

  var Aliens = Class.create({

    reset: function() {
      this.waves = cfg.aliens;
      this.startWave(0);
      jq("#cn-wrapper .attackBtn." + this.waves[0].acceptAttack + ' a').click();
    },

    startWave: function(index) {

      this.index  = index;
      this.frame  = 0;
      this.aliens = [];
      this.attacks = [
        {
          attack: 'fire',
          deg: '0'
        },
        {
          attack: 'ice',
          deg: '60'
        },
        {
          attack: 'energy_ball',
          deg: '120'
        }
      ];

      var n, alien, wave = this.waves[index];
      for(n = 0 ; n < wave.count ; n++) {
        alien = {
          x:       wave.x,
          y:       wave.y,
          w:       wave.w || ALIEN.W,
          h:       wave.h || ALIEN.H,
          dx:      wave.moves[0].dx,
          dy:      wave.moves[0].dy,
          sprite:  cfg.sprites[wave.sprite || 'alien1'],
          pending: 60 + (n * wave.stagger),
          move:    0,
          frame:   0,
          score:   100,
          escaped: false,
          acceptAttack: wave.acceptAttack,
        };
        Game.animate(alien);
        this.aliens.push(alien);
      }
      rocks.enable(wave.rocks);

      for (var ak = 0; ak < this.attacks.length; ak++) {
        var rotatoDeg = 180 / this.attacks.length * ak;
        jq("#cn-wrapper .waveProgress." + this.attacks[ak].attack).css('transform', 'rotate(' + this.attacks[ak].deg + 'deg) skew(30deg) scale(0)');
      }

      jq("#cn-wrapper .attackBtn a").css('background-color', 'hsla(0, 88%, 63%, 0.5)');
      jq("#cn-wrapper .attackBtn img").css('opacity', 0.25);
      jq("#cn-wrapper .attackBtn." + wave.acceptAttack + ' img').css('opacity', 1);
    },

    die: function(alien) {
      alien.dead = true;
    },

    nextWave: function() {
      var index;
      if (this.index < this.waves.length - 1) {
        index = this.index + 1;
      } else {
        this.resetCycle();
        index = 0;
      }
      this.startWave(index);
    },

    resetCycle: function() {
      this.waves = this.shuffleArray(cfg.aliens);
    },

    update: function(dt) {
      var n, alien, move, endOfWave = true, wave = this.waves[this.index], lastMove = wave.moves.length-1,
          finished, finishedParcentage, frame, recentMove, recentAlienMove;

      for(n = 0 ; n < this.aliens.length ; n++) {
        alien = this.aliens[n];
        if (alien.pending) {
          alien.pending = alien.pending - 1;
          endOfWave = false;
        }
        else if (!alien.dead && !alien.escaped) {
          Game.animate(alien);
          move = wave.moves[alien.move];
          if (move.rotate) {
            alien.deg = Game.Math.wrap(alien.deg + move.rotate, 0, 360);
            alien.x = alien.ox + (alien.r * Math.sin(alien.deg * Math.PI/180));
            alien.y = alien.oy + (alien.r * Math.cos(alien.deg * Math.PI/180));
            alien.ox = alien.ox + (dt*alien.dx);
            alien.oy = alien.oy + (dt*alien.dy);
          } else {
            alien.x = alien.x + (dt*alien.dx);
            alien.y = alien.y + (dt*alien.dy);
          }
          if (((alien.dx < 0) && ((alien.x + alien.w) < 0)) ||
              ((alien.dx > 0) && (alien.x > WIDTH))       ||
              ((alien.dy < 0) && ((alien.y + alien.h) < 0)) ||
              ((alien.dy > 0) && (alien.y > HEIGHT))) {
            alien.escaped = true;
          }
          else {
            endOfWave = false;
            if (alien.move < lastMove) {
              alien.frame = alien.frame + 1;
              if(n===(0)){
                  this.firstAlienMove = true;
              }
              if (alien.frame == move.f) {
                move = wave.moves[++alien.move];
                alien.frame = 0;
                alien.dx    = move.dx;
                alien.dy    = move.dy;
                if (move.rotate) {
                  alien.ox  = alien.x + move.origin.x;
                  alien.oy  = alien.y + move.origin.y;
                  if (move.origin.x == 0)
                    alien.deg = (move.origin.y > 0) ? 180 : 0;
                  else if (move.origin.y == 0)
                    alien.deg = (move.origin.x > 0) ? 270 : 90;
                  else
                    alien.deg = Math.atan(move.origin.x / move.origin.y) * (180/Math.PI);
                  alien.r     = move.origin.r;
                }
              }
            }
            if (!alien.cooldown && !wave.defend) {
              if (Game.Math.random(0, 100) > 75){
                  bullets.fire(alien, alien.x, alien.y + alien.h/2);
              }
              alien.cooldown = Game.Math.randomInt(alienCOOLDOWN, 4*alienCOOLDOWN);
            }
            alien.cooldown--;
          }
        }

      }
        this.moveframe = this.moveframe ? this.moveframe : 0;

        if(this.moveframe > wave.totalMove / 4){
          var nextIndex = this.index < this.waves.length - 1 ? this.index + 1 : 0;
          var nextAcceptAttack = this.waves[nextIndex].acceptAttack[0];

          if (this.moveframe % 10 === 1 && this.moveframe !== wave.totalMove) {
            this.nextWaveAttackSeeThrough = !this.nextWaveAttackSeeThrough;
            if (this.nextWaveAttackSeeThrough) {
              var alpha = 0.25;
              var background = 'hsla(0, 0%, 100%, 0.5)';
            } else {
              var alpha = 1;
              var background = 'hsla(0, 88%, 63%, 0.5)';
            }
          } else if (this.moveframe >= wave.totalMove) {
            var alpha = 1;
            var background = 'hsla(0, 88%, 63%, 0.5)';
          }
          // console.log('this.moveframe: '+ this.moveframe + "/" + wave.totalMove + '/' + nextAcceptAttack)
          // console.log('background: ' + background)
          jq("#cn-wrapper .attackBtn." + nextAcceptAttack + ' img').css('opacity', alpha);
          jq("#cn-wrapper .attackBtn." + nextAcceptAttack + ' a').css('background-color', background);
        }


        if(this.moveframe < wave.totalMove && this.firstAlienMove){
            finishedParcentage = this.moveframe / wave.totalMove;
            this.moveframe++;

            var rotatoDeg, acceptAttack, attackClass, scale;
            acceptAttack = this.waves[this.index].acceptAttack[0];

            var attack = this.attacks.filter(function (a) { return a.attack == acceptAttack });
            jq("#cn-wrapper .waveProgress." + attack[0].attack).css('transform','rotate('+attack[0].deg+'deg) skew(30deg) scale('+finishedParcentage+')');
        }

        if (endOfWave) {

          var alpha = 1;
          var background = 'hsla(0, 88%, 63%, 0.5)';
          var nextIndex = this.index < this.waves.length - 1 ? this.index + 1 : 0;
          var nextAcceptAttack = this.waves[nextIndex].acceptAttack[0];
          jq("#cn-wrapper .attackBtn img").css('opacity', 0.25);
          jq("#cn-wrapper .attackBtn." + nextAcceptAttack + ' img').css('opacity', alpha);
          jq("#cn-wrapper .attackBtn a").css('background-color', 'hsla(0, 88%, 63%, 0.5)');

            aliens.firstAlienMove = false;
            aliens.moveframe = 0;


        if (player.dead && player.lives) {
          // player.reset();
          this.nextWave();
        }
        else if (!player.dead) {
          this.nextWave();
        }
      }
    },
      shuffleArray: function (array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

  });

  //===============================================================================================
  // FX
  //===============================================================================================

  var Fx = Class.create({
    initialize: function(x, y, w, h, dx, dy, defer, sprite) {
      this.x      = x;
      this.y      = y;
      this.w      = w;
      this.h      = h;
      this.dx     = dx;
      this.dy     = dy;
      this.defer  = defer;
      this.sprite = sprite;
    }
  });

  var Effects = Class.create({

    reset: function() {
      this.pool = new ObjectPool(Fx, {
        name: 'effects',
        size: 100,
        initializer: Fx.prototype.initialize
      });
    },

    explode: function(count, x, y, dx, dy) {
      var n, variety, nx, ny, defer, fx;
      for(n = 0 ; n < count ; n++) {
        variety = n*5;
        nx      = Game.Math.random(-variety, variety);
        ny      = Game.Math.random(-variety, variety);
        defer   = Game.Math.randomInt(0, variety);
        fx = this.pool.allocate(x + nx, y + ny, 64, 64, dx, dy, defer, cfg.sprites.explosion);
        Game.animate(fx);
      }
    },

    update: function(dt) {
      var n, max, fx;
      for(n = 0, max = this.pool.allocated() ; n < max ; n++) {
        fx = this.pool.store[n];
        if (fx.defer) {
          fx.defer--;
        }
        else {
          fx.x  = fx.x + (dt*fx.dx);
          fx.y  = fx.y + (dt*fx.dy);
          fx.dx = fx.dx * 0.95;
          fx.dy = fx.dy * 0.95;
          if (Game.animate(fx)) {
            this.pool.free(fx);
          }
        }
      }
    }

  });

  //===============================================================================================
  // STARS
  //===============================================================================================

  var Stars = Class.create({

    initialize: function() {
      this.speed  = 5;
      this.layers = this.initLayers(cfg.stars);
      this.stars  = this.initStars();
    },

    initLayers: function(layers) {
      var n, sum = 0, l;
      for(n = 0 ; n < layers.length ; n++) {
        l = layers[n];
        l.min = sum;
        l.max = sum + l.percent;
        sum = l.max;
      }
      return layers;
    },

    initStars: function() {
      var n, layer, stars = [], count = this.layers.length; // good ballpark for sensible number of stars based on screensize
      for(n = 0 ; n < count ; n++) {
        layer = this.layers[n];
        stars.push({
          layer: layer,
          // color: Game.Math.randomChoice(layer.colors),
          speed: Game.Math.random(layer.speed.min, layer.speed.max) * this.speed,
          // size:  1024,
          x:     layer.x,
          y:     layer.y,
          image: layer.image
        });
        // console.log(stars);
      }
      return stars;
    },

    randomLayer: function() {
      var i, n = Game.Math.random(1, 100);
      for(i = 0 ; i < this.layers.length ; i++) {
        if (n <= this.layers[i].max)
          return this.layers[i];
      }
    },

    update: function(dt) {
      var star, n, max = this.stars.length;
      // console.log(stars);
      for(n = 0 ; n < max ; n++) {
        star = this.stars[n];
        star.x = star.x - (star.speed * dt);
        // console.log(star.x);

        if (star.x <= -1052){
          // console.log("------------");
          this.repositionStar(star);
        }
      }
    },

    repositionStar: function(star) {
      star.x = 1052;
      // star.y = HEIGHT;
    }

  });

  //===============================================================================================
  // RENDERER
  //===============================================================================================

  var Renderer = Class.create({

    initialize: function() {
      this.canvas = Game.Canvas.init('canvas', WIDTH, HEIGHT);
      this.ctx    = this.canvas.getContext('2d');
    },

    reset: function(images) {
      this.images = images;
    },

    clear: function(dt) {
      this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
    },

    renderStars: function(dt) {
      var star, n, max;
      for(n = 0, max = stars.stars.length ; n < max ; n++) {
        star = stars.stars[n];
        // this.ctx.fillStyle = star.color;
        // this.ctx.beginPath();
        // this.ctx.arc(star.x - (dt * star.speed), star.y, star.size, 0, 2*Math.PI, true);
        // this.ctx.fill();
        // this.ctx.closePath();
        // console.log(this);
        this.ctx.drawImage(this.images[star.image], 0, 0, 1052, 744,
                                                    star.x - (dt * star.speed), star.y,
                                                    1052, HEIGHT
          );
      }
    },

    renderPlayer: function(dt) {

      var sprite = player.sprite,
           frame = sprite.frames[player.anim.frame],
          fixScale = 50;
      // console.log(player.anim.frame);
        if(!playerCanvas){
            playerCanvas = document.createElement("canvas");
            playerCtx=playerCanvas.getContext("2d");
            playerCanvas.width = player.w << 1;
            playerCanvas.height = player.h << 1;
        }
        playerCtx.save();
        playerCtx.clearRect(0,0,playerCanvas.width,playerCanvas.height);
        playerCtx.translate(player.w,player.h);
        playerCtx.rotate((player.anim.frame-5)*3*Math.PI/180);
        playerCtx.drawImage(this.images.player1,-player.w/2,-player.h/2,player.w,player.h);
        playerCtx.restore();

      if (!player.dead) {
          if(player.godCooldown % 10 === 1) {
              player.godSeeThrough = !player.godSeeThrough;
              if (player.godSeeThrough) {
                  playerCtx.globalAlpha = 0.5;
              } else {
                  playerCtx.globalAlpha = 1;
              }
          }
          if(!player.godMode){
              playerCtx.globalAlpha = 1;
          }

              this.ctx.drawImage(playerCanvas, 0, 0, playerCanvas.width, playerCanvas.height,
                  player.x + (dt * player.dx) - player.w /2 , player.y + (dt * player.dy) - player.h /2, playerCanvas.width, playerCanvas.height);


        // jump effect
        // if ((player.movingUp || player.movingDown || player.movingLeft || player.movingRight) && !player.jumpCOOLDOWN) {
        //   sprite = player.thrust.sprite;
        //   frame  = sprite.frames[player.thrust.anim.frame];
        //   this.ctx.drawImage(this.images.sprites, frame.x, frame.y, frame.w, frame.h,
        //                                           player.x + (dt * player.dx) - player.w, player.y + (dt * player.dy), player.w, player.h);
        // }
      }

    },

    renderAliens: function(dt) {
      var n, alien, sprite, frame;
      for(n = 0 ; n < aliens.aliens.length ; n++) {
        alien = aliens.aliens[n];
        if (!alien.pending && !alien.escaped && !alien.dead) {
          sprite = alien.sprite;
          frame  = sprite.frames[alien.anim.frame];
          this.ctx.drawImage(this.images.aliens, frame.x, frame.y, frame.w, frame.h,
                                                 alien.x + (dt * alien.dx), alien.y + (dt * alien.dy), alien.w, alien.h);
        }
      }
    },

    renderRocks: function(dt) {
      var n, max, rock, frame, sprite;
      for(n = 0, max = rocks.rocks.length ; n < max ; n++) {
        rock = rocks.rocks[n];
        if (rock.enabled) {
          sprite = rocks.sprite;
          frame  = sprite.frames[rocks.anim.frame];
          this.ctx.drawImage(this.images.rocks, frame.x, rock.top? frame.y: frame.y + 32, frame.w, frame.h,
                                                rock.x + (dt * rock.dx), rock.y, rock.w, rock.h);

        }
      }
    },

    renderBullets: function(dt) {
      var n, max, bullet, sprite, frame;
      for(n = 0, max = bullets.pool.allocated() ; n < max ; n++) {
        bullet = bullets.pool.store[n];
        sprite = bullet.sprite;
        frame  = sprite.frames[bullet.anim.frame];
        // console.log(this.images[bullet.image])
        // console.log(bullet.image)
        this.ctx.drawImage(this.images[bullet.image], frame.x,  frame.y,  frame.w,     frame.h,
                                                bullet.x + (dt * bullet.speed), bullet.y, bullet.size, bullet.size);
      }
    },

    renderEffects: function(dt) {
      var n, max, fx, sprite, frame;
      for(n = 0, max = effects.pool.allocated() ; n < max ; n++) {
        fx = effects.pool.store[n];
        if (!fx.defer) {
          sprite = fx.sprite;
          frame  = sprite.frames[fx.anim.frame];
          this.ctx.drawImage(this.images.sprites, frame.x, frame.y, frame.w, frame.h,
                                                  fx.x - fx.w/2, fx.y - fx.h/2, fx.w, fx.h);
        }
      }
    }

  });

  //===============================================================================================
  // SOUND FX and MUSIC
  //===============================================================================================

  var Sounds = Class.create({

    reset: function(sounds) {
      this.sounds = sounds;
      this.toggleMute(this.isMute());
      $('sound').on('click', this.onClickMute.bind(this)).show();
    },

    onClickMute: function() {
      this.toggleMute(this.isNotMute());
      this.toggleMusic();
    },

    toggleMute: function(on) {
      AudioFX.mute = engine.storage.mute = on;
      $('sound').setClassName(AudioFX.mute ? 'off' : 'on');
    },

    toggleMusic: function() {
      if (AudioFX.mute)
        this.stopAllMusic();
      else if (engine.isTitle())
        this.playTitleMusic();
      else if (engine.isPreparing() || engine.isPlaying())
        this.playGameMusic();
    },

    isMute: function()     { return to.bool(engine.storage.mute);   },
    isNotMute: function()  { return !this.isMute();                 },
    play:      function(s) { if (this.isNotMute()) return s.play(); },

    playTitleMusic: function() { this.stopAllMusic(); this.play(this.sounds.title); },
    playGameMusic:  function() { this.stopAllMusic(); this.play(this.sounds.game);  },
    stopAllMusic:   function() { this.sounds.title.stop(); this.sounds.game.stop(); },
    explode:        function() { this.play(this.sounds.explode);                    },
    shoot:          function() { this.play(this.sounds.shoot);                      }

  });

  //===============================================================================================
  // ALIEN PATTERNS
  //===============================================================================================

  var Pattern = {

    straight: function(duration, dx, dy) {
      return { f: duration, dx: dx, dy: dy };
    },

    rotate: function(degrees, speed, x, y, opts) {

      var options   = opts || {},
          clockwise = degrees < 0,
          radius    = Math.sqrt((x * x) + (y * y)),
          rotate    = (180/Math.PI) * (speed/FPS)/radius * (clockwise ? -1 : 1),
          duration  = Math.abs(Math.round(degrees/rotate));

      return { f: duration, dx: options.dx || 0, dy: options.dy || 0, rotate: rotate, origin: { r: radius, x: x, y: y } };

    },

    construct: function(options, moves) {
      options.alien   = options.alien   || 1;
      options.count   = options.count   || 10;
      options.stagger = options.stagger || 8;
      options.rocks   = options.rocks   || false;
      options.w       = ALIEN.W * (options.size || this.size(options));
      options.h       = ALIEN.H * (options.size || this.size(options));
      options.x       = this.x(options);
      options.y       = this.y(options);
      options.sprite  = this.sprite(options);
      options.moves   = moves;
      options.totalMove = this.totalMove(moves);
      return options;
    },

    sprite: function(options) {
      switch(options.alien) {
        case 1:  return 'alien1';
        case 2:  return 'alien2';
        case 3:  return 'alien3';
        default:
          throw 'unknown alien';
      }
    },

    size: function(options) {
      switch(options.alien) {
        case 1: return 1;
        case 2: return 1.5;
        case 3: return 1.5;
        default:
          throw 'unknown alien';
      }
    },

    x: function(options) {
      var x = options.x || 'after';
      if (x === 'before')
        return -128;
      else if (x === 'after')
        return WIDTH + 128;
      else if (x === 'left')
        return 16;
      else if (x === 'right')
        return WIDTH - options.w - 16;
      else if (x === 'center')
        return WIDTH/2 - options.w/2;
      else
        return x - options.w/2;
    },

    y: function(options) {
      var y = options.y || 'middle';
      if (y === 'above')
        return -128;
      else if (y === 'below')
        return HEIGHT + 128;
      else if (y === 'top')
        return (options.rocks ? ROCK.H : 16);
      else if (y === 'bottom')
        return HEIGHT - options.h - (options.rocks ? ROCK.H : 16);
      else if (y === 'middle')
        return HEIGHT/2 - options.h/2;
      else
        return y - options.h/2;
    },

    totalMove: function (moves) {
        var totalMove = 0;
        for(var n = 0 ; n < moves.length ; n++) {
            totalMove = totalMove + moves[n].f;
        }
        return totalMove;
    }

  };

  //===============================================================================================

  cfg.aliens = [

    //ghost fire
    Pattern.construct({ alien: 3, y: 'middle', acceptAttack: ['ice'] }, [
      Pattern.straight(20,   -375,    0),
      Pattern.straight(30,   -375, -225),
      Pattern.straight(30,      0,  225),
      Pattern.straight(null, -375,    0)
    ]),

    //ghost fire
    Pattern.construct({ alien: 3, y: 'bottom', rocks: true, acceptAttack: ['ice'] }, [
      Pattern.straight(20,   -375,    0),
      Pattern.straight(30,   -375, -225),
      Pattern.straight(30,      0,  225),
      Pattern.straight(null, -375,    0)
    ]),

    //ghost fire
    Pattern.construct({ alien: 3, y: 'top', rocks: true, acceptAttack: ['ice'] }, [
      Pattern.straight(20,   -375,    0),
      Pattern.straight(30,   -375,  225),
      Pattern.straight(30,      0, -225),
      Pattern.straight(null, -375,    0)
    ]),

      //phantom
    Pattern.construct({ alien: 1, count: 10, stagger: 8, y: 'middle', defend: true, acceptAttack: ['energy_ball'] }, [
      Pattern.straight(75, -375, 0),
      Pattern.rotate(-360, 375, 0, -150),
      Pattern.straight(10, -375, 0),
      Pattern.rotate( 360, 375, 0,  150),
      Pattern.straight(null, -375, 0)
    ]),

      //pumpkin
    Pattern.construct({ alien: 2, y: 'top', acceptAttack: ['fire'] }, [
      Pattern.straight(60, -375, 0),
      Pattern.rotate(720, 375, 0, 225),
      Pattern.straight(null, -375, 0)
    ]),

    //phantom
    Pattern.construct({ alien: 1, y: 'middle', acceptAttack: ['energy_ball'] }, [
      Pattern.straight(10, -300, 0),
      Pattern.rotate( 180, 225, -120, 0),
      Pattern.rotate(-180, 225, -120, 0),
      Pattern.rotate( 180, 225, -120, 0),
      Pattern.rotate(-180, 225, -120, 0),
      Pattern.rotate( 180, 225, -120, 0),
      Pattern.rotate(-180, 225, -120, 0),
      Pattern.straight(null, -300, 0)
    ]),

    //pumpkin
    Pattern.construct({ alien: 2, y: 'bottom', acceptAttack: ['fire'] }, [
      Pattern.straight(60, -375, 0),
      Pattern.rotate(-720, 375, 0, -225),
      Pattern.straight(null, -375, 0)
    ]),

    //ghost fire
    Pattern.construct({ alien: 3, y: 'bottom', count: 10, stagger: 9, rocks: true, acceptAttack: ['ice'] }, [
      Pattern.straight(60,   -225,    0),
      Pattern.straight(60,      0, -400),
      Pattern.straight(20,   -225,    0),
      Pattern.straight(60,      0,  400),
      Pattern.straight(20,   -225,    0),
      Pattern.straight(60,      0, -400),
      Pattern.straight(20,   -225,    0),
      Pattern.straight(60,      0,  400),
      Pattern.straight(20,   -225,    0),
      Pattern.straight(60,      0, -400),
      Pattern.straight(20,   -225,    0),
      Pattern.straight(60,      0,  400),
      Pattern.straight(null, -225,    0)
    ]),

    //phantom
    Pattern.construct({ alien: 1, x: WIDTH-200, y: 'below', defend: true, acceptAttack: ['energy_ball'] }, [
      Pattern.straight(60, 0, -375),
      Pattern.rotate(360, 375, -150, 0),
      Pattern.straight(null, 0, -375)
    ]),

    //phantom
    Pattern.construct({ alien: 1, x: WIDTH-200, y: 'above', defend: true, acceptAttack: ['energy_ball'] }, [
      Pattern.straight(120, 0, 375),
      Pattern.rotate(-360, 375, -150, 0),
      Pattern.straight(null, 0, 375)
    ]),

    //pumpkin
    Pattern.construct({ alien: 2, x: 'after', y: 'top', count: 12, rocks: true, defend: true, acceptAttack: ['fire'] }, [
      Pattern.straight(5, -600, 0),
      Pattern.rotate(360, 600, 0, 220, { dx: -80, dy: 0 })
    ]),

    //pumpkin
    Pattern.construct({ alien: 2, x: WIDTH-200, y: 'below', acceptAttack: ['fire'] }, [
      Pattern.straight(60, 0, -375),
      Pattern.straight(null, -600, -150)
    ]),

    //pumpkin
    Pattern.construct({ alien: 2, x: WIDTH-200, y: 'above', acceptAttack: ['fire'] }, [
      Pattern.straight(60, 0, 375),
      Pattern.straight(null, -600, 150)
    ]),

    //pumpkin
    Pattern.construct({ alien: 2, y: 'top', count: 30, rocks: true, acceptAttack: ['fire'] }, [
      Pattern.straight(110, -100, 0),
      Pattern.rotate(180, 375, 0, 250),
      Pattern.straight(60,  375, 0),
      Pattern.rotate(180, 375, 0, -250),
      Pattern.straight(100, -375, 0)
    ])

  ];

    run.cfg      = cfg;
    run.engine   = engine;
    run.player   = player;
    run.bullets  = bullets;
    run.aliens   = aliens;
    run.rocks    = rocks;
    run.stars    = stars;
    run.renderer = renderer;

    run();

    return run;
  //-----------------------------------------------------------------------------------------------

};
