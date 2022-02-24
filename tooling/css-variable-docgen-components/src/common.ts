import { CSSObject, styled, Theme } from "@storybook/theming";
import { transparentize } from "polished";

export const withReset = ({ theme }: { theme: Theme }): CSSObject => ({
  fontFamily: theme.typography.fonts.base,
  fontSize: theme.typography.size.s3,
  margin: 0,

  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
  WebkitOverflowScrolling: "touch",
});

export const codeCommon = ({ theme }: { theme: Theme }): CSSObject => ({
  lineHeight: 1,
  margin: "0 2px",
  padding: "3px 5px",
  whiteSpace: "nowrap",

  borderRadius: 3,
  fontSize: theme.typography.size.s2 - 1,

  border:
    theme.base === "light"
      ? `1px solid ${theme.color.mediumlight}`
      : `1px solid ${theme.color.darker}`,
  color:
    theme.base === "light"
      ? transparentize(0.1, theme.color.defaultText)
      : transparentize(0.3, theme.color.defaultText),
  backgroundColor:
    theme.base === "light" ? theme.color.lighter : theme.color.border,
});

export const Name = styled.span({ fontWeight: "bold" });

export const Description = styled.div(({ theme }) => ({
  "&&": {
    p: {
      margin: "0 0 10px 0",
    },
    a: {
      color: theme.color.secondary,
    },
  },

  code: {
    ...codeCommon({ theme }),
    fontSize: 12,
    fontFamily: theme.typography.fonts.mono,
  },

  "& code": {
    margin: 0,
    display: "inline-block",
  },

  "& pre > code": {
    whiteSpace: "pre-wrap",
  },
}));

export const StyledTd = styled.td(() => ({
  paddingLeft: "20px !important",
}));
