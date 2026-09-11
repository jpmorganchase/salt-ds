import { box, circ, F, group, S } from "./primitives.mjs";

// Shared constructions retain the initial design language while omitting
// details that would change each symbol's intended meaning.
const C = (x, y, r) => S(circ(x, y, r));
const squareStroke = S;

// The sphere keeps one curved meridian and two latitudes. Interior lines are
// secondary to the rim; omitting the redundant central meridian leaves the
// small cells open at the default 12px size.
const globeRim = circ(12, 12, 9.5);
const globeMeridian = "M12 2.5a5 9.5 0 1 0 0 19a5 9.5 0 1 0 0-19Z";
const globeLatitudes =
  "M3.1682391336721523 8.5H20.831760866327848M3.1682391336721523 15.5H20.831760866327848";
const globeOutline = S(globeRim) + S(globeMeridian + globeLatitudes, 1.08);
// The solid uses the same grid as transparent channels through a filled sphere.
// Latitude gaps are 1.5 construction units; the curved gaps use a true .75-unit
// normal offset of the shared meridian. Their union leaves nine filled cells.
const globeCells =
  "M12 3.25L12 3.25C12.43023 3.25 12.87119 3.3934 13.32901 3.72184C13.78683 4.05028 14.25042 4.56868 14.66087 5.25552C15.07132 5.94235 15.4279 6.79441 15.69468 7.75L8.30532 7.75C8.5721 6.79441 8.92868 5.94235 9.33913 5.25552C9.74958 4.56868 10.21317 4.05028 10.67099 3.72184C11.12881 3.3934 11.56977 3.25 12 3.25ZM9.32892 2.88324L9.32892 2.88324C8.7378 3.42288 8.2228 4.12698 7.79058 4.9526C7.35836 5.77822 7.00931 6.72655 6.75402 7.75L3.50368 7.75A9.5 9.5 0 0 1 9.32892 2.88324ZM14.67108 2.88324L14.67108 2.88324A9.5 9.5 0 0 1 20.49632 7.75L17.24598 7.75C16.99069 6.72655 16.64164 5.77822 16.20942 4.9526C15.7772 4.12698 15.2622 3.42288 14.67108 2.88324ZM7.97397 9.25L16.02603 9.25C16.17381 10.13481 16.25 11.06734 16.25 12C16.25 12.93266 16.17381 13.86519 16.02603 14.75L7.97397 14.75C7.82619 13.86519 7.75 12.93266 7.75 12C7.75 11.06734 7.82619 10.13481 7.97397 9.25ZM2.90673 9.25L6.45505 9.25C6.319 10.14452 6.25 11.07221 6.25 12C6.25 12.92779 6.319 13.85548 6.45505 14.75L2.90673 14.75A9.5 9.5 0 0 1 2.90673 9.25ZM17.54495 9.25L21.09327 9.25A9.5 9.5 0 0 1 21.09327 14.75L17.54495 14.75C17.681 13.85548 17.75 12.92779 17.75 12C17.75 11.07221 17.681 10.14452 17.54495 9.25ZM8.30532 16.25L15.69468 16.25C15.4279 17.20559 15.07132 18.05765 14.66087 18.74448C14.25042 19.43132 13.78683 19.94972 13.32901 20.27816C12.87119 20.6066 12.43023 20.75 12 20.75L12 20.75C11.56977 20.75 11.12881 20.6066 10.67099 20.27816C10.21317 19.94972 9.74958 19.43132 9.33913 18.74448C8.92868 18.05765 8.5721 17.20559 8.30532 16.25ZM3.50368 16.25L6.75402 16.25C7.00931 17.27345 7.35836 18.22178 7.79058 19.0474C8.2228 19.87302 8.7378 20.57712 9.32892 21.11676L9.32892 21.11676A9.5 9.5 0 0 1 3.50368 16.25ZM17.24598 16.25L20.49632 16.25A9.5 9.5 0 0 1 14.67108 21.11676L14.67108 21.11676C15.2622 20.57712 15.7772 19.87302 16.20942 19.0474C16.64164 18.22178 16.99069 17.27345 17.24598 16.25Z";
