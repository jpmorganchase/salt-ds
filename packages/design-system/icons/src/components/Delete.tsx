import { createIcon } from "../icon/createIcon";

export const DeleteIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="DeleteIcon">
    <path d="M7.8 10.595c-.095.27-.228.405-.4.405l-3.8-.006c-.261 0-.4-.194-.4-.406L2.2 3h6.6l-1 7.595zM4 1.424C4 1.191 4.201 1 4.444 1h2.112c.246 0 .444.19.444.424V2H4v-.576zM11 2H8V.992A.99.99 0 0 0 7 0H4c-.559 0-1 .443-1 .992V2H0v1h1l1 8c0 .548.437 1 1 1h5c.563 0 1-.452 1-1l1-8h1V2z" />
    <path d="M7 4v6H6V4h1zM4.977 4 5 9.997 4 10l.01-5.99.967-.01z" />
  </svg>,
  "Delete",
  "delete"
);
