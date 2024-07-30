export type SliderValue = [number] | [number, number];
export type SliderChangeHandler = (value: SliderValue) => void;
export type ThumbIndex = 0 | 1;
export type ActiveThumbIndex = ThumbIndex | undefined;
