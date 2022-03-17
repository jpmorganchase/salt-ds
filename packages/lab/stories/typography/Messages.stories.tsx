import { useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Button } from "@brandname/core";

import { DoubleChevronUpIcon, DoubleChevronDownIcon } from "@brandname/icons";

import { Text, LabelCaption, HelpText, P, Span, Div } from "@brandname/lab";

export default {
  title: "Lab/Typography",
  component: Text,
} as ComponentMeta<typeof Text>;

const ResponsiveTextComponent: ComponentStory<typeof Text> = (props) => {
  const [expanded1, setExpand1] = useState(false);
  const [expanded2, setExpand2] = useState(false);
  const [expanded3, setExpand3] = useState(false);
  const [expanded4, setExpand4] = useState(false);

  const [hidden1, setHidden1] = useState(true);
  const [hidden2, setHidden2] = useState(true);
  const [hidden3, setHidden3] = useState(true);
  const [hidden4, setHidden4] = useState(true);

  const boxStyle = {
    display: "flex",
    border: "1px solid #ccc",
    padding: 10,
    justifyContent: "space-between",
    alignItems: "baseline",
  };

  return (
    <div>
      <div style={boxStyle}>
        <div>
          <Div
            expanded={expanded1}
            id="content1"
            aria-hidden={!expanded1}
            onOverflow={(isOverflowed: boolean) => {
              setHidden1(!isOverflowed && !expanded1);
            }}
          >
            The European <i>languages</i> are members of the same family. Their
            separate existence is a myth. For science, music, sport, etc, Europe
            uses the same vocabulary. The languages only differ in their
            grammar, their pronunciation and their most common words. Everyone
            realizes why a new common language would be desirable: one could
            refuse to pay expensive translators. The European languages are
            members of the same family. Their separate existence is a myth. For
            science, music, sport, etc, Europe uses the same vocabulary. The
            languages only differ in their grammar, their pronunciation and
            their most common words. Everyone realizes why a new common language
            would be desirable: one could refuse to pay expensive translators.
          </Div>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setExpand1(!expanded1);
          }}
          aria-expanded={expanded1}
          aria-controls="content1"
          aria-label={expanded1 ? "Collapse text" : "Expand text"}
          style={{ display: hidden1 ? "none" : "inline-block" }}
        >
          {expanded1 ? (
            <DoubleChevronUpIcon aria-hidden />
          ) : (
            <DoubleChevronDownIcon aria-hidden />
          )}
        </Button>
      </div>
      <div style={boxStyle}>
        <div>
          <Div
            expanded={expanded2}
            id="content2"
            aria-hidden={!expanded2}
            onOverflow={(isOverflowed: boolean) => {
              setHidden2(!isOverflowed && !expanded2);
            }}
          >
            Notice how the chevrons will appear on the right when this text
            truncates. Resize this screen until you see ellipsis and the
            chevron, then select the chevron button.
          </Div>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setExpand2(!expanded2);
          }}
          aria-expanded={expanded2}
          aria-controls="content2"
          aria-label={expanded2 ? "Collapse text" : "Expand text"}
          style={{ display: hidden2 ? "none" : "inline-block" }}
        >
          {expanded2 ? (
            <DoubleChevronUpIcon aria-hidden />
          ) : (
            <DoubleChevronDownIcon aria-hidden />
          )}
        </Button>
      </div>
      <div style={boxStyle}>
        <div>
          <P
            maxRows={2}
            expanded={expanded3}
            id="content3"
            aria-hidden={!expanded3}
            onOverflow={(isOverflowed: boolean) => {
              setHidden3(!isOverflowed && !expanded3);
            }}
          >
            maxRows=2. Notice how the chevrons will appear on the right when
            this text truncates. Resize this screen until you see ellipsis and
            the chevron, then select the chevron button.
          </P>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setExpand3(!expanded3);
          }}
          aria-expanded={expanded3}
          aria-controls="content3"
          aria-label={expanded3 ? "Collapse text" : "Expand text"}
          style={{ display: hidden3 ? "none" : "inline-block" }}
        >
          {expanded3 ? (
            <DoubleChevronUpIcon aria-hidden />
          ) : (
            <DoubleChevronDownIcon aria-hidden />
          )}
        </Button>
      </div>
      <div style={boxStyle}>
        <div>
          <Span
            expanded={expanded4}
            maxRows={2}
            id="content4"
            aria-hidden={!expanded4}
            onOverflow={(isOverflowed: boolean) => {
              setHidden4(!isOverflowed && !expanded4);
            }}
          >
            maxRows=2. A wonderful serenity has taken possession of my entire
            soul, like these sweet mornings of spring which I enjoy with my
            whole heart. I am alone, and feel the charm of existence in this
            spot, which was created for the bliss of souls like mine. I am so
            happy, my dear friend, so absorbed in the exquisite sense of mere
            tranquil existence, that I neglect my talents. I should be incapable
            of drawing a single stroke at the present moment; and yet I feel
            that I never was a greater artist than now. When, while the lovely
            valley teems with vapour around me, and the meridian sun strikes the
            upper surface of the impenetrable foliage of my trees, and but a few
            stray gleams steal into the inner sanctuary, I throw myself down
            among the tall grass by the trickling stream; and, as I lie close to
            the earth, a thousand unknown plants are noticed by me: when I hear
            the buzz of the little world among the stalks, and grow familiar
            with the countless indescribable forms of the insects and flies,
            then I feel the presence of the Almighty, who formed us in his own
            image, and the breath
          </Span>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setExpand4(!expanded4);
          }}
          aria-expanded={expanded4}
          aria-controls="content4"
          aria-label={expanded4 ? "Collapse text" : "Expand text"}
          style={{ display: hidden4 ? "none" : "inline-block" }}
        >
          {expanded4 ? (
            <DoubleChevronUpIcon aria-hidden />
          ) : (
            <DoubleChevronDownIcon aria-hidden />
          )}
        </Button>
      </div>
    </div>
  );
};
export const MessagesExample = ResponsiveTextComponent.bind({});
MessagesExample.parameters = {
  controls: {
    exclude: [
      "elementType",
      "maxRows",
      "showTooltip",
      "tooltipProps",
      "truncate",
      "expanded",
      "style",
      "onOverflow",
      "marginTop",
      "marginBottom",
    ],
  },
};
