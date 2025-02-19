import { Avatar, GridLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

function nameToCategory(name?: string) {
  return name?.replace("Category ", "") ?? "";
}

export const Categories = (): ReactElement => {
  return (
    <GridLayout columns={5}>
      <Avatar
        name="Category 1"
        color="category-1"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 2"
        color="category-2"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 3"
        color="category-3"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 4"
        color="category-4"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 5"
        color="category-5"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 6"
        color="category-6"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 7"
        color="category-7"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 8"
        color="category-8"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 9"
        color="category-9"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 10"
        color="category-10"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 11"
        color="category-11"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 12"
        color="category-12"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 13"
        color="category-13"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 14"
        color="category-14"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 15"
        color="category-15"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 16"
        color="category-16"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 17"
        color="category-17"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 18"
        color="category-18"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 19"
        color="category-19"
        nameToInitials={nameToCategory}
      />
      <Avatar
        name="Category 20"
        color="category-20"
        nameToInitials={nameToCategory}
      />
    </GridLayout>
  );
};
