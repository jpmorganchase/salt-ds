import { Avatar, GridLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

function nameToCategory(name?: string) {
  return name?.replace("Category ", "") ?? "";
}

export const Categories = (): ReactElement => {
  return (
    <GridLayout columns={5}>
      <Avatar name="Category 1" category={1} nameToInitials={nameToCategory} />
      <Avatar name="Category 2" category={2} nameToInitials={nameToCategory} />
      <Avatar name="Category 3" category={3} nameToInitials={nameToCategory} />
      <Avatar name="Category 4" category={4} nameToInitials={nameToCategory} />
      <Avatar name="Category 5" category={5} nameToInitials={nameToCategory} />
      <Avatar name="Category 6" category={6} nameToInitials={nameToCategory} />
      <Avatar name="Category 7" category={7} nameToInitials={nameToCategory} />
      <Avatar name="Category 8" category={8} nameToInitials={nameToCategory} />
      <Avatar name="Category 9" category={9} nameToInitials={nameToCategory} />
      <Avatar
        name="Category 10"
        category={10}
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 11"
        category={11}
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 12"
        category={12}
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 13"
        category={13}
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 14"
        category={14}
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 15"
        category={15}
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 16"
        category={16}
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 17"
        category={17}
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 18"
        category={18}
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 19"
        category={19}
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 20"
        category={20}
        nameToInitials={nameToCategory}
      />
    </GridLayout>
  );
};
