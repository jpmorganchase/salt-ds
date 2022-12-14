import { forwardRef, useEffect } from "react";
import { makePrefixer } from "@salt-ds/core";
import { Avatar, AvatarProps } from "../avatar";
import { useContactDetailsContext } from "./internal";
import cn from "classnames";

const withBaseName = makePrefixer("uitkContactAvatar");

export interface ContactAvatarProps extends AvatarProps {}

export const ContactAvatar = forwardRef<HTMLDivElement, ContactAvatarProps>(
  function (props, ref) {
    const { className, ...restProps } = props;
    const context = useContactDetailsContext();
    const { variant, primary, isStacked, setHasAvatar } = context;

    useEffect(() => {
      setHasAvatar(true);
      return () => {
        setHasAvatar(false);
      };
    }, [setHasAvatar]);

    if (variant === "mini") {
      return null;
    }

    const avatarSize = variant === "default" ? "large" : "medium";
    return (
      <Avatar
        {...restProps}
        ref={ref}
        aria-hidden={true}
        className={cn(
          withBaseName(),
          {
            [withBaseName("stacked")]: isStacked,
          },
          className
        )}
        size={avatarSize}
      >
        {primary
          ? primary
              .split(" ")
              .map((x) => x.charAt(0))
              .slice(0, 2)
          : null}
      </Avatar>
    );
  }
);
