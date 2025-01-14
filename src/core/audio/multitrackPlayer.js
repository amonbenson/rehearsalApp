import { EventEmitter } from "events";
import { createContext, useContext } from "react";
import * as Tone from "tone";

let _audioContext = null;
export const getAudioContext = () => {
  if (!_audioContext) {
    _audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioContext;
}

export class Track {
  constructor(config) {
    if (!config.url) {
      throw new Error("Track URL is required");
    }
    if (!config.name) {
      throw new Error("Track name is required");
    }

    this.url = config.url;
    this.name = config.name;
    this.mute = config.mute ?? false;
    this.solo = config.solo ?? false;
    this.level = config.level ?? 1.0;
    this._outputMute = false;
    this._outputGain = 1.0;

    // setup initial gain
    this.updateGain();
  }

  get outputMute() {
    return this._outputMute;
  }

  get outputGain() {
    return this._outputGain;
  }

  updateGain(soloing) {
    this._outputMute = soloing ? !this.solo : this.mute;
    this._outputGain = this._outputMute ? 0 : this.level;
  }
}

export class MultitrackPlayer extends EventEmitter {
  constructor() {
    super();

    this._state = "idle";
    this._playing = false;
    this._duration = 0;
    this._position = 0;

    this._tracks = [];
    this._players = null;

    this._positionInterval = null;
  }

  get state() {
    return this._state;
  }

  _setState(value) {
    this._state = value;
    this.emit("stateChange", value);
    this.emit(value);
  }

  get playing() {
    return this._playing;
  }

  _setPlaying(value) {
    this._playing = value;
    this.emit("playingChange", value);
  }

  get tracks() {
    return this._tracks;
  }

  _setTracks(value) {
    this._tracks = value;
    this.emit("tracksChange", value);
  }

  get duration() {
    return this._duration;
  }

  _setDuration(value) {
    this._duration = value;
    this.emit("durationChange", value);
  }

  get position() {
    return this._position;
  }

  _updatePosition() {
    // prevent unnecessary updates
    if (this._position === Tone.getTransport().seconds) {
      return;
    }

    this._position = Tone.getTransport().seconds;
    this.emit("positionChange", this._position);
  }

  isMuting() {
    return this.tracks.some(track => track.mute);
  }

  isSoloing() {
    return this.tracks.some(track => track.solo);
  }

  applyTrackSettings() {
    const soloing = this.isSoloing();

    // update gain of each track
    this.tracks.forEach((track, index) => {
      track.updateGain(soloing);

      // convert gain to decibels
      const db = 20 * Math.log10(track.outputGain);
      this._players.player(index).volume.value = db;
    });
    this.emit("trackSettingsChange");
  }

  async load(trackConfigs) {
    if (this._state === "loading") {
      // TODO: it would be better to cancel any ongoing loading process
      // this will require a mechanism for cancelling the promises below,
      // so we'll leave it for now
      throw new Error("Already loading");
    }

    try {
      this.unload();
      this._setState("loading");

      // create all tracks
      this._setTracks(trackConfigs.map(config => new Track(config)));

      // create the player and wait until it's ready
      await new Promise(resolve => {
        const urls = Object.fromEntries(this.tracks.map((track, index) => [index, track.url]));
        this._players = new Tone.Players(urls, resolve);
      });

      // connect to the master chain
      this._players.toDestination();

      // sync all players to the transport
      this.tracks.forEach((_, index) => this._players.player(index).sync().start(0));

      // set the duration
      const durations = this.tracks.map((_, index) => this._players.player(index).buffer.duration);
      this._setDuration(Math.max(...durations));

      // continously update position
      this._positionInterval = setInterval(() => this._updatePosition(), 100);

      this._setState("ready");
    } catch (err) {
      console.error("Error loading tracks", err);
      this._setState("error");
      throw err;
    }
  }

  unload() {
    this.stop();

    if (this._positionInterval) {
      clearInterval(this._positionInterval);
      this._positionInterval = null;
    }
    this._setDuration(0);

    if (this._players) {
      this._players.dispose();
      this._players = null;
    }

    this._setTracks([]);
    this._setState("idle");
  }

  play() {
    Tone.getTransport().start();
    this._setPlaying(true);
    this._updatePosition();
    this.emit("play");
  }

  pause() {
    Tone.getTransport().pause();
    this._setPlaying(false);
    this._updatePosition();
    this.emit("pause");
  }

  stop() {
    Tone.getTransport().stop();
    this._setPlaying(false);
    this._updatePosition();
    this.emit("stop");
  }

  seek(time) {
    Tone.getTransport().seconds = time;
    this._updatePosition();
    this.emit("seek", time);
  }
}

// setup global instance
const _playerInstance = new MultitrackPlayer();
const _playerContext = createContext(_playerInstance);

export const usePlayer = () => useContext(_playerContext);
