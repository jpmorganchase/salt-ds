import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useIcon } from "../semantic-icon-provider";
import { makePrefixer, type RenderPropsType, renderProps } from "../utils";
import avatarCss from "./Avatar.css";
import { useAvatarImage } from "./useAvatarImage";

export type NameToInitials = (name?: string) => string;

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The name that Avatar represents.
   */
  name?: string;
  /**
   * Defines the function that gets initials. Default is capital first letter of each separate word in name.
   * If a function is not passed or returns undefined, Avatar will default to Icon.
   */
  nameToInitials?: NameToInitials;
  /**
   * Image src of Avatar.
   */
  src?: string;
  /**
   * Multiplier for the base avatar.
   */
  size?: number;
  /**
   * Icon to be used as a default item. Defaults to `UserIcon`.
   */
  fallbackIcon?: ReactNode;
  /**
   * Changes Avatar's color.
   */
  color?:
    | "accent"
    | "category-1"
    | "category-2"
    | "category-3"
    | "category-4"
    | "category-5"
    | "category-6"
    | "category-7"
    | "category-8"
    | "category-9"
    | "category-10"
    | "category-11"
    | "category-12"
    | "category-13"
    | "category-14"
    | "category-15"
    | "category-16"
    | "category-17"
    | "category-18"
    | "category-19"
    | "category-20";
  /**
   * Render prop to enable customisation of anchor element.
   */
  render?: RenderPropsType["render"];
}

const withBaseName = makePrefixer("saltAvatar");
const DEFAULT_AVATAR_SIZE = 2; // medium

const defaultNameToInitials = (name?: string) =>
  name
    ?.split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

// biome-ignore lint/suspicious/noExplicitAny: We don't know the exact type here
const AvatarAction = forwardRef(function AvatarAction(
  props: ComponentPropsWithoutRef<any>,
  ref,
) {
  return renderProps("div", { ref, ...props });
});

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  {
    className,
    children: childrenProp,
    color = "accent",
    name,
    nameToInitials = defaultNameToInitials,
    src,
    size = DEFAULT_AVATAR_SIZE,
    style: styleProp,
    fallbackIcon: fallbackIconProp,
    render,
    ...rest
  },
  ref,
) {
  const targetWindow = useWindow();
  const { UserIcon } = useIcon();

  const fallbackIcon =
    fallbackIconProp === undefined ? (
      <UserIcon aria-hidden />
    ) : (
      fallbackIconProp
    );

  useComponentCssInjection({
    testId: "salt-avatar",
    css: avatarCss,
    window: targetWindow,
  });

  let children: ReactNode;

  const style = {
    ...styleProp,
    "--saltAvatar-size-multiplier": `${size}`,
  };

  const status = useAvatarImage({ src });
  const hasImgNotFailing = status === "loaded";
  if (hasImgNotFailing) {
    children = <img alt="" src={src} />;
  } else if (childrenProp != null) {
    children = childrenProp;
  }

  const avatarInitials = nameToInitials(name);

  return (
    <AvatarAction
      ref={ref}
      style={style}
      className={clsx(
        withBaseName(),
        withBaseName(color),
        {
          [withBaseName("withImage")]: hasImgNotFailing,
        },
        className,
      )}
      role={name && !render ? "img" : undefined}
      aria-label={name}
      render={render}
      {...rest}
    >
      {children || avatarInitials || fallbackIcon}
    </AvatarAction>
  );
});
