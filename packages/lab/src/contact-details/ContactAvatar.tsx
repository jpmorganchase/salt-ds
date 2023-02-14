import { forwardRef, useEffect } from "react";
import { makePrefixer } from "@salt-ds/core";
import { useContactDetailsContext } from "./internal";
import { clsx } from "clsx";
import { Avatar, AvatarProps } from "../avatar";

const withBaseName = makePrefixer("saltContactAvatar");

export type ContactAvatarProps = AvatarProps;

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

    const avatarSize = variant === "default" ? 3 : 2;
    return (
      <Avatar
        {...restProps}
        ref={ref}
        aria-hidden={true}
        className={clsx(
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
