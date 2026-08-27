import {
  Banner,
  BannerContent,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexLayout,
  FormField,
  FormFieldLabel,
  H1,
  Input,
  SaltProviderNext,
  StackLayout,
  Text,
  type Density,
  type Mode,
} from "@salt-ds/core";
import { AddIcon, DarkIcon, LightIcon } from "@salt-ds/icons";
import { type FormEvent, useState } from "react";

export function App() {
  const [mode, setMode] = useState<Mode>("light");
  const [density, setDensity] = useState<Density>("low");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <SaltProviderNext mode={mode} density={density} accent="teal" corner="rounded">
      <div className="appShell" data-mode={mode} data-density={density}>
        <header className="appHeader">
          <a className="brand" href="#main">Salt starter</a>
          <nav aria-label="Primary navigation" className="primaryNav">
            <a aria-current="page" href="#overview">Overview</a>
            <a href="#team">Team</a>
            <a href="#settings">Settings</a>
          </nav>
          <FlexLayout gap={1} className="controls">
            <Button
              data-testid="mode-toggle"
              appearance="transparent"
              aria-label={`Use ${mode === "light" ? "dark" : "light"} mode`}
              onClick={() => setMode(mode === "light" ? "dark" : "light")}
            >
              {mode === "light" ? <DarkIcon aria-hidden /> : <LightIcon aria-hidden />}
            </Button>
            <Button
              data-testid="density-toggle"
              appearance="bordered"
              onClick={() => setDensity(density === "low" ? "high" : "low")}
            >
              Density: {density}
            </Button>
          </FlexLayout>
        </header>

        <main id="main" className="mainContent">
          <section id="overview" className="hero" aria-labelledby="page-title">
            <StackLayout gap={1}>
              <Text color="secondary">Workspace</Text>
              <H1 id="page-title">Create a project</H1>
              <Text>Start with accessible Salt components and current theme tokens.</Text>
            </StackLayout>
            <Button sentiment="accented" onClick={() => setDialogOpen(true)}>
              <AddIcon aria-hidden /> Preview launch
            </Button>
          </section>

          {saved && (
            <Banner status="success">
              <BannerContent role="status">Project settings saved.</BannerContent>
            </Banner>
          )}

          <Card className="formCard">
            <form onSubmit={submit} aria-label="Project details">
              <StackLayout gap={2}>
                <FormField>
                  <FormFieldLabel>Project name</FormFieldLabel>
                  <Input
                    name="projectName"
                    inputProps={{ required: true }}
                    placeholder="Market insights"
                  />
                </FormField>
                <FormField>
                  <FormFieldLabel>Owner email</FormFieldLabel>
                  <Input
                    name="owner"
                    inputProps={{ required: true, type: "email" }}
                    placeholder="owner@example.com"
                  />
                </FormField>
                <Button type="submit" sentiment="accented">Save project</Button>
              </StackLayout>
            </form>
          </Card>
        </main>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen} size="small">
          <DialogHeader header="Ready to launch?" />
          <DialogContent>Review the project details before inviting collaborators.</DialogContent>
          <DialogActions>
            <Button appearance="transparent" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button sentiment="accented" onClick={() => setDialogOpen(false)}>Continue</Button>
          </DialogActions>
        </Dialog>
      </div>
    </SaltProviderNext>
  );
}
