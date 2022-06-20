import { makePrefixer, useForkRef } from "@jpmorganchase/uitk-core";
import cn from "classnames";
import { forwardRef, HTMLAttributes, useState } from "react";
import { ContactDetailsContext, useComponentSize } from "./internal";

import "./ContactDetails.css";

const withBaseName = makePrefixer("uitkContactDetails");

export type ContactDetailsVariant = "default" | "compact" | "mini";

export interface ContactDetailsProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ContactDetailsVariant;
  stackAtBreakpoint?: number;
  embedded?: boolean;
}

function getClassName(variant: ContactDetailsVariant, isStacked?: boolean) {
  return withBaseName(`${variant}${isStacked ? "-stacked" : ""}`);
}

export const ContactDetails = forwardRef<HTMLDivElement, ContactDetailsProps>(
  function ContactDetails(props, externalRef) {
    const {
      children,
      variant = "default",
      className,
      stackAtBreakpoint = 300,
      embedded,
      ...restProps
    } = props;

    const [hasAvatar, setHasAvatar] = useState<boolean>(false);
    const [primary, setPrimary] = useState<string>();
    const [primaryId, setPrimaryId] = useState<string>();

    const [secondary, setSecondary] = useState<string>();
    const [secondaryId, setSecondaryId] = useState<string>();

    const [tertiary, setTertiary] = useState<string>();
    const [tertiaryId, setTertiaryId] = useState<string>();

    const [containerRef, componentSize] =
      useComponentSize<HTMLDivElement>(stackAtBreakpoint);
    const isStacked = componentSize && componentSize.width < stackAtBreakpoint;
    const ref = useForkRef(externalRef, containerRef);

    const contextValue = {
      variant,
      hasAvatar,
      setHasAvatar,
      isStacked,
      primary,
      setPrimary,
      primaryId,
      setPrimaryId,
      secondary,
      setSecondary,
      secondaryId,
      setSecondaryId,
      tertiary,
      setTertiary,
      tertiaryId,
      setTertiaryId,
    };

    const showNoAvatar = !hasAvatar && !embedded && variant !== "mini";

    return (
      <ContactDetailsContext.Provider value={contextValue}>
        <div
          {...restProps}
          ref={ref}
          className={cn(
            withBaseName(),
            getClassName(variant, isStacked),
            {
              [withBaseName("embedded")]: embedded,
              [withBaseName("noAvatar")]: showNoAvatar,
            },
            className
          )}
          role="article"
          aria-roledescription="Contact Card"
        >
          {children}
          {showNoAvatar ? (
            <div className={withBaseName("noAvatarIndicator")} />
          ) : null}
        </div>
      </ContactDetailsContext.Provider>
    );
  }
);
