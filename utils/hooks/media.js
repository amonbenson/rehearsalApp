import { useMediaQuery } from "react-responsive"

export const useMediaBreakpoints = () => ({
    isDesktopOrLaptop: useMediaQuery({ query: "(min-width: 1224px)" }),
    isBigScreen: useMediaQuery({ query: "(min-width: 1824px)" }),
    isTabletOrMobile: useMediaQuery({ query: "(max-width: 1224px)" }),
    isPortrait: useMediaQuery({ query: "(orientation: portrait)" }),
    isRetina: useMediaQuery({ query: "(min-resolution: 2dppx)" }),
});
