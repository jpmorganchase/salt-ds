import { Button } from "@brandname/core";
import {
  CallIcon,
  ChatIcon,
  CopyIcon,
  ExportIcon,
  MessageIcon,
} from "@brandname/icons";
import {
  Card,
  ComboBox,
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
  FormField,
  Overlay,
  Tooltip,
} from "@brandname/lab";
import { ValueComponentProps } from "@brandname/lab/src/contact-details/internal";
import {
  IndexedListItemProps,
  useListItem,
} from "@brandname/lab/src/list/useListItem";
import { ListItemBase } from "@brandname/lab/src/list";
import { ListChangeHandler } from "@brandname/lab/src/list/ListProps";
import { Story } from "@storybook/react";

import "./contact-details.stories.css";
import { FC, forwardRef, Fragment, useRef, useState } from "react";

export default {
  title: "Lab/ContactDetails",
  component: ContactDetails,
};

const personaA = {
  name: "Persona A",
  company: "Persona A Limited",
  spn: "SPN 1234567",
  role: "Role A",
  location: "Location A",
  officePhone: "+00 1234 567890",
  bloomberg: "personaa@bloomberg.net",
  email: "personaa@example.com",
};

const personaB = {
  name: "Persona B",
  company: "Persona B Research",
  role: "Role B",
  email: "personab@example.com",
  officePhone: "+00 1234 567890",
};

const personaC = {
  name: "Persona C",
  login: "personac",
  role: "Role C",
  location: "Location C",
  email: "personac@example.com",
  officePhone: "01234567890",
  ref: "0000000",
  lastLogin: "10/07/2020 04:26 PM",
};

const personaD = {
  name: "Persona D",
  role: "Role D",
  code: "E123456",
  email: "personad@example.com",
  teams: ["Team A", "Team B"],
};

const personaE = { name: "Persona E", email: "personae@example.com" };
const personaF = { name: "Persona F", email: "personaf@example.com" };
const personaG = { name: "Persona G", email: "personag@example.com" };
const personaH = { name: "Persona H", email: "personah@example.com" };
const personaI = { name: "Persona I", email: "personai@example.com" };
const personaJ = { name: "Persona J", email: "personaj@example.com" };
const personaK = { name: "Persona K", email: "personak@example.com" };
const personaL = { name: "Persona L", email: "personal@example.com" };

// Obscure Details
const MultiLineAddressRenderer = forwardRef<HTMLElement, ValueComponentProps>(
  function MultiLineAddressRenderer(props, ref) {
    // `restProps` is critical as `Tooltip` relies on passing down event handlers to work
    const { value = "", ...restProps } = props;
    return (
      <span {...restProps} ref={ref}>
        {value.split("\n").map((v, i) => (
          <Fragment key={`address-line-${i}`}>
            {v}
            <br />
          </Fragment>
        ))}
      </span>
    );
  }
);

const ObscureEmailRenderer = forwardRef<HTMLElement, ValueComponentProps>(
  function ObscureEmailRenderer(props, ref) {
    // `restProps` is critical as `Tooltip` relies on passing down event handlers to work
    const { value = "", ...restProps } = props;
    const indexOfAt = value.indexOf("@");
    return (
      <span {...restProps} ref={ref}>
        {`${value.slice(0, 3)}${"x".repeat(indexOfAt - 3)}${value.slice(
          indexOfAt
        )}`}
      </span>
    );
  }
);

const ObscurePhoneNumberRenderer = forwardRef<HTMLElement, ValueComponentProps>(
  function ObscurePhoneNumberRenderer(props, ref) {
    // `restProps` is critical as `Tooltip` relies on passing down event handlers to work
    const { value = "", ...restProps } = props;
    const lengthToObscure = value.length - 4;
    return (
      <span {...restProps} ref={ref}>
        {`${"x".repeat(lengthToObscure)}${value.slice(lengthToObscure)}`}
      </span>
    );
  }
);

const contactToString = (nameEmail: NameEmail) =>
  nameEmail ? nameEmail.name : "";

