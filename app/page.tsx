import Image from "next/image";
import Link from "next/link";
import Chatbox from "./components/Chatbox";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8    font-[family-name:var(--font-geist-sans)]">
      <header className="flex w-full justify-start items-center gap-2">
        <Link href="https://partselect.com" target="_blank" rel="noopener noreferrer">
          <Image src="/partselect-logo.svg" alt="Instalily" width={200} height={200} />
        </Link>
        <span className="text-xl font-bold text-[#000]">Chat Assistant</span>
      </header>
      <main className="flex flex-col row-start-2 items-center sm:items-start h-full mt-8">
        <Chatbox />
      </main>
    </div>
  );
}
