import React from "react";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import iconMuted from "../assets/img/muted.png"
import iconUnmuted from "../assets/img/unmuted.png"
import iconSolo from "../assets/img/solo.png"
import { Track, usePlayer } from "../core/audio/multitrackPlayer";
import { useMediaQueries, useEvent } from "../../utils/hooks";
import "./Channel.css"

const OneChannelControls = ({ index, track }) => {

  const { isTabletOrMobile } = useMediaQueries();
  const player = usePlayer();

  const [mute, setMute] = useState(track.mute);
  const [solo, setSolo] = useState(track.solo);
  const [level, setLevel] = useState(track.level);
  const [outputMute, setOutputMute] = useState(track.outputMute);

  useEffect(() => {
    const listener = () => setOutputMute(track.outputMute);
    player.on("trackSettingsChange", listener);
    return () => player.off("trackSettingsChange", listener);
  }, []);
  // useEffect(useEvent(player, "trackSettingsChange", () => setOutputMute(track.outputMute)), []);

  const handleLevelChange = (value) => {
    setLevel(value);
    track.level = value;
    player.applyTrackSettings();
  }

  const handleMute = () => {
    const value = !mute;
    setMute(value);
    track.mute = value;
    player.applyTrackSettings();
  }

  const handleSolo = () => {
    const value = !solo;
    setSolo(value);
    track.solo = value;
    player.applyTrackSettings();
  }

  return (
    <div style={{display: "flex", marginBottom: 7}}>
      <div key={index} className="track">
        <div className="sourceName">
          <h3>{track.name}</h3>
        </div>
        <input
          className="volumeSlider"
          type="range"
          min="0"
          max="1"
          step="0.02"
          orient="vertical"
          value={level}
          style={{
            width: isTabletOrMobile ? "0.4rem" : null,
          }}
          // onTimeUpdate={() => handleTimeUpdate()}
          onChange={(e) => {handleLevelChange(e.target.value)}}
        />
        <div
          className="muteBox"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="muteSolo" style={{display:"flex", flexDirection:"column"}}>
            <button
              style={{ backgroundColor: !mute ? "transparent" : "#fdc873", padding: "0.5rem" }}
              onClick={handleMute}
            >
              <img
                src={outputMute ? iconMuted : iconUnmuted}
                alt=""
                style={{ width: isTabletOrMobile ? "2rem" : "1.5rem" }}
              />
            </button>
            <button
              style={{ backgroundColor: !solo ? "transparent" : "#fdc873", padding: "0.5rem" }}
              onClick={handleSolo}
            >
              <img
                src={iconSolo}
                alt=""
                style={{ width: isTabletOrMobile ? "2rem" : "1.5rem" }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

OneChannelControls.propTypes = {
  index: PropTypes.number.isRequired,
  track: PropTypes.instanceOf(Track).isRequired,
};

export default OneChannelControls;
