import { useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Button } from "@brandname/core";

import { DoubleChevronUpIcon, DoubleChevronDownIcon } from "@brandname/icons";

import { Text, LabelCaption, HelpText, P, Span, Div } from "@brandname/lab";

export default {
  title: "Lab/Typography",
  component: Text,
  argTypes: {
    elementType: {
      options: ["h1", "h2", "h3", "h4", "p", "div", "span"],
      control: { type: "select" },
    },
    maxRows: {
      control: { type: "number" },
    },
    fontSize: {
      control: { type: "number" },
    },
  },
} as ComponentMeta<typeof Text>;

const ResponsiveTextComponent: ComponentStory<typeof Text> = (props) => {
  const box = {
    border: "1px solid #ccc",
    padding: 10,
  };

  const [expanded, setExpand] = useState(false);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
      }}
    >
      <div style={box}>
        elementType - div
        <br />
        truncate - false
        <br />
        parent height - 70px
        <br />
        <strong>Has scrollbar</strong>
      </div>
      <div style={{ ...box, height: 70 }}>
        <Div truncate={false}>
          The European <i>languages</i> are members of the same family. Their
          separate existence is a myth. For science, music, sport, etc,{" "}
          <span style={{ fontWeight: 400, color: "blue" }}>Europe</span>
          uses the same vocabulary. The languages only differ in their grammar,
          their pronunciation and their most common words. Everyone realizes why
          a new common language would be desirable: one could refuse to pay
          expensive translators. The European languages are members of the same
          family. Their separate existence is a myth. For science, music, sport,
          etc, Europe uses the same vocabulary. The languages only differ in
          their grammar, their pronunciation and their most common words.
          Everyone realizes why a new common language would be desirable: one
          could refuse to pay expensive translators.
        </Div>
      </div>
      <div style={box}>
        elementType - div
        <br />
        parent height - 40px
        <br />
        <strong>shows Tooltip</strong>
      </div>
      <div style={{ ...box, height: 40 }}>
        <Div>
          The European languages are members of the same family. Their separate
          existence is a myth. For science, music, sport, etc, Europe uses the
          same vocabulary. The languages only differ in their grammar, their
          pronunciation and their most common words. Everyone realizes why a new
          common language would be desirable: one could refuse to pay expensive
          translators.
        </Div>
      </div>
      <div style={box}>
        elementType - p
        <br />
        maxRows - 2
        <br />
        <strong>expandable</strong>
      </div>
      <div style={{ ...box, display: "flex" }}>
        <P maxRows={2} expanded={expanded} style={{ marginRight: 20 }}>
          Far far away, behind the word mountains, far from the countries
          Vokalia and Consonantia, there live the blind texts. Separated they
          live in Bookmarksgrove right at the coast of the Semantics, a large
          language ocean. A small river named Duden flows by their place and
          supplies it with the necessary regelialia. It is a paradisematic
          country, in which roasted parts of sentences fly into your mouth. Even
          the all-powerful Pointing has no control about the blind texts it is
          an almost unorthographic life One day however a small line of blind
          text by the name of Lorem Ipsum decided to leave for the far World of
          Grammar. The Big Oxmox advised her not to do so, because there were
          thousands of bad Commas, wild Question Marks and devious Semikoli, but
          the Little Blind Text didn't listen. She packed her seven versalia,
          put her initial into the belt and made herself on the way. When she
          reached the first hills of the Italic Mountains, she had a last view
          back on the skyline of her hometown Bookmarksgrove, the headline of
          Alphabet Village and the subline of her own road, the Line Lane.
        </P>
        <Button
          variant="secondary"
          onClick={() => {
            setExpand(!expanded);
          }}
        >
          {expanded ? <DoubleChevronUpIcon /> : <DoubleChevronDownIcon />}
        </Button>
      </div>
      <div style={box}>
        elementType - span
        <br />
        maxRows - 2
        <br />
        <strong>shows Tooltip</strong>
      </div>
      <div style={box}>
        <Span maxRows={2}>
          A wonderful serenity has taken possession of my entire soul, like
          these sweet mornings of spring which I enjoy with my whole heart. I am
          alone, and feel the charm of existence in this spot, which was created
          for the bliss of souls like mine. I am so happy, my dear friend, so
          absorbed in the exquisite sense of mere tranquil existence, that I
          neglect my talents. I should be incapable of drawing a single stroke
          at the present moment; and yet I feel that I never was a greater
          artist than now. When, while the lovely valley teems with vapour
          around me, and the meridian sun strikes the upper surface of the
          impenetrable foliage of my trees, and but a few stray gleams steal
          into the inner sanctuary, I throw myself down among the tall grass by
          the trickling stream; and, as I lie close to the earth, a thousand
          unknown plants are noticed by me: when I hear the buzz of the little
          world among the stalks, and grow familiar with the countless
          indescribable forms of the insects and flies, then I feel the presence
          of the Almighty, who formed us in his own image, and the breath
        </Span>
      </div>
    </div>
  );
};
export const ResponsiveExample = ResponsiveTextComponent.bind({});
ResponsiveExample.parameters = {
  docs: { source: { type: "dynamic" } },
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
    ],
  },
};
