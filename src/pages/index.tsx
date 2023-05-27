import Link from "next/link";

export default function Home() {
  return (
    <main className="w-screen h-screen bg-base-100 text-base-content">
      <div className="flex flex-col items-center justify-center w-full h-full gap-2 p-4 text-center">
        <h1 className="text-4xl">History Guesser</h1>
        <p>Guess the year, month and day of an event in history</p>
        <Link href="/play" className="d-btn d-btn-primary">
          Play
        </Link>
        <div className="mt-24">
          <p className="font-bold">Credits</p>
          <p>Dates were scrapped from Wikipedia</p>
          <p>
            Developed by{" "}
            <a href="https://dev.leocastro.com" className="d-link">
              Leo Castro
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
