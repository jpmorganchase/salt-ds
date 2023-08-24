import { ReactElement } from "react";
import { FlowLayout, Input } from "@salt-ds/core";

export const Placeholder = (): ReactElement => (
<FlowLayout style={{width: "256px"}}>
    <Input placeholder={"Enter a value"} />
    <Input disabled placeholder={"Enter a value"} />
    <Input readOnly placeholder={"Enter a value"} />
</FlowLayout>
);