import { Avatar, type AvatarProps, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, useEffect } from "react";
import { useContactDetailsContext } from "./internal";

const withBaseName = makePrefixer("saltContactAvatar");

export type ContactAvatarProps = AvatarProps;

export const ContactAvatar = forwardRef<HTMLDivElement, ContactAvatarProps>(
  (props, ref) => {
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
          className,
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
  },
);
