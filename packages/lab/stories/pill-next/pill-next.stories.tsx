import { PillNext } from "@salt-ds/lab";
import { BuildingsSolidIcon, FavoriteIcon } from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";
import { largestCities } from "./../assets/exampleData";
import { Button, FlowLayout, Switch } from "@salt-ds/core";

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
  const [showMultiple, setShowMultiple] = useState(true);

  const removeCity = (name: string) => {
    const filteredCities = cities.filter((city) => city.name !== name);
    console.log(`Closed ${name}`);
    setCities(filteredCities);
  };
  return (
    <>
      <FlowLayout gap={0.5} style={{ maxWidth: "400px" }}>
        <FlowLayout
          gap={1}
          style={{ flexBasis: "100%", marginBottom: "1.5rem" }}
          align={"center"}
          justify={"space-between"}
        >
          <Button onClick={() => setCities(largestCities)}>reset</Button>
          <Switch
            defaultChecked
            onChange={() => {
              setShowMultiple(!showMultiple);
            }}
            label={"Show multi country location"}
          />
        </FlowLayout>
        {cities.map((city, index) => (
          <PillNext
            key={city.name}
            disabled={index < 3}
            onClick={() => console.log(`Clicked ${city.name}`)}
            onClose={() => removeCity(city.name)}
            icon={
              showMultiple &&
              cities.filter(
                (anotherCity) => anotherCity.countryCode === city.countryCode
              ).length > 1 && <BuildingsSolidIcon />
            }
          >
            {city.name}
          </PillNext>
        ))}
      </FlowLayout>
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
