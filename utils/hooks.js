import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

export const useMediaQueries = () => ({
  isDesktopOrLaptop: useMediaQuery({ query: "(min-width: 1224px)" }),
  isBigScreen: useMediaQuery({ query: "(min-width: 1824px)" }),
  isTabletOrMobile: useMediaQuery({ query: "(max-width: 1224px)" }),
  isPortrait: useMediaQuery({ query: "(orientation: portrait)" }),
  isRetina: useMediaQuery({ query: "(min-resolution: 2dppx)" }),
});

export const useEvent = (emitter, event, callback) => {
  useEffect(() => {
    const listener = (...args) => callback(...args);
    emitter.on(event, listener);
    return () => emitter.off(event, listener);
  });
}

export const useMember = (emitter, member, event=undefined) => {
  // create state with initial value
  const [value, setValue] = useState(emitter[member]);

  // member -> react synchronization
  useEvent(emitter, event || `${member}Change`, (value) => setValue(value));

  return value;
}
