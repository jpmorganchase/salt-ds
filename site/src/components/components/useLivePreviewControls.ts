import { useContext } from "react";
import {
  LivePreviewContext,
  type LivePreviewContextType,
} from "./LivePreviewControls";

export const useLivePreviewControls = (): LivePreviewContextType => {
  return useContext(LivePreviewContext);
};
