function AudioManager() {
  this.unlocked = false;
  this.audioContext = null;
  this.config = gameStorage.getConfig();
  this.sounds = {};
  this.preloadSounds();
}

AudioManager.prototype.preloadSounds = function() {
  var soundList = [
    { id: 'correct', src: 'audio/correct.mp3' },
    { id: 'error', src: 'audio/error.mp3' },
    { id: 'praise_1', src: 'audio/praise_1.mp3' },
    { id: 'praise_2', src: 'audio/praise_2.mp3' },
    { id: 'praise_3', src: 'audio/praise_3.mp3' },
    { id: 'unlock', src: 'audio/unlock.mp3' },
    { id: 'celebrate', src: 'audio/celebrate.mp3' },
    { id: 'click', src: 'audio/click.mp3' }
  ];
  for (var i = 0; i < soundList.length; i++) {
    var sound = soundList[i];
    var audio = new Audio(sound.src);
    audio.preload = 'auto';
    this.sounds[sound.id] = audio;
  }
};

AudioManager.prototype.unlock = function() {
  if (this.unlocked) return;
  try {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var buffer = this.audioContext.createBuffer(1, 1, 22050);
    var source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
    this.unlocked = true;
  } catch (e) { console.error('音频解锁失败:', e); }
};

AudioManager.prototype.playSound = function(soundId) {
  var config = gameStorage.getConfig();
  if (!config.audioEnabled) return;
  var sound = this.sounds[soundId];
  if (!sound) return;
  try {
    var clone = sound.cloneNode();
    clone.volume = config.sfxVolume;
    if (this.unlocked && this.audioContext) {
      var source = this.audioContext.createMediaElementSource(clone);
      source.connect(this.audioContext.destination);
    }
    clone.play().catch(function(e) {});
  } catch (e) {}
};

AudioManager.prototype.playCorrect = function() { this.playSound('correct'); };
AudioManager.prototype.playError = function() { this.playSound('error'); };
AudioManager.prototype.playPraise = function() {
  var praiseSounds = ['praise_1', 'praise_2', 'praise_3'];
  this.playSound(praiseSounds[Math.floor(Math.random() * praiseSounds.length)]);
};
AudioManager.prototype.playUnlock = function() { this.playSound('unlock'); };
AudioManager.prototype.playCelebrate = function() { this.playSound('celebrate'); };
AudioManager.prototype.playClick = function() { this.playSound('click'); };
AudioManager.prototype.setVolume = function(volume) {
  var config = gameStorage.getConfig();
  config.sfxVolume = volume;
  gameStorage.saveConfig(config);
};
AudioManager.prototype.toggleAudio = function(enabled) {
  var config = gameStorage.getConfig();
  config.audioEnabled = enabled;
  gameStorage.saveConfig(config);
};
AudioManager.prototype.isEnabled = function() { return this.config.audioEnabled; };

var audioManager = new AudioManager();
