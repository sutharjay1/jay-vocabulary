import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Rail, TopBar } from "./components/Chrome";
import { getSet } from "./sets";
import { page } from "./ui";
import Library from "./routes/Library";
import SetOverview from "./routes/SetOverview";
import Words from "./routes/Words";
import Quiz from "./routes/Quiz";
import Comments from "./routes/Comments";

/* Client-side navigation keeps the previous route's scroll position; restore
   the top on every change, and keep the document title in step. */
function Head() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);

    const [, slug, leaf] = pathname.split("/");
    const set = getSet(slug);
    document.title = !set
      ? leaf === undefined && pathname === "/comments"
        ? "All comments"
        : "Vocabulary — every set"
      : leaf === "quiz"
        ? `Quiz · ${set.title}`
        : leaf === "comments"
          ? `Comments · ${set.title}`
          : leaf === "words"
            ? `The words · ${set.title}`
            : `${set.title} — ${set.theme}`;
  }, [pathname, search]);
  return null;
}

export default function App() {
  return (
    <>
      <Head />
      <main className={page}>
        <TopBar />
        <Rail />
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/:set" element={<SetOverview />} />
          <Route path="/:set/words" element={<Words />} />
          <Route path="/:set/quiz" element={<Quiz />} />
          <Route path="/:set/comments" element={<Comments />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
