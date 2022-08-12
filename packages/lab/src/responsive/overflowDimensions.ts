import { dimensionsType } from "./overflowTypes";

export const Dimensions: dimensionsType = {
  horizontal: {
    size: "clientWidth",
    depth: "clientHeight",
    scrollDepth: "scrollHeight",
  },
  vertical: {
    size: "clientHeight",
    depth: "clientWidth",
    scrollDepth: "scrollWidth",
  },
};
