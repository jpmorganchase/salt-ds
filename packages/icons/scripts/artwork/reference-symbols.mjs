import { box, circ, F, S } from "./primitives.mjs";

// Shared constructions retain the initial design language while omitting
// details that would change each symbol's intended meaning.
const C = (x, y, r) => S(circ(x, y, r));
const squareStroke = S;

// A single sphere grid has shared meridians and latitudes. Small curved
// branches fillet their junctions without independently constructing each cell.
const globeGrid = [
  "M2.5 12a9.5 9.5 0 1 0 19 0a9.5 9.5 0 1 0 -19 0Z",
  "M12 2.5a5 9.5 0 1 0 0 19a5 9.5 0 1 0 0-19",
  "M12 2.5V21.5",
  "M3.1682391336721523 8.5H20.831760866327848",
  "M10.9 8.5Q12 8.5 12 7.4M10.9 8.5Q12 8.5 12 9.6M13.1 8.5Q12 8.5 12 7.4M13.1 8.5Q12 8.5 12 9.6",
  "M6.251704807195869 8.5Q7.35170480719587 8.5 7.62524238898603 7.4M6.251704807195869 8.5Q7.35170480719587 8.5 7.162187257348215 9.6M8.45170480719587 8.5Q7.35170480719587 8.5 7.62524238898603 7.4M8.45170480719587 8.5Q7.35170480719587 8.5 7.162187257348215 9.6",
  "M4.268239133672152 8.5Q3.1682391336721523 8.5 3.687960539073458 7.4M4.268239133672152 8.5Q3.1682391336721523 8.5 2.8081557889616082 9.6",
  "M15.548295192804131 8.5Q16.64829519280413 8.5 16.37475761101397 7.4M15.548295192804131 8.5Q16.64829519280413 8.5 16.837812742651785 9.6M17.748295192804132 8.5Q16.64829519280413 8.5 16.37475761101397 7.4M17.748295192804132 8.5Q16.64829519280413 8.5 16.837812742651785 9.6",
  "M19.731760866327846 8.5Q20.831760866327848 8.5 20.312039460926542 7.4M19.731760866327846 8.5Q20.831760866327848 8.5 21.191844211038394 9.6",
  "M3.1682391336721523 15.5H20.831760866327848",
  "M10.9 15.5Q12 15.5 12 14.4M10.9 15.5Q12 15.5 12 16.6M13.1 15.5Q12 15.5 12 14.4M13.1 15.5Q12 15.5 12 16.6",
  "M6.251704807195869 15.5Q7.35170480719587 15.5 7.162187257348215 14.4M6.251704807195869 15.5Q7.35170480719587 15.5 7.625242388986031 16.6M8.45170480719587 15.5Q7.35170480719587 15.5 7.162187257348215 14.4M8.45170480719587 15.5Q7.35170480719587 15.5 7.625242388986031 16.6",
  "M4.268239133672152 15.5Q3.1682391336721523 15.5 2.8081557889616082 14.4M4.268239133672152 15.5Q3.1682391336721523 15.5 3.687960539073458 16.6",
  "M15.548295192804131 15.5Q16.64829519280413 15.5 16.837812742651785 14.4M15.548295192804131 15.5Q16.64829519280413 15.5 16.37475761101397 16.6M17.748295192804132 15.5Q16.64829519280413 15.5 16.837812742651785 14.4M17.748295192804132 15.5Q16.64829519280413 15.5 16.37475761101397 16.6",
  "M19.731760866327846 15.5Q20.831760866327848 15.5 21.191844211038394 14.4M19.731760866327846 15.5Q20.831760866327848 15.5 20.312039460926542 16.6",
];
const globeOutline = S(globeGrid.join(""));
// The original solid globe fills the central meridian band. Its inverse
// latitude gaps remain fixed, while the open rim and side grid share strokes.
const globeOuterLatitudes =
  "M3.1682391336721523 8.5H7.35170480719587M16.64829519280413 8.5H20.831760866327848M3.1682391336721523 15.5H7.35170480719587M16.64829519280413 15.5H20.831760866327848";
const globeFilledBand =
  "M7.21269 9.25H16.78731C16.92564 10.12051 17 11.04376 17 12C17 12.95624 16.92564 13.87949 16.78731 14.75H7.21269C7.07436 13.87949 7 12.95624 7 12C7 11.04376 7.07436 10.12051 7.21269 9.25ZM16.47297 16.25C15.65203 19.36301 13.95736 21.5 12 21.5C10.04264 21.5 8.34797 19.36301 7.52703 16.25H16.47297ZM12 2.5C13.95736 2.5 15.65203 4.63699 16.47297 7.75H7.52703C8.34797 4.63699 10.04264 2.5 12 2.5Z";
const globeSolid =
  S(
    globeGrid[0] +
      globeOuterLatitudes +
      globeGrid[6] +
      globeGrid[8] +
      globeGrid[12] +
      globeGrid[14],
  ) + F(globeFilledBand);

// Explicit straight segments form the pointed upper cleft in both variants.
const heart =
  "M12 20.55C8.8 18.4 2.5 13.5 2.5 8.3C2.5 5.65 4.6 3.45 7.25 3.45C9.25 3.45 10.65 4.75 11.1 5.5L12 7L12.9 5.5C13.35 4.75 14.75 3.45 16.75 3.45C19.4 3.45 21.5 5.65 21.5 8.3C21.5 13.5 15.2 18.4 12 20.55Z";

