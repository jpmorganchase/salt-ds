import { ReactElement } from "react";
import { Tag } from "@salt-ds/lab";
import { GridLayout } from "@salt-ds/core";

export const Categories = (): ReactElement => (
  <GridLayout rows={5} columns={4}>
    <Tag>Cat-1</Tag>
    <Tag category={2}>Cat-2</Tag>
    <Tag category={3}>Cat-3</Tag>
    <Tag category={4}>Cat-4</Tag>
    <Tag category={5}>Cat-5</Tag>
    <Tag category={6}>Cat-6</Tag>
    <Tag category={7}>Cat-7</Tag>
    <Tag category={8}>Cat-8</Tag>
    <Tag category={9}>Cat-9</Tag>
    <Tag category={10}>Cat-10</Tag>
    <Tag category={11}>Cat-11</Tag>
    <Tag category={12}>Cat-12</Tag>
    <Tag category={13}>Cat-13</Tag>
    <Tag category={14}>Cat-14</Tag>
    <Tag category={15}>Cat-15</Tag>
    <Tag category={16}>Cat-16</Tag>
    <Tag category={17}>Cat-17</Tag>
    <Tag category={18}>Cat-18</Tag>
    <Tag category={19}>Cat-19</Tag>
    <Tag category={20}>Cat-20</Tag>
  </GridLayout>
);
