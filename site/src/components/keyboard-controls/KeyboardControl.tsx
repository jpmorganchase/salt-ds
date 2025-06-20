import { type FC, Fragment, type ReactNode } from "react";

export interface KeyboardControlProps {
  children: ReactNode;

  /**
   * The keyboard key(s) or combo(s) being described.
   *
   * Use "+" to indcate combos - i.e. when more than one key
   * need to pressed at the same time (e.g. "CTRL + A").
   *
   * Use "/" or "or" to separate alternative keys or combos.
   * E.g. "SPACE / ENTER" or "SPACE or ENTER"
   *
   * You can combine alternate combos too.
   * E.g.: "CTRL + A / CMD + A"
   */
  keyOrCombos: string;

  className?: string;
}

const keyOrComboSeparator = /\s*([+/]|or)\s*/i;

function splitCombo(keyOrCombo: string): string[] {
  return keyOrCombo.split(keyOrComboSeparator);
}

const Keys: FC<{ keyOrCombos: string }> = ({ keyOrCombos }) => {
  return (
    <>
      {splitCombo(keyOrCombos).map((keyOrSeparator, index) => {
        // Odd indexes will be the "+" or "/" separators
        if (index % 2 === 1) {
          return <Fragment key={index}> {keyOrSeparator} </Fragment>;
        }
        return <kbd key={index}>{keyOrSeparator}</kbd>;
      })}
    </>
  );
};

export const KeyboardControl: FC<KeyboardControlProps> = ({
  children,
  keyOrCombos,
  className,
}) => {
  return (
    <tr className={className}>
      <td>
        <Keys keyOrCombos={keyOrCombos} />
      </td>
      <td>{children}</td>
    </tr>
  );
};