// Currency marks retain the initial design's filled glyphs. Their open
// forms stay legible inside the surrounding fixed-width coin strokes.
const exchangeSymbols =
  "M7.75 15.955 9.605 14.1l-.705-.705-1.295 1.295a.498.498 0 0 1-.705 0l-1.295-1.295-.705.705 1.855 1.855v.295h-1v1h.5c.275 0 .5.225.5.5v1.5h1v-1.5c0-.275.225-.5.5-.5h.5v-1h-1v-.295zm4.265-8.705c-.285.01-.515-.22-.515-.5s.225-.5.5-.5.5.225.5.5h1c0-.595-.345-1.1-.85-1.345-.09-.045-.15-.13-.15-.23V4.75h-1v.425c0 .1-.06.185-.15.23-.775.375-1.18 1.39-.505 2.36.255.365.695.495 1.14.48.285-.01.515.22.515.5s-.225.5-.5.5-.5-.225-.5-.5h-1c0 .595.345 1.1.85 1.345.09.045.15.13.15.23v.425h1v-.425c0-.1.06-.185.15-.23.775-.375 1.18-1.39.505-2.36-.255-.365-.695-.495-1.14-.48m3.75 10.15c-.19-.19-.265-.65.235-.65h1.415v-1H16c-.5 0-.42-.46-.235-.65.07-.07.15-.135.235-.19.625-.415 1.525-.35 2.065.19l.705-.705c-1.025-1.025-2.69-1.025-3.71 0-.495.495-.77 1.155-.77 1.855s.275 1.36.77 1.855c.51.51 1.185.77 1.855.77s1.345-.255 1.855-.77l-.705-.705c-.615.615-1.685.615-2.3 0";
const dollarSymbol =
  "M12.03 11c-.57.02-1.03-.44-1.03-1s.45-1 1-1 1 .45 1 1h2c0-1.19-.69-2.2-1.7-2.69-.18-.09-.3-.26-.3-.46V6h-2v.85c0 .2-.12.37-.3.46-1.55.75-2.36 2.78-1.01 4.72.51.73 1.39.99 2.28.96.57-.02 1.03.44 1.03 1s-.45 1-1 1-1-.45-1-1H9c0 1.19.69 2.2 1.7 2.69.18.09.3.26.3.46v.85h2v-.85c0-.2.12-.37.3-.46 1.55-.75 2.36-2.78 1.01-4.72-.51-.73-1.39-.99-2.28-.96";
const exchangeCoins =
  C(12, 7.875, 4.75) + C(7.25, 16.125, 4.75) + C(16.75, 16.125, 4.75);

// The initial sun design attaches short cardinal rays and long diagonal rays
// to a large circular field. Its lightning bolt is omitted from "light".
const sunRays = S(
  "M12 2V4.5M12 19.5V22M2 12H4.5M19.5 12H22M3.5 3.5L6.7 6.7M17.3 17.3L20.5 20.5M3.5 20.5L6.7 17.3M17.3 6.7L20.5 3.5",
);
const sunOutline = C(12, 12, 7.5) + sunRays;

// A broad, shallow screen and a separate base retain the initial housing
// construction. Its graph decoration is omitted for the laptop meaning.
const laptopScreen =
  "M3.5 5H20.5V15.5Q20.5 16.5 19.5 16.5H4.5Q3.5 16.5 3.5 15.5Z";
const laptopBase = "M2.5 16.5H21.5V18Q21.5 19 20.5 19H3.5Q2.5 19 2.5 18Z";
const laptopOutline = squareStroke(laptopScreen) + squareStroke(laptopBase);
const laptopSolid = F(laptopScreen) + squareStroke(laptopBase);
// Related housings use the same broad proportions. The display pedestal
// retains an open stem and filleted foot.
const displayFrame = "M2.5 3.5H21.5V17.5H2.5Z";
const displayAperture =
  "M3.75 3.5H20.25Q21.5 3.5 21.5 4.75V16.25Q21.5 17.5 20.25 17.5H3.75Q2.5 17.5 2.5 16.25V4.75Q2.5 3.5 3.75 3.5Z";
const pedestal = S(
  "M4 21H20M4 21H10Q10.5 21 10.5 20.5V18Q10.5 17.5 10 17.5M14 17.5Q13.5 17.5 13.5 18V20.5Q13.5 21 14 21H20",
);
const displayOutline = S(displayFrame) + S(displayAperture) + pedestal;
const displaySolid = F(box(2, 3, 20, 15)) + pedestal;

const browserFrame = "M2.5 3.5H21.5V20.5H2.5Z";
const browserContent =
  "M3.75 8.25H20.25Q21.5 8.25 21.5 9.5V19.25Q21.5 20.5 20.25 20.5H3.75Q2.5 20.5 2.5 19.25V9.5Q2.5 8.25 3.75 8.25Z";
const browserButtons = F(circ(5, 5.875, 0.5) + circ(7.5, 5.875, 0.5));
const browserOutline = S(browserFrame) + S(browserContent) + browserButtons;
// Fill only the header, keeping the shared stroked frame around the content.
const browserSolid =
  F(box(2.5, 3.5, 19, 4.75) + circ(5, 5.875, 0.5) + circ(7.5, 5.875, 0.5)) +
  S(browserFrame) +
  S(browserContent);
const referenceSymbols = {
  globe: [globeOutline, globeSolid],
  like: [S(heart), F(heart)],
  currency: [
    C(12, 12, 9.75) + F(dollarSymbol),
    F(circ(12, 12, 10.25) + dollarSymbol),
  ],
  "currency-exchange": [exchangeCoins + F(exchangeSymbols)],
  light: [sunOutline, F(circ(12, 12, 8)) + sunRays],
  laptop: [laptopOutline, laptopSolid],
  display: [displayOutline, displaySolid],
  browser: [browserOutline, browserSolid],
};

export default referenceSymbols;
