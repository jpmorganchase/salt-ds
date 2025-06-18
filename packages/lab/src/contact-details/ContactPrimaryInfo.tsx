import { makePrefixer, Text, useId } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useEffect } from "react";
import { useContactDetailsContext } from "./internal";

const withBaseName = makePrefixer("saltContactPrimaryInfo");

export interface ContactPrimaryInfoProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
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
    <Text
      {...restProps}
      maxRows={1}
      id={id}
      ref={ref}
      styleAs={variant === "default" ? "h2" : "h4"}
      className={clsx(withBaseName(), className)}
      role="heading"
      aria-labelledby={`${id} ${secondaryId ?? null} ${tertiaryId ?? null}`}
      aria-level={ariaLevel}
      data-testid="primary"
    >
      {text}
    </Text>
  );
});
