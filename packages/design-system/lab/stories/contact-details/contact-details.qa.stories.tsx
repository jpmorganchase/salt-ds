import { ComponentMeta, ComponentStory, Story } from "@storybook/react";

import {
  ContactAction,
  ContactActions,
  ContactAvatar,
  ContactDetails,
  ContactFavoriteToggle,
  ContactMetadata,
  ContactMetadataItem,
  ContactPrimaryInfo,
  ContactSecondaryInfo,
  ContactTertiaryInfo,
  MailLinkComponent,
} from "@jpmorganchase/uitk-lab";
import { CallIcon, ChatIcon, MessageIcon } from "@jpmorganchase/uitk-icons";
import { QAContainer, QAContainerProps } from "docs/components";
import avatar1 from "./assets/avatar1.png";

export default {
  title: "Lab/ContactDetails/QA",
  component: ContactDetails,
} as ComponentMeta<typeof ContactDetails>;

const actions = [
  { icon: CallIcon, action: () => console.log("Custom Action: Phone") },
  {
    icon: MessageIcon,
    accessibleText: "email",
    action: () => console.log("Custom Action: Message"),
  },
  { icon: ChatIcon, action: () => console.log("Custom Action: Chat") },
];

const metadata = [
  {
    label: "Role",
    value: "Analyst",
  },
  {
    label: "Location",
    value: "London, GBR",
  },
  {
    label: "Office",
    value: "+44 2077 431102",
  },
  {
    label: "Bloomberg",
    value: "ABRAILESCU@bloomberg.net",
    ValueComponent: MailLinkComponent,
  },
  {
    label: "Email",
    value: "alex.brailescu@blackrock.com",
    ValueComponent: MailLinkComponent,
  },
];

const contactWithActions = {
  avatar: avatar1,
  primary: "Alex Brailescu",
  secondary: "Blackrock Advisors (UK) Limited",
  tertiary: "SPN 2188538",
  actions,
  metadata,
};

const getComponent = (props: { variant?: string; className?: string }) => {
  const { variant = "default", className } = props;
  const { avatar, actions, primary, secondary, tertiary, metadata } =
    contactWithActions;
  return (
    <div style={{ width: 400 }}>
      <ContactDetails
        className={className}
        variant={
          variant === "compact"
            ? "compact"
            : variant === "mini"
            ? "mini"
            : "default"
        }
      >
        {!!avatar && <ContactAvatar src={avatar1} />}

        <ContactFavoriteToggle onChange={console.log} />

        <ContactPrimaryInfo text={primary} />
        <ContactSecondaryInfo text={secondary} />
        <ContactTertiaryInfo text={tertiary} />

        <ContactMetadata>
          {metadata.map((item: any) => {
            return (
              <ContactMetadataItem
                key={Math.random()}
                value={item.value}
                label={item.label}
                icon={item.icon}
              />
            );
          })}
        </ContactMetadata>

        {!!actions && (
          <ContactActions>
            {actions.map((item: any) => {
              return (
                <ContactAction
                  key={Math.random()}
                  icon={item.icon}
                  accessibleText={item.accessibleText}
                  onClick={item.action}
                />
              );
            })}
          </ContactActions>
        )}
      </ContactDetails>
    </div>
  );
};

export const AllExamplesGrid: Story<QAContainerProps> = (props) => {
  const { className, imgSrc } = props;

  return (
    <QAContainer
      cols={4}
      vertical
      transposeDensity
      className="uitkContactDetailsQA"
      imgSrc={imgSrc}
      height={1150}
    >
      {getComponent({ variant: "default", className })}
      {getComponent({ variant: "compact", className })}
      {getComponent({ variant: "mini", className })}
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const BackwardsCompatGrid = AllExamplesGrid.bind({});
BackwardsCompatGrid.args = {
  className: "backwardsCompat",
};

BackwardsCompatGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit = AllExamplesGrid.bind({});
CompareWithOriginalToolkit.args = {
  className: "backwardsCompat",
  imgSrc: "/visual-regression-screenshots/ContactDetails-vr-snapshot.png",
};
