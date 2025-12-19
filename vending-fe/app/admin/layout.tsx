import { Lexend } from "next/font/google";
import type { Metadata } from "next";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "MediVend Admin",
  description: "Admin Console for MediVend",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={lexend.className}>{children}</div>;
}
