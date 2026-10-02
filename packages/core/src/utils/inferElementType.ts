// Uses the DOM tag name maps rather than `JSX.IntrinsicElements`, as the global
// `JSX` namespace isn't available in every supported version of the React types.
export type inferElementType<T> = T extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[T]
  : T extends keyof SVGElementTagNameMap
    ? SVGElementTagNameMap[T]
    : HTMLElement;
