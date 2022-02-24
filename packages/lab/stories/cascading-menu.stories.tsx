import { ComponentMeta, ComponentStory } from "@storybook/react";
import { useMemo, useState, MouseEvent } from "react";
import { Button } from "@brandname/core";
import { UserIcon, CallIcon } from "@brandname/icons";
import { CascadingMenu, MenuDescriptor } from "@brandname/lab";

import "./cascading-menu.stories.css";

const initialSource: MenuDescriptor = {
  menuItems: [
    {
      title: "Level 1 Menu Item 2",
      menuItems: [
        {
          title: "Level 2 Menu Item",
        },
        {
          title: "Level 2 Menu Item",
          menuItems: [
            {
              title: "Level 3 Menu Item",
            },
            {
              title: "Level 3 Menu Item",
            },
          ],
        },
      ],
    },
    {
      title: "Level 1 Menu Item",
    },
    {
      title: "Level 1 Menu Item 2",
      menuItems: [
        {
          title: "Level 2 Menu Item",
        },
        {
          title: "Level 2 Menu Item",
        },
        {
          title: "Level 2 Menu Item",
          menuItems: [
            {
              title: "Level 3 Menu Item",
            },
            {
              title: "Level 3 Menu Item",
            },
          ],
        },
      ],
    },
  ],
};

export default {
  title: "Lab/Cascading Menu",
  component: CascadingMenu,
} as ComponentMeta<typeof CascadingMenu>;

export const DefaultCascadingMenu: ComponentStory<
  typeof CascadingMenu
> = () => {
  return (
    <CascadingMenu
      initialSource={initialSource}
      itemToString={(item) => item?.title}
      onItemClick={(sourceItem) => {
        console.log(`You clicked: ${sourceItem.title}`);
      }}
    >
      <Button data-testid="cascading-menu-trigger">
        Open/Close Cascading Menu
      </Button>
    </CascadingMenu>
  );
};

export const MaximumWidthCascadingMenu: ComponentStory<
  typeof CascadingMenu
> = () => {
  const initialSource = useMemo(
    () => ({
      menuItems: [
        {
          title: "Extra extra long Level 1 Menu Item",
        },
        {
          title: "Extra long Level 1 Menu Item 2",
          menuItems: [
            {
              title: "Level 2 Menu Item",
            },
            {
              title: "Extra extra long Level 2 Menu Item",
              menuItems: [
                {
                  title: "Level 3 Menu Item",
                },
                {
                  title: "Level 3 Menu Item",
                },
              ],
            },
          ],
        },
        {
          title: "Extra long Level 1 Menu Item 2",
          menuItems: [
            {
              title: "Extra long Level 2 Menu Item",
            },
            {
              title: "Extra extra long Level 2 Menu Item",
            },
            {
              title: "Extra extra long Level 2 Menu Item",
              menuItems: [
                {
                  title: "Level 3 Menu Item",
                },
                {
                  title: "Level 3 Menu Item",
                },
              ],
            },
          ],
        },
      ],
    }),
    []
  );

  return (
    <CascadingMenu
      initialSource={initialSource}
      itemToString={(item) => item?.title}
      maxWidth={255}
      onItemClick={(sourceItem) => {
        console.log(`You clicked: ${sourceItem.title}`);
      }}
    >
      <Button data-testid="cascading-menu-trigger">
        Open/Close Cascading Menu
      </Button>
    </CascadingMenu>
  );
};

export const CascadingMenuWithSeparators: ComponentStory<
  typeof CascadingMenu
> = () => {
  const initialSource = useMemo(
    () => ({
      menuItems: [
        {
          title: "Level 1 Menu Item",
        },
        {
          title: "Level 1 Menu Item 2",
          menuItems: [
            {
              title: "Level 2 Menu Item",
            },
            {
              title: "Level 2 Menu Item 2",
              divider: true,
            },
            {
              title: "Level 2 Menu Item 3",
            },
          ],
        },
        {
          title: "Level 1 Menu Item 3",
          divider: true,
        },
        {
          title: "Level 1 Menu Item 4",
        },
        {
          title: "Level 1 Menu Item 5",
          divider: true,
        },
        {
          title: "Level 1 Menu Item 6",
        },
        {
          title: "Level 1 Menu Item 7",
        },
      ],
    }),
    []
  );

  return (
    <CascadingMenu
      initialSource={initialSource}
      itemToString={(item) => item?.title}
      onItemClick={(sourceItem) => {
        console.log(`You clicked: ${sourceItem.title}`);
      }}
    >
      <Button data-testid="cascading-menu-trigger">
        Open/Close Cascading Menu
      </Button>
    </CascadingMenu>
  );
};

