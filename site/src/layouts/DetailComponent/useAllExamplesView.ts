import { useContext } from "react";
import {
  AllExamplesViewContextType,
  AllExamplesViewContext,
} from "./DetailComponent";

export const useAllExamplesView = (): AllExamplesViewContextType => {
  return useContext(AllExamplesViewContext);
};
