import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import { NavigationItem } from "@salt-ds/lab";
import { NotificationIcon } from "@salt-ds/icons";

export default {
  title: "Lab/Navigation Item/QA",
  component: NavigationItem,
} as Meta<typeof NavigationItem>;

const multipleLevelNesting = [
  {
    active: true,
    name: "Label 1 - level 0",
  },
  {
    name: "Label 2 - level 0",
    expanded: true,
    subNav: [
      {
        name: "Label 1 - level 1",
        expanded: true,
        subNav: [
          {
            name: "Label 1 - level 2",
          },
          {
            name: "Label 2 - level 2",
          },
          {
            name: "Label 3 - level 2",
          },
        ],
      },
    ],
  },
];

export const AllExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer height={1000} width={800} itemPadding={4} itemWidthAuto>
    <nav>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {multipleLevelNesting.map(({ active, expanded, name, subNav }) => (
          <li key={name}>
            <NavigationItem
              href="#"
              orientation="vertical"
              parent={subNav && subNav.length > 0}
              expanded={expanded}
              active={active}
            >
              <NotificationIcon />
              {name}
            </NavigationItem>

            {expanded && (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {subNav?.map((item) => (
                  <li key={item.name}>
                    <NavigationItem
                      href="#"
                      orientation="vertical"
                      level={1}
                      parent={item.subNav && item.subNav.length > 0}
                      expanded={expanded}
                    >
                      {item.name}
                    </NavigationItem>

                    {item.expanded && (
                      <ul style={{ listStyle: "none", padding: 0 }}>
                        {item.subNav.map((nestedItem) => (
                          <li key={nestedItem.name}>
                            <NavigationItem
                              href="#"
                              orientation="vertical"
                              level={2}
                            >
                              {nestedItem.name}
                            </NavigationItem>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
