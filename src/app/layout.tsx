import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Lightwand",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
