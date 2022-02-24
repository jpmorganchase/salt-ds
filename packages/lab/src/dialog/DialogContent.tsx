import { forwardRef, HTMLAttributes, useContext } from "react";
import classnames from "classnames";
import { makePrefixer } from "@brandname/core";
import { DialogContext } from "./internal/DialogContext";
import { useForkRef } from "../utils";
import "./DialogContent.css";

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {}

const withBaseName = makePrefixer("uitkDialogContent");

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(props, ref) {
    const { children, className, ...rest } = props;
    const { state, dialogId, setContentElement } = useContext(DialogContext);

    const handleRef = useForkRef(ref, setContentElement);

    return (
      <div
        {...rest}
        className={classnames(
          withBaseName(),
          className,
          {
            [withBaseName("leftGutter")]: !!state,
          },
          className
        )}
        id={`${dialogId}-body`}
        ref={handleRef}
      >
        {children}
      </div>
    );
  }
);
