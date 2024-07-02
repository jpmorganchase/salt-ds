import { codeCommon } from "@storybook/components";
import { type CSSObject, styled } from "@storybook/theming";

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
    ...(codeCommon({ theme }) as CSSObject),
    fontSize: 12,
    fontFamily: theme.typography.fonts.mono,
  } as CSSObject,

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
