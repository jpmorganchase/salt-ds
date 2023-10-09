import { styled } from "@storybook/theming";
import { transparentize } from "polished";

export const TableWrapper = styled.table<{
  compact?: boolean;
  inAddonPanel?: boolean;
  isLoading?: boolean;
}>(({ theme, compact, inAddonPanel }) => ({
  "&&": {
    // Resets for cascading/system styles
    borderSpacing: 0,
    color: theme.color.defaultText,

    "td, th": {
      padding: 0,
      border: "none",
      verticalAlign: "top",
      textOverflow: "ellipsis",
    },
    // End Resets

    fontSize: theme.typography.size.s2 - 1,
    lineHeight: "20px",
    textAlign: "left",
    width: "100%",

    // Margin collapse
    marginTop: inAddonPanel ? 0 : 25,
    marginBottom: inAddonPanel ? 0 : 40,

    "thead th:first-of-type, td:first-of-type": {
      // intentionally specify thead here
      width: "25%",
    },

    "th:first-of-type, td:first-of-type": {
      paddingLeft: 20,
    },

    "th:nth-of-type(2), td:nth-of-type(2)": {
      ...(compact
        ? null
        : {
            // Description column
            width: "35%",
          }),
    },

    "td:nth-of-type(3)": {
      ...(compact
        ? null
        : {
            // Defaults column
            width: "15%",
          }),
    },

    "th:last-of-type, td:last-of-type": {
      paddingRight: 20,
      ...(compact
        ? null
        : {
            // Controls column
            width: "25%",
          }),
    },

    th: {
      color:
        theme.base === "light"
          ? transparentize(0.25, theme.color.defaultText)
          : transparentize(0.45, theme.color.defaultText),
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 15,
      paddingRight: 15,
    },

    td: {
      paddingTop: "10px",
      paddingBottom: "10px",

      "&:not(:first-of-type)": {
        paddingLeft: 15,
        paddingRight: 15,
      },

      "&:last-of-type": {
        paddingRight: 20,
      },
    },

    // Makes border alignment consistent w/other DocBlocks
    marginLeft: inAddonPanel ? 0 : 1,
    marginRight: inAddonPanel ? 0 : 1,

    tbody: {
      // Safari doesn't love shadows on tbody so we need to use a shadow filter. In order to do this,
      // the table cells all need to be solid so they have a background color applied.
      // I wasn't sure what kinds of content go in these tables so I was extra specific with selectors
      // to avoid unexpected surprises.
      ...(inAddonPanel
        ? null
        : {
            filter:
              theme.base === "light"
                ? `drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.10))`
                : `drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.20))`,
          }),

      "> tr > *": {
        // For filter to work properly, the table cells all need to be opaque.
        background: theme.background.content,
        borderTop: `1px solid ${theme.appBorderColor}`,
      },

      ...(inAddonPanel
        ? null
        : {
            // This works and I don't know why. :)
            "> tr:first-of-type > *": {
              borderBlockStart: `1px solid ${theme.appBorderColor}`,
            },
            "> tr:last-of-type > *": {
              borderBlockEnd: `1px solid ${theme.appBorderColor}`,
            },
            "> tr > *:first-of-type": {
              borderInlineStart: `1px solid ${theme.appBorderColor}`,
            },
            "> tr > *:last-of-type": {
              borderInlineEnd: `1px solid ${theme.appBorderColor}`,
            },

            // Thank you, Safari, for making me write code like this.
            "> tr:first-of-type > td:first-of-type": {
              borderTopLeftRadius: theme.appBorderRadius,
            },
            "> tr:first-of-type > td:last-of-type": {
              borderTopRightRadius: theme.appBorderRadius,
            },
            "> tr:last-of-type > td:first-of-type": {
              borderBottomLeftRadius: theme.appBorderRadius,
            },
            "> tr:last-of-type > td:last-of-type": {
              borderBottomRightRadius: theme.appBorderRadius,
            },
          }),
    },
    // End awesome table styling
  },
}));