const DefaultTemplate: Story = () => {
  return (
    <div style={{ width: 390 }}>
      <ContactDetails>
        <ContactAvatar />
        <ContactPrimaryInfo text={personaA.name} />
        <ContactSecondaryInfo text={personaA.company} />
        <ContactTertiaryInfo text={personaA.spn} />
        <ContactMetadata>
          <ContactMetadataItem value={personaA.role} label="Role" />
          <ContactMetadataItem value={personaA.location} label="Location" />
          <ContactMetadataItem value={personaA.officePhone} label="Office" />
          <ContactMetadataItem value={personaA.bloomberg} label="Bloomberg" />
          <ContactMetadataItem value={personaA.email} label="Email" />
        </ContactMetadata>
      </ContactDetails>
    </div>
  );
};

const CompactContactDetailsTemplate: Story = () => {
  return (
    <div style={{ width: 400 }}>
      <ContactDetails variant="compact">
        <ContactAvatar />
        <ContactPrimaryInfo text={personaA.name} />
        <ContactSecondaryInfo text={personaA.email} icon={MessageIcon} />
        <ContactTertiaryInfo text={personaA.officePhone} icon={CallIcon} />
      </ContactDetails>
    </div>
  );
};

const MiniContactDetailsTemplate: Story = () => {
  return (
    <div style={{ maxWidth: 400 }}>
      <ContactDetails variant="mini">
        <ContactPrimaryInfo text={personaA.name} />
        <ContactSecondaryInfo text={personaA.email} />
      </ContactDetails>
    </div>
  );
};

const IconDescriptorsTemplate: Story = () => {
  return (
    <div style={{ width: 400 }}>
      <ContactDetails>
        <ContactAvatar />
        <ContactPrimaryInfo text={personaB.name} />
        <ContactSecondaryInfo text={personaB.company} />
        <ContactTertiaryInfo text={personaB.role} />
        <ContactMetadata>
          <ContactMetadataItem
            value={personaB.email}
            label="Email"
            icon={MessageIcon}
          />
          <ContactMetadataItem
            value={personaB.officePhone}
            label="Office"
            icon={CallIcon}
          />
        </ContactMetadata>
      </ContactDetails>
    </div>
  );
};

const WithoutAvatarTemplate: Story = () => {
  return (
    <div className={"withoutAvatar"}>
      <div className={"withoutAvatar-container"}>
        <div className={"withoutAvatar-firstColumn"}>
          <header className={"withoutAvatar-heading"}>Default</header>
          <ContactDetails>
            <ContactPrimaryInfo text={personaA.name} />
            <ContactSecondaryInfo text={personaA.company} />
            <ContactTertiaryInfo text={personaA.spn} />
            <ContactMetadata>
              <ContactMetadataItem value={personaA.role} label="Role" />
              <ContactMetadataItem value={personaA.location} label="Location" />
              <ContactMetadataItem
                value={personaA.officePhone}
                label="Office"
              />
              <ContactMetadataItem
                value={personaA.bloomberg}
                label="Bloomberg"
              />
              <ContactMetadataItem value={personaA.email} label="Email" />
            </ContactMetadata>
          </ContactDetails>
        </div>
        <div className={"withoutAvatar-secondColumn"}>
          <header className={"withoutAvatar-heading"}>Compact</header>
          <ContactDetails variant={"compact"}>
            <ContactPrimaryInfo text={personaA.name} />
            <ContactSecondaryInfo text={personaA.email} icon={MessageIcon} />
            <ContactTertiaryInfo text={personaA.officePhone} icon={CallIcon} />
          </ContactDetails>
        </div>
      </div>
    </div>
  );
};

const ObscuredDetailsTemplate: Story = () => {
  return (
    <div style={{ width: 400 }}>
      <ContactDetails>
        <ContactAvatar />
        <ContactPrimaryInfo text={personaC.name} />
        <ContactSecondaryInfo text={personaC.login} />
        <ContactTertiaryInfo text={personaC.role} />
        <ContactMetadata>
          <ContactMetadataItem
            value={personaC.location}
            label="Location"
            ValueComponent={MultiLineAddressRenderer}
          />
          <ContactMetadataItem
            value={personaC.email}
            label="Email"
            ValueComponent={ObscureEmailRenderer}
          />
          <ContactMetadataItem
            value={personaC.officePhone}
            label="Office"
            ValueComponent={ObscurePhoneNumberRenderer}
          />
          <ContactMetadataItem value={personaC.ref} label="Ref" />
          <ContactMetadataItem value={personaC.lastLogin} label="Last login" />
        </ContactMetadata>
      </ContactDetails>
    </div>
  );
};

