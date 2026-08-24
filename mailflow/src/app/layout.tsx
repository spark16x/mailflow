import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Providers from "@/contexts/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MailFlow",
  description: "A simple Gmail SMTP email scheduler",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen bg-gray-50 text-gray-900">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
