import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useState } from "react";
import contactDetailsCss from "./ContactDetails.css";
import { ContactDetailsContext, useComponentSize } from "./internal";

const withBaseName = makePrefixer("saltContactDetails");

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

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-contact-details",
      css: contactDetailsCss,
      window: targetWindow,
    });

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

    variant === "compact" &&
      isStacked &&
      console.log("componentSize", componentSize.width, containerRef.current);

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
          className={clsx(
            withBaseName(),
            getClassName(variant, isStacked),
            {
              [withBaseName("embedded")]: embedded,
              [withBaseName("noAvatar")]: showNoAvatar,
            },
            className,
          )}
          role="article"
          aria-roledescription="Contact Card"
        >
          {children}
          {showNoAvatar ? (
            <div className={withBaseName("noAvatar-indicator")} />
          ) : null}
        </div>
      </ContactDetailsContext.Provider>
    );
  },
);
