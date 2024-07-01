import { ReactElement } from "react";
import { GridLayout, StackLayout, Tag } from "@salt-ds/core";

export const Categories = (): ReactElement => (
  <StackLayout direction="row" gap={4}>
    <GridLayout columns={3} gap={2}>
      <Tag>Cat-1</Tag>
      <Tag bordered>Cat-1</Tag>
      <Tag variant="secondary">Cat-1</Tag>
      <Tag category={2}>Cat-2</Tag>
      <Tag bordered category={2}>
        Cat-2
      </Tag>
      <Tag variant="secondary" category={2}>
        Cat-2
      </Tag>
      <Tag category={3}>Cat-3</Tag>
      <Tag bordered category={3}>
        Cat-3
      </Tag>
      <Tag variant="secondary" category={3}>
        Cat-3
      </Tag>
      <Tag category={4}>Cat-4</Tag>
      <Tag bordered category={4}>
        Cat-4
      </Tag>
      <Tag variant="secondary" category={4}>
        Cat-4
      </Tag>
      <Tag category={5}>Cat-5</Tag>
      <Tag bordered category={5}>
        Cat-5
      </Tag>
      <Tag variant="secondary" category={5}>
        Cat-5
      </Tag>
      <Tag category={6}>Cat-6</Tag>
      <Tag bordered category={6}>
        Cat-6
      </Tag>
      <Tag variant="secondary" category={6}>
        Cat-6
      </Tag>
      <Tag category={7}>Cat-7</Tag>
      <Tag bordered category={7}>
        Cat-7
      </Tag>
      <Tag variant="secondary" category={7}>
        Cat-7
      </Tag>
      <Tag category={8}>Cat-8</Tag>
      <Tag bordered category={8}>
        Cat-8
      </Tag>
      <Tag variant="secondary" category={8}>
        Cat-8
      </Tag>
      <Tag category={9}>Cat-9</Tag>
      <Tag bordered category={9}>
        Cat-9
      </Tag>
      <Tag variant="secondary" category={9}>
        Cat-9
      </Tag>
      <Tag category={10}>Cat-10</Tag>
      <Tag bordered category={10}>
        Cat-10
      </Tag>
      <Tag variant="secondary" category={10}>
        Cat-10
      </Tag>
    </GridLayout>
    <GridLayout columns={{ xs: 2, sm: 4, lg: 3 }} gap={2}>
      <Tag category={11}>Cat-11</Tag>
      <Tag bordered category={11}>
        Cat-11
      </Tag>
      <Tag variant="secondary" category={11}>
        Cat-11
      </Tag>
      <Tag category={12}>Cat-12</Tag>
      <Tag bordered category={12}>
        Cat-12
      </Tag>
      <Tag variant="secondary" category={12}>
        Cat-12
      </Tag>
      <Tag category={13}>Cat-13</Tag>
      <Tag bordered category={13}>
        Cat-13
      </Tag>
      <Tag variant="secondary" category={13}>
        Cat-13
      </Tag>
      <Tag category={14}>Cat-14</Tag>
      <Tag bordered category={14}>
        Cat-14
      </Tag>
      <Tag variant="secondary" category={14}>
        Cat-14
      </Tag>
      <Tag category={15}>Cat-15</Tag>
      <Tag bordered category={15}>
        Cat-15
      </Tag>
      <Tag variant="secondary" category={15}>
        Cat-15
      </Tag>
      <Tag category={16}>Cat-16</Tag>
      <Tag bordered category={16}>
        Cat-16
      </Tag>
      <Tag variant="secondary" category={16}>
        Cat-16
      </Tag>
      <Tag category={17}>Cat-17</Tag>
      <Tag bordered category={17}>
        Cat-17
      </Tag>
      <Tag variant="secondary" category={17}>
        Cat-17
      </Tag>
      <Tag category={18}>Cat-18</Tag>
      <Tag bordered category={18}>
        Cat-18
      </Tag>
      <Tag variant="secondary" category={18}>
        Cat-18
      </Tag>
      <Tag category={19}>Cat-19</Tag>
      <Tag bordered category={19}>
        Cat-19
      </Tag>
      <Tag variant="secondary" category={19}>
        Cat-19
      </Tag>
      <Tag category={20}>Cat-20</Tag>
      <Tag bordered category={20}>
        Cat-20
      </Tag>
      <Tag variant="secondary" category={20}>
        Cat-20
      </Tag>
    </GridLayout>
  </StackLayout>
);
