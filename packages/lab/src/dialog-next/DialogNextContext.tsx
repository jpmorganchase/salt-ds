import { createContext, useContext } from "react";
import { DialogNextProps } from "./DialogNext";

export const DialogNextContext = createContext<{
  headingId: string;
  open: DialogNextProps["open"];
  status?: DialogNextProps["status"];
  headingRef?: React.RefObject<HTMLHeadingElement>;
}>({
  open: false,
  headingId: "dialog-next-heading",
  status: undefined,
  headingRef: undefined,
});

export const useDialogNextContext = () => {
  return useContext(DialogNextContext);
};
