import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="dark flex min-h-screen w-full justify-between bg-[#000319] font-inter">
      {children}
      <div className="auth-asset">
        <div>
          <Image
            src="/screenshots/auth-preview.jpg"
            alt="NextBank dashboard preview"
            width={1000}
            height={700}
            className="rounded-l-xl object-cover"
          />
        </div>
      </div>
    </main>
  );
}
