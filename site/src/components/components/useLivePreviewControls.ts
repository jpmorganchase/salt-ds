import { useContext } from "react";
import {
  LivePreviewContextType,
  LivePreviewContext,
} from "./LivePreviewControls";

export const useLivePreviewControls = (): LivePreviewContextType => {
  return useContext(LivePreviewContext);
};
