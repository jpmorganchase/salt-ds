import { SaltProvider } from "@salt-ds/core";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SaltProvider>{children}</SaltProvider>
      </body>
    </html>
  );
}
