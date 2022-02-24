import { ComponentType, forwardRef, HTMLAttributes, useEffect } from "react";
import { makePrefixer, IconProps } from "@brandname/core";
import cn from "classnames";
import { useId } from "../utils";
import {
  TruncatableValue,
  useContactDetailsContext,
  ValueComponentProps,
} from "./internal";

const withBaseName = makePrefixer("uitkContactSecondaryInfo");

export interface ContactSecondaryInfoProps
  extends HTMLAttributes<HTMLDivElement> {
  icon?: ComponentType<IconProps>;
  text: string;
  ValueComponent?: ComponentType<ValueComponentProps>;
}

export const ContactSecondaryInfo = forwardRef<
  HTMLDivElement,
  ContactSecondaryInfoProps
>(function ContactSecondaryInfo(props, ref) {
  const {
    id: idProp,
    text,
    icon: Icon,
    className,
    ValueComponent,
    ...restProps
  } = props;
  const { setSecondary, setSecondaryId } = useContactDetailsContext();
  const id = useId(idProp);

  useEffect(() => {
    setSecondary(text || "");
    setSecondaryId(id);
    return () => {
      setSecondary(undefined);
      setSecondaryId(undefined);
    };
  }, [id, text, setSecondary, setSecondaryId]);

  return (
    <div
      {...restProps}
      id={id}
      ref={ref}
      className={cn(withBaseName(), className)}
      data-testid="secondary"
    >
      {Icon ? <Icon className={withBaseName("icon")} /> : null}
      <TruncatableValue
        className={withBaseName("value")}
        value={text}
        ValueComponent={ValueComponent}
      />
    </div>
  );
});