const globeSolid = F(globeCells) + S(globeRim);

// Explicit straight segments form the pointed upper cleft in both variants.
const heart =
  "M12 20.55C8.8 18.4 2.5 13.5 2.5 8.3C2.5 5.65 4.6 3.45 7.25 3.45C9.25 3.45 10.65 4.75 11.1 5.5L12 7L12.9 5.5C13.35 4.75 14.75 3.45 16.75 3.45C19.4 3.45 21.5 5.65 21.5 8.3C21.5 13.5 15.2 18.4 12 20.55Z";

// Currency marks retain the initial design's filled glyphs. Their open
// forms stay legible inside the surrounding fixed-width coin strokes.
const exchangeYen =
  "M7.75 15.955 9.605 14.1l-.705-.705-1.295 1.295a.498.498 0 0 1-.705 0l-1.295-1.295-.705.705 1.855 1.855v.295h-1v1h.5c.275 0 .5.225.5.5v1.5h1v-1.5c0-.275.225-.5.5-.5h.5v-1h-1v-.295z";
const exchangeDollar =
  "M12.015 7.25c-.285.01-.515-.22-.515-.5s.225-.5.5-.5.5.225.5.5h1c0-.595-.345-1.1-.85-1.345-.09-.045-.15-.13-.15-.23V4.75h-1v.425c0 .1-.06.185-.15.23-.775.375-1.18 1.39-.505 2.36.255.365.695.495 1.14.48.285-.01.515.22.515.5s-.225.5-.5.5-.5-.225-.5-.5h-1c0 .595.345 1.1.85 1.345.09.045.15.13.15.23v.425h1v-.425c0-.1.06-.185.15-.23.775-.375 1.18-1.39.505-2.36-.255-.365-.695-.495-1.14-.48";
const exchangeEuro =
  "M15.765 17.4c-.19-.19-.265-.65.235-.65h1.415v-1H16c-.5 0-.42-.46-.235-.65.07-.07.15-.135.235-.19.625-.415 1.525-.35 2.065.19l.705-.705c-1.025-1.025-2.69-1.025-3.71 0-.495.495-.77 1.155-.77 1.855s.275 1.36.77 1.855c.51.51 1.185.77 1.855.77s1.345-.255 1.855-.77l-.705-.705c-.615.615-1.685.615-2.3 0";
const dollarSymbol =
  "M12.03 11c-.57.02-1.03-.44-1.03-1s.45-1 1-1 1 .45 1 1h2c0-1.19-.69-2.2-1.7-2.69-.18-.09-.3-.26-.3-.46V6h-2v.85c0 .2-.12.37-.3.46-1.55.75-2.36 2.78-1.01 4.72.51.73 1.39.99 2.28.96.57-.02 1.03.44 1.03 1s-.45 1-1 1-1-.45-1-1H9c0 1.19.69 2.2 1.7 2.69.18.09.3.26.3.46v.85h2v-.85c0-.2.12-.37.3-.46 1.55-.75 2.36-2.78 1.01-4.72-.51-.73-1.39-.99-2.28-.96";
// Give the three rims separate silhouettes instead of a touching central knot.
// The lighter rims support the unchanged currency glyphs at native size.
const exchangeCoins = S(
  circ(12, 6.5, 4.5) + circ(6.25, 16.5, 4.5) + circ(17.75, 16.5, 4.5),
  1.08,
);
const separatedExchangeSymbols =
  group(F(exchangeYen), "translate(-1 .375)") +
  group(F(exchangeDollar), "translate(0 -1.375)") +
  group(F(exchangeEuro), "translate(1 .375)");

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
  "currency-exchange": [exchangeCoins + separatedExchangeSymbols],
  light: [sunOutline, F(circ(12, 12, 8)) + sunRays],
  laptop: [laptopOutline, laptopSolid],
  display: [displayOutline, displaySolid],
  browser: [browserOutline, browserSolid],
};

export default referenceSymbols;
