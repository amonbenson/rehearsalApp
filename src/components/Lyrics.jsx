import React from "react";
import { useState, useEffect, useRef } from "react";
import { parseLyrics, syncLyrics } from "../../utils/lrcParser";
import OneLine from "./OneLine";
import "./Lyrics.css";
import { Transport } from "tone";
import { Link } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const Lyrics = ({
  sounds,
  sources,
  currentLrcs,
  statePlayers,
  stateSolos,
  stateOutputMutes,
  selectedSong,
  loading,
  setLoading,
  globalSeek,
  setGlobalSeek,
  userSeek,
  setUserSeek,
  isBigScreen,
  isDesktopOrLaptop,
  isTabletOrMobile,
  selectedTrack,
  selectedAlbum,
  setNoLrcs,
  noLrcs,
  hideMixer,
  playerStopped
}) => {
  const [displayedLyrics, setDisplayedLyrics] = useState("");
  const [currentLyrics, setCurrentLyrics] = useState([]);
  const [displayedLyricsIndex, setDisplayedLyricsIndex] = useState(0);
  const [currentLrc, setCurrentLrc] = useState({});
  const [lyricsLoading ,setLyricsLoading] = useState(true);
  const [noTrackLrc, setNoTrackLrc] = useState(false);
  const [lrcContent, setLrcContent] = useState(null);
  const [lyricsMutes, setLyricsMutes] = useState([]);

  const lyricsRef = useRef();

  useEffect(() => {
    const loadLrc = async () => {
      if (currentLrcs.length && selectedTrack) {

        if (currentLrcs.length === 0) {
          console.log("No LRC found");
          setLyricsLoading(false);
          return;
        }

        const foundLrc = currentLrcs.find((lrc) => lrc.trackId === selectedTrack);

        if (foundLrc) {
          const lrcLocation = foundLrc.lrc;
          const lrcText = await lrcLocation.text();

          setCurrentLrc(foundLrc);
          setLrcContent(lrcText);
          setNoTrackLrc(false)
        } else {
          setNoTrackLrc(true);
          setLyricsLoading(false);
          // setLrcContent(null)
        }

        // setLyricsLoading(false);
      }
    };

    loadLrc();
    lyricsRef?.current?.scrollTo({top: 0, behavior: "smooth"});
  }, [selectedAlbum, selectedSong, selectedTrack, currentLrcs, setLoading, setLrcContent, setNoTrackLrc, lyricsRef]);

  useEffect(() => {
    if(playerStopped){
      lyricsRef?.current?.scrollTo({top: 0, behavior: "smooth"});
    }
  }, [playerStopped])

  const displayCurrentLyrics = () => {
    if (lrcContent) {
      const lyrics = parseLyrics(lrcContent);
      setCurrentLyrics(lyrics);
      const index = syncLyrics(lyrics, globalSeek);
      setDisplayedLyricsIndex(index);
      if (index === null) return;
      setDisplayedLyrics(lyrics[index].text);
    }
  };

  const updateLyricsIndex = () => {

  }

  // useEffect(() => {
  //   setLrcContent('')
  // }, [selectedAlbum, selectedTrack])

  useEffect(() => {
    if (globalSeek === 0) {
      setDisplayedLyrics("");
    }
    if(currentLyrics){
      const index = syncLyrics(currentLyrics, globalSeek);
      setDisplayedLyricsIndex(index);
      if(index === null) return;
      setDisplayedLyrics(currentLyrics[index].text)
    }

  }, [globalSeek, currentLyrics]);

  useEffect(() => {
    if (lrcContent) {
      displayCurrentLyrics();
    }
  }, [lrcContent])

  useEffect(() => {
    if(currentLyrics.length){
      setLyricsLoading(false)
    }
  }, [currentLyrics])

  const EVERYONE_PATTERNS = ["ALL", "EVERYONE", "EVERYBODY", "ALLE", "TUTTI", "ENSEMBLE"];
  const resolveUnmutedTracks = (pattern, previousTrackÍds) => {
    const names = Object.values(sources).map((source) => source.name);

    // start with an empty set or the previous track ids, if "+" is given
    let initialTrackIds;
    if (pattern.startsWith("+")) {
      initialTrackIds = new Set(previousTrackÍds);
      pattern = pattern.slice(1); // remove "+" from the pattern
    } else {
      initialTrackIds = new Set();
    }

    // check for "everyone" pattern
    if (EVERYONE_PATTERNS.includes(pattern)) {
      return new Set(new Array(names.length).fill().map((_, i) => i));
    }

    // match each name against the pattern
    for (let i = 0; i < names.length; i++) {
      for (let namePart of names[i].split(" ")) {
        const nameUpper = namePart.toUpperCase().replace(/[^A-Z]/g, ""); // replace non-alphabet characters
        const shortNameUpper = nameUpper.replace(/[AEIOU]/g, ""); // remove vowels

        // return single match (merged with the initial track ids)
        if (nameUpper.startsWith(pattern) || shortNameUpper.startsWith(pattern)) {
          return initialTrackIds.union(new Set([i]));
        }
      }
    }

    // console.warn(`No match found for pattern "${pattern}". Assuming "ALL".`);
    return new Set(new Array(names.length).fill().map((_, i) => i));
  };

  useEffect(() => {
    const pianoTrackId = Object
      .values(sources)
      .findIndex((source) => source.name.toUpperCase().includes("PIANO"));
    const onlyPianoActive = stateOutputMutes && stateOutputMutes.every((mute, index) => index === pianoTrackId ? !mute : mute);

    // generate lyrics => trackId mapping
    const lyricsTrackIdMap = [];
    let previousTrackÍds = resolveUnmutedTracks("ALL"); // assume ALL at the beginning
    for (let i = 0; i < currentLyrics.length; i++) {
      // get the part before the colon and match all uppercase words (at least 3 characters long)
      const nameSection = currentLyrics[i].text.split(":")[0];
      const namePatterns = [...nameSection.matchAll(/(\+?[A-Z]{3,})/g)].map((match) => match[0]);
      // console.log(i, "patterns:", namePatterns);

      let trackIds = new Set();
      if (onlyPianoActive) {
        // if only the piano accompaniment is playing, unmute all lyrics
        trackIds = resolveUnmutedTracks("ALL");
      } else if (namePatterns.length === 0) {
        // if no patterns were given, use the previous track ids
        trackIds = previousTrackÍds;
      } else {
        // resolve each pattern to the actual names
        trackIds = namePatterns.reduce((acc, pattern) => acc.union(resolveUnmutedTracks(pattern, previousTrackÍds)), new Set());
      }
      // console.log("->", trackIds);

      lyricsTrackIdMap.push(trackIds);
      previousTrackÍds = trackIds;
    }

    // mute line if all corresponding tracks are muted
    const lyricsMutesMap = lyricsTrackIdMap.map((trackIds) => [...trackIds].every((trackId) => stateOutputMutes && stateOutputMutes[trackId]));
    // const lyricsMutesMap = lyricsTrackIdMap.map((trackIds) => false);

    // update reactive lyrics mute state
    setLyricsMutes(lyricsMutesMap);
  }, [currentLyrics, stateOutputMutes]);

  const goToLyricsPosition = (position) => {
    if (Transport.state === "started") {
      Transport.pause();
      Object.values(statePlayers._players).forEach((player) => player.sync());
      Transport.seconds = position;
      setGlobalSeek(position);
      setUserSeek(!userSeek);
      Transport.start();
    } else {
      Transport.seconds = position;
      Object.values(statePlayers._players).forEach((player) => player.sync());
      setGlobalSeek(position);
      setUserSeek(!userSeek);
    }
  };

  return (
    <div className="lyricsWrapper" style={{ width: isTabletOrMobile ? "100%" : "25rem", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginLeft: isTabletOrMobile ? 0 : 0 }}>
      {lyricsLoading ? (
        <LoadingSpinner />
      ) : !noTrackLrc ? (
        <div>      
        <div ref={lyricsRef} className="lyricsdisplay" style={{ width: "100%", overflowY: 'scroll', scrollbarWidth: 'none' }}>
          {currentLyrics.map((line, index) => {
            return (
              <div key={index}>
                <OneLine
                  line={line}
                  key={index}
                  index={index}
                  muted={lyricsMutes[index]}
                  goToLyricsPosition={goToLyricsPosition}
                  displayedLyricsIndex={displayedLyricsIndex}
                  isBigScreen={isBigScreen}
                  isDesktopOrLaptop={isDesktopOrLaptop}
                  isTabletOrMobile={isTabletOrMobile}
                />
              </div>
            );
          })}
        </div>
        {!currentLrc.fullySynced ? (
          <Link to={`/lyricseditor?albumId=${selectedAlbum}&songId=${selectedSong}&trackId=${selectedTrack}`}>
            <p style={{ textDecoration: "underline", margin: 0.5, color: 'whitesmoke' }}>Lyrics are not synced completely yet.</p>
          </Link>
        ) : null}
        </div>
      ) : <div
      style={{
        width: isTabletOrMobile ? "100%" : "25rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 10,
        height: 400,
      }}
    >
      <p style={{ fontSize: "1.25rem" }}>
        No Lyrics for this track found
      </p>
      <Link
        to={`/lyricseditor?albumId=${selectedAlbum}&songId=${selectedSong}&trackId=${selectedTrack}`}
      >
        <button className="glass">Add Lyrics</button>
      </Link>
    </div> }

    </div>
  );
};

export default Lyrics;
