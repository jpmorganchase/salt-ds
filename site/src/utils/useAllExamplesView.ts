import { useContext, createContext, Dispatch, SetStateAction } from "react";

export type AllExamplesViewContextType = {
  allExamplesView?: boolean;
  setAllExamplesView: Dispatch<SetStateAction<boolean>>;
};

export const AllExamplesViewContext = createContext<AllExamplesViewContextType>(
  { allExamplesView: false, setAllExamplesView: () => {} }
);

export const useAllExamplesView = (): AllExamplesViewContextType => {
  return useContext(AllExamplesViewContext);
};
