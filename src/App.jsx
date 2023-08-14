import React from 'react'
import "./App.css"
import Channel from './components/Channel'
import { useState, useEffect, useRef } from 'react'
import PlayPauseStop from './components/PlayPauseStop'
import { emBlock_14_01_Klavier, emBlock_14_01_Theo } from '../src/lib/sounds';
import sounds from "./lib/sounds.json";

const App = () => {
  
  // Create an array of audio sources
  // const sources = [
  //   {
  //     src: emBlock_14_01_Klavier.src,
  //     name: emBlock_14_01_Klavier.name,
  //   },
  //   {
  //     src: emBlock_14_01_Theo.src,
  //     name: emBlock_14_01_Theo.name,
  //   },
  //   {
  //     src: "sound3.mp3",
  //     name: "Sound 3",
  //   },
  // ];
  const [selectedTrack, setSelectedTrack] = useState("emBlock_14_01")
  // useEffect(setSelectedTrack("emBlock_14_01"), [])
  console.log(selectedTrack)

  // Create an array of refs for each audio element
  const refs = sounds[selectedTrack].map(() => useRef(null));

  // Create a state for the playing status
  const [playing, setPlaying] = useState(false);
  const [stopped, setStopped] = useState(true);
  const [globalSeek, setGlobalSeek] = useState(0);

  // Create a function to play all the audio elements
  const play = () => {
    refs.forEach((ref) => ref.current.play());
    setPlaying(true);
  };

  // Create a function to pause all the audio elements
  const pause = () => {
    refs.forEach((ref) => ref.current.pause());
    setPlaying(false);
  };

  // Create a function to stop all the audio elements
  const stop = () => {
    refs.forEach((ref) => {
      ref.current.pause();
      ref.current.currentTime = 0;
    });
    setGlobalSeek(0);
    setPlaying(false);
  };


  // Use the useEffect hook to sync the playing status of all the audio elements
  useEffect(() => {
    refs.forEach((ref) => {
      ref.current.onplay = () => setPlaying(true);
      ref.current.onpause = () => setPlaying(false);
      ref.current.onended = () => setPlaying(false);
    });
  }, [refs]);

  // Render the audio mixer component
  return (
    <div className="audio-mixer">
      <h1>Audio Mixer</h1>
      <div className="controls">
        <button onClick={play} disabled={playing}>
          Play
        </button>
        <button onClick={pause} disabled={!playing}>
          Pause
        </button>
        <button onClick={stop} disabled={!playing}>
          Stop
        </button>
      </div>
      <div className="tracks">
        {sounds[selectedTrack].map((source, index) => (
          <Channel source={source} index={index} refs={refs} globalSeek={globalSeek} /> 
        ))}
      </div>
      <div className="globalSeek">
        <h3>Global Seek</h3>
      <input
      type="range"
      min="0"
      max={refs[0].current?.duration}
      value={globalSeek}
      onChange={(e) =>
        {setGlobalSeek(e.target.value)}
      }
    />
      </div>
    </div>
  );
};

export default App
