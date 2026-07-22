import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Rail, TopBar } from "./components/Chrome";
import Overview from "./routes/Overview";
import Words from "./routes/Words";
import Quiz from "./routes/Quiz";

const TITLES: Record<string, string> = {
  "/": "Vocabulary — five words and how to use them",
  "/words": "The words · Vocabulary",
  "/quiz": "Quiz · Vocabulary",
};

/* Client-side navigation keeps the scroll position of the previous route;
   restore the top on every route change so pages start where they should. */
function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = TITLES[pathname] ?? "Vocabulary";
  }, [pathname, search]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <main className="container">
        <TopBar />
        <Rail />
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/words" element={<Words />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