const FavoriteToggleTemplate: Story = () => {
  return (
    <div className={"favoriteToggle"}>
      <div className={"favoriteToggle-container"}>
        <div className={"favoriteToggle-firstColumn"}>
          <ContactDetails>
            <ContactFavoriteToggle
              defaultIsFavorite={true}
              onChange={console.log}
            />
            <ContactAvatar />
            <ContactPrimaryInfo text={personaA.name} />
            <ContactSecondaryInfo text={personaA.company} />
            <ContactTertiaryInfo text={personaA.spn} />
            <ContactMetadata>
              <ContactMetadataItem value={personaA.role} label="Role" />
              <ContactMetadataItem value={personaA.location} label="Location" />
              <ContactMetadataItem
                value={personaA.officePhone}
                label="Office"
              />
              <ContactMetadataItem
                value={personaA.bloomberg}
                label="Bloomberg"
              />
              <ContactMetadataItem value={personaA.email} label="Email" />
            </ContactMetadata>
          </ContactDetails>
        </div>
        <div className={"favoriteToggle-secondColumn"}>
          <ContactDetails variant={"compact"}>
            <ContactFavoriteToggle
              defaultIsFavorite={true}
              onChange={console.log}
            />
            <ContactPrimaryInfo text={personaA.name} />
            <ContactSecondaryInfo text={personaA.email} icon={MessageIcon} />
            <ContactTertiaryInfo text={personaA.officePhone} icon={CallIcon} />
          </ContactDetails>
        </div>
      </div>
    </div>
  );
};

const FastActionsTemplate: Story = () => {
  const renderAllButActions = () => {
    return [
      <ContactPrimaryInfo text={personaD.name} />,
      <ContactAvatar />,
      <ContactSecondaryInfo text={personaD.role} />,
      <ContactTertiaryInfo text={personaD.code} />,
      <ContactMetadata>
        <ContactMetadataItem value={personaD.email} label="Email" />
        <ContactMetadataItem value={personaD.teams[0]} label="Primary" />
        <ContactMetadataItem value={personaD.teams[1]} label="Secondary" />
      </ContactMetadata>,
    ];
  };
  return (
    <div className="fastActions">
      <div className="fastActions-container">
        <div>
          <ContactDetails>
            {renderAllButActions()}
            <ContactActions>
              <ContactAction
                icon={CallIcon}
                accessibleText="Call personaD"
                onClick={() => console.log("Action: Call personaD")}
              />
              <ContactAction
                icon={MessageIcon}
                accessibleText="Email personaD"
                onClick={() => console.log("Action: Email personaD")}
              />
              <ContactAction
                icon={ChatIcon}
                accessibleText="Chat with personaD"
                onClick={() => console.log("Action: Chat with personaD")}
              />
            </ContactActions>
          </ContactDetails>
        </div>
        <div>
          <ContactDetails variant="compact">
            {renderAllButActions()}
            <ContactActions>
              <ContactAction
                label="To"
                accessibleText="Email to personaD"
                onClick={() => console.log("Action: To")}
              />
              <ContactAction
                label="CC"
                accessibleText="CC personaD"
                onClick={() => console.log("Action: CC")}
              />
              <ContactAction
                label="BCC"
                accessibleText="BCC personaD"
                onClick={() => console.log("Action: BCC")}
              />
            </ContactActions>
          </ContactDetails>
        </div>
      </div>
    </div>
  );
};

const CollapsibleDetailsTemplate: Story = () => (
  <div className="collapsibleDetails">
    <ContactDetails>
      <ContactFavoriteToggle />
      <ContactAvatar />
      <ContactPrimaryInfo text={personaA.name} />
      <ContactSecondaryInfo text={personaA.company} />
      <ContactTertiaryInfo text={personaA.spn} />
      <ContactActions>
        <ContactAction
          icon={CallIcon}
          accessibleText="Call personaA"
          onClick={() => console.log("Action: Call personaA")}
        />
        <ContactAction
          icon={MessageIcon}
          accessibleText="Message personaA"
          onClick={() => console.log("Action: Message personaA")}
        />
        <ContactAction
          icon={ChatIcon}
          accessibleText="Chat with personaA"
          onClick={() => console.log("Action: Chat with personaA")}
        />
      </ContactActions>
      <ContactMetadata collapsible={true}>
        <ContactMetadataItem value={personaA.role} label="Role" />
        <ContactMetadataItem value={personaA.location} label="Location" />
        <ContactMetadataItem value={personaA.officePhone} label="Office" />
        <ContactMetadataItem value={personaA.bloomberg} label="Bloomberg" />
        <ContactMetadataItem value={personaA.email} label="Email" />
      </ContactMetadata>
    </ContactDetails>
  </div>
);

