import { createIcon } from "../icon/createIcon";

export const ErrorIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="ErrorIcon">
    <path d="M9.005 0 12 3v6l-3 3H3L0 9V3l3-3h6.005zM6.013 7.5c-.286 0-.526.095-.721.285S5 8.213 5 8.5s.097.525.292.715.435.285.721.285.522-.1.708-.299S7 8.768 7 8.5c0-.269-.093-.502-.279-.701S6.299 7.5 6.013 7.5zM7 2H5v5h2V2z" />
  </svg>,
  "Error",
  "error"
);
