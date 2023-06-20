import Script from "next/script";
import "./globals.css";
import "hint.css/hint.css";
import SessionDataProvider from "@/components/SessionDataProvider/SessionDataProvider";

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
      <body>
        <SessionDataProvider>{children}</SessionDataProvider>
      </body>
    </html>
  );
}
