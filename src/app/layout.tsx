import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ISUFT Capstone Portal",
  description: "Iloilo State University of Fisheries Science and Technology – CICT Capstone Research Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50 font-sans antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-blue-900 text-blue-200 text-center text-xs py-3">
          © {new Date().getFullYear()} ISUFT – College of Information and Communications Technology
        </footer>
      </body>
    </html>
  );
}
