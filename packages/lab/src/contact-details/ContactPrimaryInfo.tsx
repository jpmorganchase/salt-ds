import { forwardRef, HTMLAttributes, useEffect, useMemo } from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import cn from "classnames";
import { useId } from "../utils";
import { useContactDetailsContext } from "./internal";
import { Div } from "../typography";

const withBaseName = makePrefixer("uitkContactPrimaryInfo");

export interface ContactPrimaryInfoProps
  extends HTMLAttributes<HTMLDivElement> {
  text: string;
}

export const ContactPrimaryInfo = forwardRef<
  HTMLDivElement,
  ContactPrimaryInfoProps
>(function ContactPrimaryInfo(props, ref) {
  const {
    id: idProp,
    text,
    className,
    "aria-level": ariaLevel = 2,
    ...restProps
  } = props;
  const { setPrimary, setPrimaryId, secondaryId, tertiaryId, variant } =
    useContactDetailsContext();
  const id = useId(idProp);

  useEffect(() => {
    setPrimary(text || "");
    setPrimaryId(id);
    return () => {
      setPrimary(undefined);
      setPrimaryId(undefined);
    };
  }, [setPrimary, id, text, setPrimaryId]);

  return (
    <Div
      {...restProps}
      truncate
      maxRows={1}
      id={id}
      ref={ref}
      styleAs={variant === "default" ? "h2" : "h4"}
      className={cn(withBaseName(), className)}
      role="heading"
      aria-labelledby={`${id} ${secondaryId != null ? secondaryId : null} ${
        tertiaryId != null ? tertiaryId : null
      }`}
      aria-level={ariaLevel}
      data-testid="primary"
    >
      {text}
    </Div>
  );
});
