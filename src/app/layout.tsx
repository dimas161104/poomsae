import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poomsae Online - Digital Tournament Scoring System",
  description: "Sistem penilaian digital Taekwondo Poomsae - Platform resmi kejuaraan nasional dengan standar WT (World Taekwondo)",
  keywords: ["poomsae", "taekwondo", "scoring", "tournament", "PBTI", "WT"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
