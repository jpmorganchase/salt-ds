import { type RefObject, createContext } from "react";

type refsMap<T> = {
  [key: string]: RefObject<T>;
};
export default createContext<refsMap<HTMLButtonElement>>({});
