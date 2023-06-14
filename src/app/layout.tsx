import Script from "next/script";
import "./globals.css";
import "hint.css/hint.css";

export const metadata = {
  title: {
    default: "Lightrail",
  },
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
