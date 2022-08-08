import { createContext } from "react";

export type AnnounceFn = (announcement: string, delay?: number) => void;

export type AriaAnnouncer = {
  announce: AnnounceFn;
};

export const AriaAnnouncerContext = createContext<AriaAnnouncer | undefined>(
  undefined
);
