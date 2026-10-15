/**
 * 益智游戏 - 音频管理
 * 处理iOS Safari音频限制,音效播放
 */

class AudioManager {
  constructor() {
    this.unlocked = false;
    this.audioContext = null;
    this.config = gameStorage.getConfig();
    this.sounds = {};

    // 预加载音效
    this.preloadSounds();
  }

  /**
   * 预加载音效文件
   */
  preloadSounds() {
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

    soundList.forEach(function(sound) {
      var audio = new Audio(sound.src);
      audio.preload = 'auto';
      this.sounds[sound.id] = audio;
    });
  }

  /**
   * 解锁音频(iOS Safari需要用户交互才能播放音频)
   */
  unlock() {
    if (this.unlocked) return;

    try {
      // 创建音频上下文
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // 播放静音音频解锁
      var buffer = this.audioContext.createBuffer(1, 1, 22050);
      var source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);

      this.unlocked = true;
      console.log('音频已解锁');
    } catch (e) {
      console.error('音频解锁失败:', e);
    }
  }

  /**
   * 播放音效
   */
  playSound(soundId) {
    // 检查声音是否启用
    var config = gameStorage.getConfig();
    if (!config.audioEnabled) {
      return;
    }

    var sound = this.sounds[soundId];
    if (!sound) {
      console.warn('音效不存在:', soundId);
      return;
    }

    try {
      // 克隆音频节点,避免同时播放冲突
      var clone = sound.cloneNode();
      clone.volume = config.sfxVolume;

      // iOS Safari需要用户交互才能播放
      if (this.unlocked && this.audioContext) {
        var source = this.audioContext.createMediaElementSource(clone);
        source.connect(this.audioContext.destination);
      }

      clone.play().catch(function(e) {
        console.warn('播放失败:', e);
      });
    } catch (e) {
      console.error('播放音效失败:', e);
    }
  }

  /**
   * 播放正确音效
   */
  playCorrect() {
    this.playSound('correct');
  }

  /**
   * 播放错误音效
   */
  playError() {
    this.playSound('error');
  }

  /**
   * 播放赞扬语音(随机)
   */
  playPraise() {
    var praiseSounds = ['praise_1', 'praise_2', 'praise_3'];
    var randomSound = praiseSounds[Math.floor(Math.random() * praiseSounds.length)];
    this.playSound(randomSound);
  }

  /**
   * 播放解锁音效
   */
  playUnlock() {
    this.playSound('unlock');
  }

  /**
   * 播放庆祝音效
   */
  playCelebrate() {
    this.playSound('celebrate');
  }

  /**
   * 播放点击音效
   */
  playClick() {
    this.playSound('click');
  }

  /**
   * 设置音量
   */
  setVolume(volume) {
    this.config.sfxVolume = volume;
    gameStorage.saveConfig(this.config);
  }

  /**
   * 开启/关闭音效
   */
  toggleAudio(enabled) {
    this.config.audioEnabled = enabled;
    gameStorage.saveConfig(this.config);
  }

  /**
   * 获取音频状态
   */
  isEnabled() {
    return this.config.audioEnabled;
  }
}

// 创建全局实例
var audioManager = new AudioManager();
