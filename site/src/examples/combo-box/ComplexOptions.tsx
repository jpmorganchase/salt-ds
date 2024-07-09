import { ComboBox, Option, StackLayout, Text } from "@salt-ds/core";
import { type ChangeEvent, type ReactElement, useState } from "react";

type Contact = {
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  id: string;
};

const contacts: Contact[] = [
  {
    firstName: "Kamron",
    lastName: "Marisa",
    displayName: "Kamron Marisa",
    email: "Kamron_Marisa20@example.net",
    id: "26c1ff5f-78a9-4b2b-bbaf-cb5285ed4d79",
  },
  {
    firstName: "Matilda",
    lastName: "Cathrine",
    displayName: "Matilda Cathrine",
    email: "Matilda_Cathrine32@example.com",
    id: "45b8b157-2ab1-479f-9289-fe4a12e899c7",
  },
  {
    firstName: "Neva",
    lastName: "Reuben",
    displayName: "Neva Reuben",
    email: "Neva.Reuben45@example.net",
    id: "bbe8230e-0559-4fc0-8575-10329b56b3c5",
  },
  {
    firstName: "Laney",
    lastName: "Hilton",
    displayName: "Laney Hilton",
    email: "Laney.Hilton65@example.com",
    id: "f6b9885e-16e8-4fd5-a658-4207e168cdbb",
  },
  {
    firstName: "Madison",
    lastName: "Rosa",
    displayName: "Madison Rosa",
    email: "Madison.Rosa34@example.org",
    id: "405fe991-84e6-4d45-85a6-feb0c010106b",
  },
  {
    firstName: "Consuelo",
    lastName: "Elijah",
    displayName: "Consuelo Elijah",
    email: "Consuelo.Elijah87@example.org",
    id: "688fdb00-9f31-4a33-90cd-e82b71b51f4c",
  },
  {
    firstName: "Taurean",
    lastName: "Blaise",
    displayName: "Taurean Blaise",
    email: "Taurean_Blaise@example.net",
    id: "335662e3-0802-4f39-aaeb-78720aa75ca2",
  },
  {
    firstName: "Therese",
    lastName: "Irma",
    displayName: "Therese Irma",
    email: "Therese.Irma20@example.com",
    id: "c64c65d7-c193-48b1-b586-6ae4586d9d85",
  },
  {
    firstName: "Terry",
    lastName: "Alaina",
    displayName: "Terry Alaina",
    email: "Terry_Alaina@example.com",
    id: "f2f30596-f35e-4ef4-96ce-1d168a9c2db7",
  },
  {
    firstName: "Mike",
    lastName: "Shanny",
    displayName: "Mike Shanny",
    email: "Mike_Shanny5@example.org",
    id: "66162734-165a-4fb6-8701-b59497b799aa",
  },
  {
    firstName: "Adolf",
    lastName: "Gerda",
    displayName: "Adolf Gerda",
    email: "Adolf.Gerda77@example.org",
    id: "93d62117-07a6-4615-95ed-4591af3205eb",
  },
  {
    firstName: "Magali",
    lastName: "Donna",
    displayName: "Magali Donna",
    email: "Magali_Donna@example.net",
    id: "96b5c1a5-443b-44d3-bc39-f8ed746aa7b3",
  },
  {
    firstName: "Rhiannon",
    lastName: "Emerald",
    displayName: "Rhiannon Emerald",
    email: "Rhiannon.Emerald36@example.com",
    id: "53c6ac6a-56f3-4740-874f-57dceba46451",
  },
  {
    firstName: "William",
    lastName: "Rowan",
    displayName: "William Rowan",
    email: "William.Rowan93@example.org",
    id: "27def2df-eb35-4229-8492-e80171abbe3a",
  },
  {
    firstName: "Santiago",
    lastName: "Maida",
    displayName: "Santiago Maida",
    email: "Santiago.Maida@example.net",
    id: "455be580-8f45-4ff3-9437-78dd60c03279",
  },
  {
    firstName: "Marilyne",
    lastName: "Candice",
    displayName: "Marilyne Candice",
    email: "Marilyne.Candice@example.net",
    id: "539c291c-3c4a-4b47-b38d-1e946aa18a4e",
  },
  {
    firstName: "Norbert",
    lastName: "Nikita",
    displayName: "Norbert Nikita",
    email: "Norbert.Nikita@example.org",
    id: "b01bf4fb-33ca-4ebf-befc-1ba27b06833a",
  },
  {
    firstName: "Maximo",
    lastName: "Carmel",
    displayName: "Maximo Carmel",
    email: "Maximo.Carmel@example.org",
    id: "cf2de37d-9e72-4a8e-bfb4-db78e5a0b239",
  },
  {
    firstName: "Edward",
    lastName: "Kyler",
    displayName: "Edward Kyler",
    email: "Edward.Kyler74@example.net",
    id: "50ec7911-f90a-4f3b-b49d-33bbb7a012dd",
  },
  {
    firstName: "Judson",
    lastName: "Carey",
    displayName: "Judson Carey",
    email: "Judson_Carey15@example.com",
    id: "4c6513a6-c08a-40a7-a54c-414b4d29db9f",
  },
];

function ContactOption({ value }: { value: Contact }) {
  return (
    <Option value={value} key={value.id}>
      <StackLayout gap={0.5}>
        <Text>{value.displayName}</Text>
        <Text styleAs="label" color="secondary">
          {value.email}
        </Text>
      </StackLayout>
    </Option>
  );
}

export const ComplexOptions = (): ReactElement => {
  const [filter, setFilter] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilter(value);
  };

  return (
    <ComboBox<Contact>
      style={{ width: "266px" }}
      onChange={handleChange}
      valueToString={(contact) => contact.displayName}
    >
      {contacts
        .filter((contact) =>
          contact.displayName
            .toLowerCase()
            .includes(filter.trim().toLowerCase()),
        )
        .map((contact) => (
          <ContactOption value={contact} key={contact.id} />
        ))}
    </ComboBox>
  );
};
