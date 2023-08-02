import { useState } from "react";
import { Button, FlexLayout } from "@salt-ds/core";
import {
  DialogNext,
  DialogNextTitle,
  DialogNextActions,
  DialogNextContent,
  NavItem,
} from "@salt-ds/lab";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import "./dialog-next.stories.css";

export default {
  title: "Lab/Dialog Next",
  component: DialogNext,
  args: {
    title: "Congratulations! You have created a Dialog.",
    content: "This is the content of the dialog.",
  },
} as ComponentMeta<typeof DialogNext>;

const DialogTemplate: ComponentStory<typeof DialogNext> = ({
  title,
  // @ts-ignore
  content,
  open: openProp = true,
  ...args
}) => {
  const [open, setOpen] = useState(openProp);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Click to open dialog
      </Button>
      <DialogNext {...args} open={open} onOpenChange={onOpenChange}>
        <DialogNextTitle>{title}</DialogNextTitle>
        <DialogNextContent>{content}</DialogNextContent>
        <DialogNextActions>
          <Button variant="cta" onClick={handleClose}>
            CTA BUTTON
          </Button>
          <Button style={{ cursor: "pointer" }} onClick={handleClose}>
            REGULAR BUTTON
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            SECONDARY BUTTON
          </Button>
        </DialogNextActions>
      </DialogNext>
    </>
  );
};

export const Default = DialogTemplate.bind({});

export const LongContent = DialogTemplate.bind({});

LongContent.args = {
  title: "Congratulations! You have created a Dialog.",
  // @ts-ignore
  content: `
    jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj jkahsd jhas kdhaskj dajks dkjashdhas djhas dkjhaskj hdjk ashjd kjas dkjhas kdhkjas hdjkas hdaksjdjkasjkdhsjhds shjdhsjhd shhs djs hsjd sjh s jhdj
    `,
};

export const InfoStatus = DialogTemplate.bind({});
InfoStatus.args = {
  status: "info",
};

export const SuccessStatus = DialogTemplate.bind({});
SuccessStatus.args = {
  status: "success",
};

export const WarningStatus = DialogTemplate.bind({});
WarningStatus.args = {
  status: "warning",
};

export const ErrorStatus = DialogTemplate.bind({});
ErrorStatus.args = {
  status: "error",
};

const itemsWithSubNav = [
  {
    name: "Nav Item 1",
  },
  {
    name: "Nav Item 2",
    subNav: ["Sub Nav Item 1", "Sub Nav Item 2", "Sub Nav Item 3"],
  },
  {
    name: "Nav Item 3",
    subNav: ["Sub Nav Item 1", "Sub Nav Item 2", "Sub Nav Item 3"],
  },
];

const items = itemsWithSubNav.map((item) => item.name);

export const PreferencesDialog: ComponentStory<typeof DialogNext> = (args) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(items[0]);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Click to open dialog
      </Button>
      <DialogNext {...args} open={open} onOpenChange={onOpenChange}>
        <DialogNextTitle>Preferences</DialogNextTitle>
        <FlexLayout gap={0}>
          <nav>
            <ul className="verticalDialogNav">
              {items.map((item) => (
                <li key={item}>
                  <NavItem
                    active={active === item}
                    href="#"
                    orientation="vertical"
                    onClick={(event) => {
                      // Prevent default to avoid navigation
                      event.preventDefault();
                      setActive(item);
                    }}
                  >
                    {item}
                  </NavItem>
                </li>
              ))}
            </ul>
          </nav>
          <DialogNextContent>Hello</DialogNextContent>
        </FlexLayout>
        <DialogNextActions>
          <Button style={{ cursor: "pointer" }} onClick={handleClose}>
            Save
          </Button>
        </DialogNextActions>
      </DialogNext>
    </>
  );
};
