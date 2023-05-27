import { useReducer, Dispatch, useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";

interface DatesData {
  id: number;
  year: number;
  month: number;
  day: number;
  description: string;
}

async function fetchGameTarget() {
  const randomNumber = Math.floor(Math.random() * 16726);
  const response = await fetch(
    `https://hisotry-events.app01.xyzapps.xyz/data/${randomNumber}`
  );
  const data: DatesData = await response.json();
  return data;
}

async function fetchHistoryClue(
  year: number,
  month: number,
  day: number,
  exact = false
) {
  let response = null;

  // check if day has data
  response = await fetch(
    `https://hisotry-events.app01.xyzapps.xyz/data?year=${year}&month=${month}&day=${day}`
  );
  const data_day: DatesData[] = await response.json();
  if (data_day.length > 0) {
    // random pick one
    const randomNumber = Math.floor(Math.random() * data_day.length);
    return data_day[randomNumber];
  }

  if (exact) {
    return null;
  }

  // check if day and month has data
  response = await fetch(
    `https://hisotry-events.app01.xyzapps.xyz/data?year=${year}&month=${month}`
  );
  const data_monthyear: DatesData[] = await response.json();
  if (data_monthyear.length > 0) {
    // random pick one
    const randomNumber = Math.floor(Math.random() * data_monthyear.length);
    return data_monthyear[randomNumber];
  }

  // check if year has data
  response = await fetch(
    `https://hisotry-events.app01.xyzapps.xyz/data?year=${year}`
  );
  let data_year: DatesData[] = await response.json();
  if (data_year.length > 0) {
    // random pick one
    const randomNumber = Math.floor(Math.random() * data_year.length);
    return data_year[randomNumber];
  }

  return null;
}

const MONTHS = [
  "January",
  "Feburary",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "Novemeber",
  "December",
];

export default function Home() {
  const [gameTarget, setGameTarget] = useState<DatesData | null>(null);
  const [eventList, setEventList] = useState<DatesData[]>([]);
  const [tries, setTries] = useState(0);

  const answerList = useRef<string[]>([]);
  const newestEntry = useRef<DatesData | null>(null);

  async function submitAnswer() {
    if (!gameTarget) {
      return;
    }

    const year = inputDate.getFullYear();
    const month = inputDate.getMonth() + 1;
    const day = inputDate.getDate();

    if (answerList.current.includes(`${year}-${month}-${day}`)) {
      toast("Please enter a different date", {
        type: "error",
      });
      return;
    }

    setTries((prev) => prev + 1);

    answerList.current.push(`${year}-${month}-${day}`);

    const isCorrect =
      year === gameTarget.year &&
      month === gameTarget.month &&
      day === gameTarget.day;

    if (isCorrect) {
      // alert("Correct!");
      toggleWinModal();
    }

    let clue: DatesData | null = null;

    // check if input year month and day is within 10 days of the target
    const submittedDate = new Date(year, month - 1, day);
    const targetDate = new Date(
      gameTarget.year,
      gameTarget.month - 1,
      gameTarget.day
    );

    const diff = Math.abs(submittedDate.getTime() - targetDate.getTime());
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
    const searchExact = diffDays <= 30; // search exact if within 10 days

    clue = await fetchHistoryClue(year, month, day, searchExact);

    if (searchExact) {
      clue = {
        year,
        description: `No event for month and day of ${
          MONTHS[month - 1]
        } ${day} in ${year}`,
        month: month,
        day: day,
        id: year * 10000 + month * 100 + day,
      };
    }

    if (!clue) {
      clue = {
        year,
        description: `No event for month and day of ${
          MONTHS[month - 1]
        } ${day} in ${year}`,
        month: month,
        day: day,
        id: year * 10000 + month * 100 + day,
      };
    }

    // check if clue is already in the list
    if (eventList.find((event) => event.id === clue?.id)) {
      // alert("Clue already found");
      // return;
      clue = {
        year,
        description: `No event for month and day of ${
          MONTHS[month - 1]
        } ${day} in ${year}`,
        month: month,
        day: day,
        id: year * 10000 + month * 100 + day,
      };
    }
    toast(
      `New clue found -> ${clue.description} [${clue.year}-${clue.month}-${clue.day}]`,
      {
        type: "success",
      }
    );
    newestEntry.current = clue;
    const newClueList = [...eventList, clue];
    // sort by year - month - day
    newClueList.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      if (a.month !== b.month) {
        return a.month - b.month;
      }
      return a.day - b.day;
    });

    setEventList(newClueList);
  }

  useEffect(() => {
    fetchGameTarget().then((data) => {
      setGameTarget(data);
      setEventList([...eventList, data]);
    });
  }, []);

  const date = new Date();
  const [inputDate, setInputDate] = useState(date);

  function toggleWinModal() {
    // simulate an a href click
    const a = document.createElement("a");
    a.href = "#win-modal";
    a.click();
  }

  return (
    <main className="relative w-screen h-screen bg-base-100 text-base-content">
      <div className="absolute left-0 right-0 flex flex-col items-center justify-center p-4 top-2">
        <h1 className="text-2xl md:text-4xl">History Guesser</h1>
        <p className="text-sm md:text-base">
          Guess the year, month and day of an event in history
        </p>
      </div>
      <div className="absolute left-0 right-0 flex flex-col items-center bottom-2">
        <div className="shadow-xl d-card min-w-96 bg-base-200 d-card-bordered border-neutral-50 d-card-compact">
          <div className="d-card-body">
            <div className="flex max-w-screen-sm gap-3">
              <input
                type="date"
                className="w-full d-input d-input-sm"
                defaultValue={date.toISOString().split("T")[0]}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setInputDate(date);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    submitAnswer();
                  }
                }}
              />
            </div>
            <div className="justify-between d-card-actions">
              <p>Tries: {tries}</p>
              <a href="#clue-modal" className="d-btn d-btn-secondary d-btn-sm">
                How To Play
              </a>
              <button
                className="d-btn d-btn-primary d-btn-sm"
                onClick={submitAnswer}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
        <p className="p-2 text-xs text-center md:text-sm">
          Guess a Date. If you guessed wrong, we&apos;ll give you a clue or an
          event{" "}
        </p>
      </div>
      {gameTarget && (
        <div className="flex flex-col items-center justify-center w-full h-full p-2 pb-24 md:pb-16">
          <div className="max-w-screen-sm overflow-x-auto max-h-[58vh] w-full relative shadow-md border-black border bg-base-300 p-4 rounded-md">
            <div className="flex flex-col w-full gap-4">
              {eventList.length == 0 && (
                <div className="w-5 h-5 m-8 mx-auto animate-spin bg-secondary"></div>
              )}
              {eventList.map((event, index) => (
                <div
                  className={
                    "w-full shadow-xl d-card bg-base-100 d-card-bordered border-neutral-50" +
                    (event.id === gameTarget.id
                      ? " bg-secondary text-secondary-content"
                      : newestEntry.current?.id === event.id
                      ? " bg-base-300 text-base-content"
                      : "")
                  }
                  key={event.id}
                >
                  <div className="d-card-body">
                    <p>{event.description}</p>
                    {event.id === gameTarget.id ? (
                      <p>--- Guess Me ---</p>
                    ) : (
                      <p>
                        {MONTHS[event.month - 1]} {event.day}, {event.year}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
      <div className="d-modal" id="win-modal">
        <div className="d-modal-box">
          <h3 className="text-lg font-bold">
            Congratulations! You guessed the exact date!
          </h3>
          <p className="py-4">
            {gameTarget?.description} -{MONTHS[gameTarget?.month || 1 - 1]}{" "}
            {gameTarget?.day}, {gameTarget?.year}
          </p>
          <div className="d-modal-action">
            <button
              onClick={() => {
                const currentPageLink = window.location.href;
                // remove the #win-modal from the url
                const newPageLink = currentPageLink.replace("#win-modal", "");

                // go to link
                window.location.href = newPageLink;
              }}
              className="d-btn"
            >
              Retry?
            </button>
          </div>
        </div>
      </div>
      <div className="d-modal" id="clue-modal">
        <div className="d-modal-box">
          <h3 className="text-lg font-bold text-center">
            How To Play History Guesser
          </h3>
          <p className="py-4">
            You will be given an event in history ranging from year 1 to 2023.
            <br />
            <br />
            You can submit your answer by typing the date of your guess in the
            input box and clicking submit.
            <br />
            <br />
            If you guessed wrong, we&apos;ll give you a clue or an event. If you
            guessed the exact date, you win!
          </p>
          <div className="d-modal-action">
            <a href="#" className="d-btn">
              Ok
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