const WithinCardTemplate: Story = () => {
  return (
    <Card className="withinCard">
      <ContactDetails embedded={true}>
        <ContactAvatar />
        <ContactPrimaryInfo text={personaA.name} />
        <ContactSecondaryInfo text={personaA.company} />
        <ContactTertiaryInfo text={personaA.spn} />
        <ContactMetadata collapsible={true}>
          <ContactMetadataItem value={personaA.role} label="Role" />
          <ContactMetadataItem value={personaA.location} label="Location" />
          <ContactMetadataItem value={personaA.officePhone} label="Office" />
          <ContactMetadataItem value={personaA.bloomberg} label="Bloomberg" />
          <ContactMetadataItem value={personaA.email} label="Email" />
        </ContactMetadata>
      </ContactDetails>
    </Card>
  );
};

// TODO use real tile
const Tile: FC<{ className?: string }> = (props) => (
  <div className={props.className}>{props.children}</div>
);

const WithinTileTemplate: Story = () => {
  return (
    <>
      {[personaA, personaE, personaF, personaD].map((contact, index) => (
        <Tile key={index} className="withinTile-tile">
          <ContactDetails embedded={true} variant={"compact"}>
            <ContactPrimaryInfo text={contact.name} />
            <ContactSecondaryInfo text={contact.email} />
            <ContactActions>
              <ContactAction
                label="To"
                onClick={() => console.log("Action: To")}
              />
              <ContactAction
                label="CC"
                onClick={() => console.log("Action: CC")}
              />
              <ContactAction
                label="BCC"
                onClick={() => console.log("Action: BCC")}
              />
            </ContactActions>
          </ContactDetails>
        </Tile>
      ))}
    </>
  );
};

const WithinOverlayTemplate: Story = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const handleClickButton = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <div>
      <Button
        aria-label="This triggers a popover with contact details"
        ref={buttonRef}
        onClick={handleClickButton}
      >
        View Contact Details
      </Button>

      <Overlay
        anchorEl={buttonRef.current}
        onClose={handleClose}
        open={open}
        placement="bottom"
      >
        <ContactDetails className={"withinOverlay"} embedded={true}>
          <ContactFavoriteToggle />
          <ContactAvatar />
          <ContactPrimaryInfo text={personaA.name} />
          <ContactSecondaryInfo text={personaA.company} />
          <ContactTertiaryInfo text={personaA.spn} />
          <ContactActions>
            <ContactAction
              icon={CallIcon}
              accessibleText="Call personaA"
              onClick={() => console.log("Action: Call personaA")}
            />
            <ContactAction
              icon={MessageIcon}
              accessibleText="Message personaA"
              onClick={() => console.log("Action: Message personaA")}
            />
            <ContactAction
              icon={ChatIcon}
              accessibleText="Chat with personaA"
              onClick={() => console.log("Action: Chat with personaA")}
            />
          </ContactActions>
          <ContactMetadata>
            <ContactMetadataItem value={personaA.role} label="Role" />
            <ContactMetadataItem value={personaA.location} label="Location" />
            <ContactMetadataItem value={personaA.officePhone} label="Office" />
            <ContactMetadataItem value={personaA.bloomberg} label="Bloomberg" />
            <ContactMetadataItem value={personaA.email} label="Email" />
          </ContactMetadata>
        </ContactDetails>
      </Overlay>
    </div>
  );
};

interface NameEmail {
  name: string;
  email: string;
}