// See cascading-menu.stories.css for style overrides
export const CascadingMenuCustomStyling: ComponentStory<
  typeof CascadingMenu
> = () => {
  const initialSource = {
    menuItems: [
      {
        title: "Level 1 Menu Item",
      },
      {
        title: "Level 1 Menu Item 2",
        menuItems: [
          {
            title: "Level 2 Menu Item",
          },
          {
            title: "Level 2 Menu Item",
            menuItems: [
              {
                title: "Level 3 Menu Item",
              },
              {
                title: "Level 3 Menu Item",
              },
            ],
          },
        ],
      },
      {
        title: "Level 1 Menu Item 2",
        menuItems: [
          {
            title: "Level 2 Menu Item",
          },
          {
            title: "Level 2 Menu Item",
          },
          {
            title: "Level 2 Menu Item",
            menuItems: [
              {
                title: "Level 3 Menu Item",
              },
              {
                title: "Level 3 Menu Item",
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <CascadingMenu
      className="custom-styles"
      initialSource={initialSource}
      itemToString={(item) => item?.title}
      onItemClick={(sourceItem) => {
        console.log(`You clicked: ${sourceItem.title}`);
      }}
    >
      <Button data-testid="cascading-menu-trigger">
        Open/Close Cascading Menu
      </Button>
    </CascadingMenu>
  );
};

export const CascadingMenuWithDisabledItems: ComponentStory<
  typeof CascadingMenu
> = () => {
  const initialSource = useMemo(
    () => ({
      menuItems: [
        {
          title: "Level 1 Menu Item",
          disabled: true,
        },
        {
          title: "Level 1 Menu Item 2",
          menuItems: [
            {
              title: "Level 2 Menu Item",
              disabled: true,
            },
            {
              title: "Level 2 Menu Item",
              menuItems: [
                {
                  title: "Level 3 Menu Item 1",
                },
                {
                  title: "Level 3 Menu Item 2",
                  disabled: true,
                },
              ],
            },
          ],
        },
        {
          title: "Level 1 Menu Item 3",
          disabled: true,
          menuItems: [
            {
              title: "Level 3 Menu Item",
            },
          ],
        },
      ],
    }),
    []
  );

  return (
    <CascadingMenu
      initialSource={initialSource}
      itemToString={(item) => item?.title}
      onItemClick={(sourceItem) => {
        console.log(`You clicked: ${sourceItem.title}`);
      }}
    >
      <Button data-testid="cascading-menu-trigger">
        Open/Close Cascading Menu
      </Button>
    </CascadingMenu>
  );
};

const user: MenuDescriptor["icon"] = UserIcon;
const phone: MenuDescriptor["icon"] = CallIcon;

export const CascadingMenuWithIcons: ComponentStory<
  typeof CascadingMenu
> = () => {
  const initialSource = useMemo(
    () => ({
      menuItems: [
        {
          title: "Level 1 Menu Item 2",
          icon: phone,
          menuItems: [
            {
              title: "Level 2 Menu Item",
              icon: user,
            },
            {
              title: "Level 2 Menu Item",
              menuItems: [
                {
                  title: "Level 3 Menu Item",
                },
                {
                  title: "Level 3 Menu Item",
                },
              ],
            },
          ],
        },
        {
          title: "Level 1 Menu Item",
          icon: phone,
        },
        {
          title: "Level 1 Menu Item 2",
          menuItems: [
            {
              title: "Level 2 Menu Item",
              icon: user,
            },
            {
              title: "Level 2 Menu Item",
            },
            {
              title: "Level 2 Menu Item",
              menuItems: [
                {
                  title: "Level 3 Menu Item",
                },
                {
                  title: "Level 3 Menu Item",
                },
              ],
            },
          ],
        },
      ],
    }),
    []
  );

  return (
    <CascadingMenu
      initialSource={initialSource}
      itemToString={(item) => item?.title}
      onItemClick={(sourceItem) => {
        console.log(`You clicked: ${sourceItem.title}`);
      }}
    >
      <Button data-testid="cascading-menu-trigger">
        Open/Close Cascading Menu
      </Button>
    </CascadingMenu>
  );
};

export const CascadingMenuControlledOpenClose: ComponentStory<
  typeof CascadingMenu
> = () => {
  const initialSource = useMemo(
    () => ({
      menuItems: [
        {
          title: "Level 1 Menu Item",
        },
        {
          title: "Level 1 Menu Item 2",
          menuItems: [
            {
              title: "Level 2 Menu Item",
            },
            {
              title: "Level 2 Menu Item",
              menuItems: [
                {
                  title: "Level 3 Menu Item",
                },
                {
                  title: "Level 3 Menu Item",
                },
              ],
            },
          ],
        },
        {
          title: "Level 1 Menu Item 2",
          menuItems: [
            {
              title: "Level 2 Menu Item",
            },
            {
              title: "Level 2 Menu Item",
            },
            {
              title: "Level 2 Menu Item",
              menuItems: [
                {
                  title: "Level 3 Menu Item",
                },
                {
                  title: "Level 3 Menu Item",
                },
              ],
            },
          ],
        },
      ],
    }),
    []
  );

  const [open, setOpen] = useState(false);
  return (
    <CascadingMenu
      initialSource={initialSource}
      itemToString={(item) => item?.title}
      onClose={() => {
        setOpen(false);
      }}
      onItemClick={(sourceItem) => {
        console.log(`You clicked: ${sourceItem.title}`);
      }}
      open={open}
    >
      <Button
        data-testid="cascading-menu-trigger"
        onClick={() => setOpen((o) => !o)}
      >
        Open/Close Cascading Menu
      </Button>
    </CascadingMenu>
  );
};

export const CascadingMenuControlledSource: ComponentStory<
  typeof CascadingMenu
> = () => {
  const sourceA: MenuDescriptor = {
    menuItems: [
      {
        title: "Source A Level 1 Menu Item",
      },
      {
        title: "Source A Level 1 Menu Item 2",
        menuItems: [
          {
            title: "Source A Level 2 Menu Item",
          },
          {
            title: "Source A Level 2 Menu Item",
            menuItems: [
              {
                title: "Source A Level 3 Menu Item",
              },
              {
                title: "Source A Level 3 Menu Item",
              },
            ],
          },
        ],
      },
      {
        title: "Source A Level 1 Menu Item 2",
        menuItems: [
          {
            title: "Source A Level 2 Menu Item",
          },
          {
            title: "Source A Level 2 Menu Item",
          },
          {
            title: "Source A Level 2 Menu Item",
            menuItems: [
              {
                title: "Source A Level 3 Menu Item",
              },
              {
                title: "Source A Level 3 Menu Item",
              },
            ],
          },
        ],
      },
    ],
  };

  const sourceB: MenuDescriptor = {
    menuItems: [
      {
        title: "Source B Level 1 Menu Item",
        menuItems: [
          {
            title: "Source B Level 2 Menu Item",
          },
          {
            title: "Source B Level 2 Menu Item",
            menuItems: [
              {
                title: "Source B Level 3 Menu Item",
              },
              {
                title: "Source B Level 3 Menu Item",
              },
            ],
          },
        ],
      },
      {
        title: "Source B Level 1 Menu Item 2",
      },
      {
        title: "Source B Level 1 Menu Item 2",
        menuItems: [
          {
            title: "Source B Level 2 Menu Item",
          },
          {
            title: "Source B Level 2 Menu Item",
            menuItems: [
              {
                title: "Source B Level 3 Menu Item",
              },
              {
                title: "Source B Level 3 Menu Item",
              },
            ],
          },
          {
            title: "Source B Level 2 Menu Item",
          },
        ],
      },
    ],
  };

  const [menuTriggerRef, setMenuTriggerRef] = useState<HTMLElement>();
  const [source, setSource] = useState<MenuDescriptor>(sourceA);

  const handleButtonClick =
    (newSource: MenuDescriptor) => (event: MouseEvent<HTMLButtonElement>) => {
      setMenuTriggerRef(event.currentTarget);
      setSource(newSource);
    };

  return (
    <CascadingMenu
      itemToString={(item) => item?.title}
      menuTriggerRef={menuTriggerRef}
      onItemClick={(sourceItem) => {
        console.log(`You clicked: ${sourceItem.title}`);
      }}
      source={source}
    >
      <div>
        <Button
          data-testid="cascading-menu-trigger"
          onClick={handleButtonClick(sourceA)}
          style={{ marginRight: "1rem" }}
        >
          Open/Close Cascading Menu A
        </Button>
        <Button
          data-testid="cascading-menu-trigger"
          onClick={handleButtonClick(sourceB)}
        >
          Open/Close Cascading Menu B
        </Button>
      </div>
    </CascadingMenu>
  );
};
