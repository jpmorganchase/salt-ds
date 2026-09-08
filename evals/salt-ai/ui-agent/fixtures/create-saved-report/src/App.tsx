import { H1, SaltProviderNext, Text } from "@salt-ds/core";

export function App() {
  return (
    <SaltProviderNext accent="teal" corner="rounded">
      <main className="appShell">
        <Text color="secondary">Analytics workspace</Text>
        <H1>Saved reports</H1>
        <Text>No saved reports yet.</Text>
      </main>
    </SaltProviderNext>
  );
}
