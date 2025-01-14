import React, { useEffect, useRef, useState } from "react";
import "./Channel.css";
import * as Tone from "tone";
import OneChannelControls from "./OneChannelControls";
import iconPlay from "../assets/img/play.png";
import iconPause from "../assets/img/pause.png";
import iconStop from "../assets/img/stop.png";
import loadingSpinner from "../assets/img/loading.gif";
import { usePlayer } from "../core/audio/multitrackPlayer";
import { useMediaQueries, useMember } from "../../utils/hooks";

const Channel = (/* {
  formatTime,
  statePlayers,
  setStatePlayers,
  stateSolos,
  setStateSolos,
  setTrackDuration,
  trackDuration,
  selectedSong,
  setSelectedSong,
  globalSeek,
  setGlobalSeek,
  sources,
  loading,
  setLoading,
  isBigScreen,
  isTabletOrMobile,
  isDesktopOrLaptop,
  setPlaying,
  sounds,
  seekUpdateInterval,
  setSeekUpdateInterval,
  playersLoaded,
  setPlayersLoaded,
  clearMute,
  setClearMute,
  isStopped,
  setIsStopped,
  setPlayerStopped,
  playerStopped
} */) => {
  const playersRef = useRef(null);
  const solosRef = useRef({});
  const intervalRef = useRef(null);

  const { isTabletOrMobile } = useMediaQueries();

  const player = usePlayer();

  const playerState = useMember(player, "state");
  const tracks = useMember(player, "tracks");
  const playing = useMember(player, "playing");
  const position = useMember(player, "position");
  const duration = useMember(player, "duration");

  const handlePlayPause = async () => {
    if (playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleStop = () => {
    player.stop();
  };

  const handleGlobalSeek = (value) => {
    const time = (value / 100) * player.duration;
    player.seek(time);
  }

  return (
    <div className="controlsWrapper" style={{ width: '95%' }}>
      <div className="trackControlsContainer" style={{ overflowX: 'scroll', whiteSpace: 'nowrap' }}>
        <div className="trackControls" style={{ width: 'max-content' }}>
          {tracks?.map((track, index) => (
            <OneChannelControls
              key={index}
              index={index}
              track={track}
            />
          ))}
        </div>
      </div>
      <div className="globalControls" style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', width: "100%" }}>
        <div className="controls">
          <button
            style={{
              marginRight: "0.25rem",
              marginLeft: "0.25rem",
              backgroundColor: "transparent",
              opacity: playerState === "ready" ? 1 : 0.5
            }}
            disabled={playerState !== "ready"}
            onClick={handlePlayPause}
          >
            <img
              style={{ width: "3rem" }}
              src={playerState !== "ready" ? loadingSpinner : (playing ? iconPause : iconPlay)}
              alt="Play Button"
            />
          </button>
          <button
            style={{
              marginRight: "0.25rem",
              marginLeft: "0.25rem",
              backgroundColor: "transparent",
            }}
            onClick={handleStop}
            disabled={playerState !== "ready"}
          >
            <img
              style={{ width: "3rem", opacity: playerState === "ready" ? 1 : 0.5 }}
              src={iconStop}
              alt="Stop Button"
            />
          </button>
        </div>
        <div className="globalSeek">
          <input
            type="range"
            min="0"
            max={duration}
            value={position}
            onChange={(e) => {
              handleGlobalSeek(e.target.value);
            }}
          />
          <div style={{ fontWeight: "bold", fontSize: isTabletOrMobile ? "1.5rem" : "1.1rem" }}>00:00</div>
        </div>
      </div>
    </div>
  );
};

export default Channel;
