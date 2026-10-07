import {
  Avatar,
  Dropdown,
  type DropdownProps,
  FlexLayout,
  FlowLayout,
  Option,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CallIcon, MessageIcon, UserIcon } from "@salt-ds/icons";
import { useState } from "react";
import { basicContact } from "./ContactDetails";

const persona = "/img/examples/avatar.png";

const persona2 = "/img/examples/avatar2.png";

const persona3 = "/img/examples/avatar3.png";

type Contact = {
  primary: string;
  sid: string;
  avatarImage: string;
  number: string;
  email: string;
};

const contactList: Contact[] = [
  {
    primary: "Jane Doe",
    sid: "O12",
    avatarImage: persona,
    number: "+1 (212) 555-0100",
    email: "jane.doe@example.com",
  },
  {
    primary: "Logan Rider",
    sid: "U34",
    avatarImage: persona2,
    number: "+1 (212) 555-0101",
    email: "logan.rider@company.com",
  },
  {
    primary: "Paul Hill",
    sid: "L56",
    avatarImage: persona3,
    number: "+1 (212) 555-0102",
    email: "paul.hill@company.com",
  },
];

export const List = () => {
  const [selectedContact, setSelectedContact] = useState<Contact[]>([
    contactList[0],
  ]);

  const handleSelectionChange: DropdownProps<Contact>["onSelectionChange"] = (
    _event,
    newSelected,
  ) => {
    setSelectedContact(newSelected);
  };

  return (
    <Dropdown<Contact>
      style={{ width: "266px" }}
      startAdornment={
        selectedContact.length === 1 && (
          <Avatar aria-hidden src={selectedContact[0].avatarImage} size={1} />
        )
      }
      onSelectionChange={handleSelectionChange}
      selected={selectedContact}
      valueToString={(contact) => contact.primary}
    >
      {contactList.map((contact) => (
        <Option
          key={contact.sid}
          value={contact}
          style={{
            padding: "var(--salt-spacing-50) var(--salt-spacing-100)",
          }}
        >
          <StackLayout direction={"row"} align="center" gap={1}>
            <Avatar
              src={contact.avatarImage as string}
              aria-label={basicContact.primary}
              fallbackIcon={<UserIcon />}
              size={1}
            />
            <StackLayout direction={"column"} gap={0.5}>
              <Text>
                <strong> {contact.primary} </strong>
              </Text>
              <FlowLayout gap={3}>
                <FlexLayout gap={1} align="center">
                  <CallIcon />
                  <Text>{contact.number}</Text>
                </FlexLayout>
                <FlexLayout gap={1} align="center">
                  <MessageIcon />
                  <Text>{contact.email}</Text>
                </FlexLayout>
              </FlowLayout>
            </StackLayout>
          </StackLayout>
        </Option>
      ))}
    </Dropdown>
  );
};
