import { PillNext } from "@salt-ds/lab";
import { FavoriteIcon } from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";
import { largestCities } from "./../assets/exampleData";
import { Button, GridLayout } from "@salt-ds/core";

export default {
  title: "Lab/Pill Next",
  component: PillNext,
} as Meta<typeof PillNext>;

export const Default: StoryFn<typeof PillNext> = () => {
  const handleClick = () => {
    console.log("clicked");
  };
  return <PillNext onClick={handleClick}>Clickable Pill</PillNext>;
};

export const Disabled: StoryFn<typeof PillNext> = () => {
  return (
    <PillNext disabled onClick={() => console.log("Click")}>
      Disabled Pill
    </PillNext>
  );
};

export const Closable: StoryFn<typeof PillNext> = () => {
  const [cities, setCities] = useState(largestCities);

  const removeCity = (name: string) => {
    const filteredCities = cities.filter((city) => city.name !== name);
    console.log(`Closed ${name}`);
    setCities(filteredCities);
  };
  return (
    <>
      <GridLayout gap={1} columns={3}>
        <div style={{ gridColumn: "1 / span 3" }}>
          <Button onClick={() => setCities(largestCities)}>reset</Button>
        </div>
        {cities.map((city, index) => (
          <PillNext
            key={city.name}
            disabled={index < 3}
            onClick={() => console.log("Click")}
            onClose={() => removeCity(city.name)}
          >
            {city.name}
          </PillNext>
        ))}
      </GridLayout>
    </>
  );
};

export const Icon: StoryFn<typeof PillNext> = () => {
  return (
    <PillNext icon={<FavoriteIcon />} onClick={() => console.log("Clicked.")}>
      Pill with Icon
    </PillNext>
  );
};
