import { createContext, useContext } from "react";

export const DialogNextContext = createContext<{
  headingId: string;
  headingRef?: React.RefObject<HTMLHeadingElement>;
}>({
  headingId: "dialog-next-heading",
  headingRef: undefined,
});

export const useDialogNextContext = () => {
  return useContext(DialogNextContext);
};