const ItemWithContactDetailsTooltip: FC<IndexedListItemProps<NameEmail>> = (
  props
) => {
  const containerRef = useRef(null);

  const { item, itemProps } = useListItem<NameEmail>(props);
  const itemLabel = contactToString(item);

  return (
    <Tooltip
      enterDelay={500}
      id="tooltip-right"
      className={"withinComboboxTooltip"}
      render={() => (
        <ContactDetails
          className={"withinComboBoxTooltip-contactDetails"}
          embedded={true}
          stackAtBreakpoint={250}
        >
          <ContactPrimaryInfo text={item.name} />
          <ContactSecondaryInfo text={item.email} />
          <ContactMetadata>
            <ContactMetadataItem value={"Position"} label="Role" />
            <ContactMetadataItem value={"City, Country"} label="Location" />
            <ContactMetadataItem value={"+44 2012 123456"} label="Office" />
            <ContactMetadataItem
              value={"NAME@bloomberg.net"}
              label="Bloomberg"
            />
            <ContactMetadataItem
              value={"first.last@domain.com"}
              label="Email"
            />
          </ContactMetadata>
        </ContactDetails>
      )}
    >
      <ListItemBase {...itemProps} ref={containerRef}>
        <label>{itemLabel}</label>
      </ListItemBase>
    </Tooltip>
  );
};

const tooltipContacts = [
  personaA,
  personaE,
  personaF,
  personaG,
  personaH,
  personaI,
  personaD,
  personaJ,
  personaK,
  personaL,
];

const WithinComboBoxTooltip: Story = () => {
  const handleChange: ListChangeHandler<NameEmail> = (_, selectedItem) => {
    console.log("selection changed", selectedItem);
  };

  return (
    <FormField label="Select a person" style={{ maxWidth: 292 }}>
      <ComboBox
        ListItem={ItemWithContactDetailsTooltip}
        itemToString={contactToString as (x: any) => string}
        onChange={handleChange}
        source={tooltipContacts}
        width={200}
      />
    </FormField>
  );
};

const ExportToFileTemplate: Story = () => {
  const generateVCardData = () =>
    [
      "BEGIN:VCARD",
      `N:${personaA.name}`,
      `TEL;TYPE=WORK,VOICE:${personaA.officePhone}`,
      `EMAIL:${personaA.email}`,
      `END:VCARD`,
    ].join("\n");

  const generateCopyText = () =>
    [
      `${personaA.name}`,
      `TEL:${personaA.officePhone}`,
      `EMAIL:${personaA.email}`,
    ].join("\n");

  const exportVCard = () => {
    const element = document.createElement("a");
    const file = new Blob([generateVCardData()], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "vcardExport.vcf";
    // Required for this to work in FireFox
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = () => {
    // Check browser support caniuse.com/#search=clipboard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).clipboard.writeText(generateCopyText()).then(
      () => {
        console.log("Wrote contact detail to clipboard");
      },
      () => {
        console.log("Clipboard write failed");
      }
    );
  };

  return (
    <div style={{ width: 390 }}>
      <ContactDetails variant="compact">
        <ContactAvatar />
        <ContactPrimaryInfo text={personaA.name} />
        <ContactSecondaryInfo text={personaA.email} />
        <ContactTertiaryInfo text={personaA.officePhone} />
        <ContactActions>
          <ContactAction
            icon={ExportIcon}
            accessibleText="Export VCard"
            onClick={exportVCard}
          />
          <ContactAction
            icon={CopyIcon}
            accessibleText="Copy to clipboard"
            onClick={copyToClipboard}
          />
        </ContactActions>
      </ContactDetails>
    </div>
  );
};

export const Default = DefaultTemplate.bind({});
export const Compact = CompactContactDetailsTemplate.bind({});
export const Mini = MiniContactDetailsTemplate.bind({});
export const IconDescriptors = IconDescriptorsTemplate.bind({});
export const WithoutAvatar = WithoutAvatarTemplate.bind({});
export const ObscuredDetails = ObscuredDetailsTemplate.bind({});
export const FavoriteToggle = FavoriteToggleTemplate.bind({});
export const FastActions = FastActionsTemplate.bind({});
export const CollapsibleDetails = CollapsibleDetailsTemplate.bind({});
export const WithinCard = WithinCardTemplate.bind({});
export const WithinTile = WithinTileTemplate.bind({});
export const WithinOverlay = WithinOverlayTemplate.bind({});
export const WithinComboboxTooltip = WithinComboBoxTooltip.bind({});
export const ExportToFile = ExportToFileTemplate.bind({});
