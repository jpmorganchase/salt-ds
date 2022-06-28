import { makePrefixer, useId } from "@jpmorganchase/uitk-core";
import cn from "classnames";
import { forwardRef, HTMLAttributes, useEffect } from "react";
import { useContactDetailsContext } from "./internal";

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
  const { setPrimary, setPrimaryId, secondaryId, tertiaryId } =
    useContactDetailsContext();
  const id = useId(idProp);

  useEffect(() => {
    setPrimary(text || "");
    setPrimaryId(id);
    return () => {
      setPrimary(undefined);
      setPrimaryId(undefined);
    };
  }, [setPrimary, id, setPrimaryId]);

  return (
    <div
      {...restProps}
      id={id}
      ref={ref}
      className={cn(withBaseName(), className)}
      role="heading"
      aria-labelledby={`${id} ${secondaryId != null ? secondaryId : null} ${
        tertiaryId != null ? tertiaryId : null
      }`}
      aria-level={ariaLevel}
      data-testid="primary"
    >
      {text}
    </div>
  );
});
