import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexLayout,
  H3,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { useEffect, useRef, useState } from "react";

const initialRecords = [
  { id: "atlas", name: "Atlas" },
  { id: "mercury", name: "Mercury" },
  { id: "nova", name: "Nova" },
];

type ResearchRecord = (typeof initialRecords)[number];
type CloseDecision = "cancel" | "delete";
type FocusRequest = {
  targetId: string | null;
  previousTrigger: HTMLButtonElement | undefined;
};

export const DeletionWithFocus = () => {
  const [records, setRecords] = useState(initialRecords);
  const [selectedRecord, setSelectedRecord] = useState<ResearchRecord | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const [dialogElement, setDialogElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const closeDecision = useRef<CloseDecision | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());
  const nextRecordNumber = useRef(1);

  const requestDeletion = (record: ResearchRecord) => {
    if (selectedRecord) return;
    closeDecision.current = null;
    setFocusRequest(null);
    setSelectedRecord(record);
    setOpen(true);
  };

  const close = (decision: CloseDecision) => {
    // A second activation or Escape during closing must not change the decision.
    if (!open || closeDecision.current) return;
    closeDecision.current = decision;
    setOpen(false);
  };

  useEffect(() => {
    if (open || dialogElement || !selectedRecord || !closeDecision.current) {
      return;
    }

    const decision = closeDecision.current;
    closeDecision.current = null;

    // Keep the record and its trigger until the default web Dialog has unmounted
    // its floating DOM. This passive effect runs after its unmount cleanup.
    if (decision === "delete") {
      const index = records.findIndex(({ id }) => id === selectedRecord.id);
      const remaining = records.filter(({ id }) => id !== selectedRecord.id);
      const previousTrigger = rowRefs.current.get(selectedRecord.id);
      const ownerDocument = addRef.current?.ownerDocument;
      const activeElement = ownerDocument?.activeElement;

      if (
        ownerDocument &&
        (activeElement === previousTrigger ||
          activeElement === ownerDocument.body)
      ) {
        setFocusRequest({
          targetId:
            remaining[Math.min(index, remaining.length - 1)]?.id ?? null,
          previousTrigger,
        });
      }

      setRecords(remaining);
      setAnnouncement(`Deleted ${selectedRecord.name}.`);
    }

    // Cancel and Escape leave the data and Dialog's default return focus intact.
    setSelectedRecord(null);
  }, [open, dialogElement, selectedRecord, records]);

  useEffect(() => {
    if (!focusRequest) return;

    // The collection update has now committed and the removed trigger is gone.
    // Respect focus if the user has already moved to another control.
    const ownerDocument = addRef.current?.ownerDocument;
    const activeElement = ownerDocument?.activeElement;
    if (
      ownerDocument &&
      (activeElement === ownerDocument.body ||
        activeElement === focusRequest.previousTrigger)
    ) {
      const target = focusRequest.targetId
        ? rowRefs.current.get(focusRequest.targetId)
        : addRef.current;
      target?.focus();
    }
    setFocusRequest(null);
  }, [focusRequest]);

  const addRecord = () => {
    const number = nextRecordNumber.current++;
    const record = { id: `added-${number}`, name: `New record ${number}` };
    setRecords((current) => [...current, record]);
    setAnnouncement(`Added ${record.name}.`);
  };

  return (
    <StackLayout gap={2} style={{ width: "100%", maxWidth: 480 }}>
      <FlexLayout align="center" justify="space-between" gap={2}>
        <H3>Research records</H3>
        <Button ref={addRef} appearance="bordered" onClick={addRecord}>
          Add record
        </Button>
      </FlexLayout>
      {records.length > 0 ? (
        <StackLayout
          as="ul"
          aria-label="Research records"
          gap={1}
          style={{ listStyle: "none", margin: 0, padding: 0 }}
        >
          {records.map((record) => (
            <FlexLayout
              as="li"
              key={record.id}
              align="center"
              justify="space-between"
              gap={2}
            >
              <Text>{record.name}</Text>
              <Button
                ref={(element) => {
                  if (element) rowRefs.current.set(record.id, element);
                  else rowRefs.current.delete(record.id);
                }}
                aria-label={`Delete ${record.name}`}
                appearance="transparent"
                onClick={() => requestDeletion(record)}
              >
                Delete
              </Button>
            </FlexLayout>
          ))}
        </StackLayout>
      ) : (
        <Text>No records remain.</Text>
      )}
      <Text as="p" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </Text>
      <Dialog
        ref={setDialogElement}
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) close("cancel");
        }}
        initialFocus={cancelRef}
        disableDismiss
        size="small"
      >
        <DialogHeader header="Delete record?" />
        <DialogContent>
          Delete {selectedRecord?.name}? This cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button
            ref={cancelRef}
            appearance="bordered"
            onClick={() => close("cancel")}
          >
            Cancel
          </Button>
          <Button sentiment="negative" onClick={() => close("delete")}>
            Confirm delete
          </Button>
        </DialogActions>
      </Dialog>
    </StackLayout>
  );
};
