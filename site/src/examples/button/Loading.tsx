import { Button, FlowLayout, StackLayout } from "@salt-ds/core";

export const Loading = () => (
  <StackLayout gap={3}>
    <FlowLayout>
      <Button appearance="solid" sentiment="positive" loading>
        Solid
      </Button>
      <Button appearance="bordered" sentiment="positive" loading>
        Bordered
      </Button>
      <Button appearance="transparent" sentiment="positive" loading>
        Transparent
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" sentiment="accented" loading>
        Solid
      </Button>
      <Button appearance="bordered" sentiment="accented" loading>
        Bordered
      </Button>
      <Button appearance="transparent" sentiment="accented" loading>
        Transparent
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" sentiment="neutral" loading>
        Solid
      </Button>
      <Button appearance="bordered" sentiment="neutral" loading>
        Bordered
      </Button>
      <Button appearance="transparent" sentiment="neutral" loading>
        Transparent
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" sentiment="caution" loading>
        Solid
      </Button>
      <Button appearance="bordered" sentiment="caution" loading>
        Bordered
      </Button>
      <Button appearance="transparent" sentiment="caution" loading>
        Transparent
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" sentiment="negative" loading>
        Solid
      </Button>
      <Button appearance="bordered" sentiment="negative" loading>
        Bordered
      </Button>
      <Button appearance="transparent" sentiment="negative" loading>
        Transparent
      </Button>
    </FlowLayout>
  </StackLayout>
);
