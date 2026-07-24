import { useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Rail, TopBar } from "./components/Chrome";
import { getSet } from "./sets";
import { page } from "./ui";
import Library from "./routes/Library";
import SetOverview from "./routes/SetOverview";
import Words from "./routes/Words";
import Quiz from "./routes/Quiz";
import Rules from "./routes/Rules";
import Practice from "./routes/Practice";
import Comments from "./routes/Comments";

/** What a leaf route is called in the document title. Anything unlisted is the
    document's own overview. */
const LEAVES: Record<string, string> = {
  words: "The words",
  quiz: "Quiz",
  rules: "The rules",
  practice: "Practice",
  comments: "Comments",
};

/* Client-side navigation keeps the previous route's scroll position; restore
   the top on every change, and keep the document title in step. */
function Head() {
  const { pathname, search, hash } = useLocation();
  const last = useRef<string | null>(null);

  useEffect(() => {
    /* A chapter link carries its target in the hash. Jumping to it within the
       page can glide; arriving from another page should not sweep the whole
       document, so that one lands instantly. */
    const samePage = last.current === pathname;
    last.current = pathname;

    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView({ behavior: samePage ? "auto" : "instant" });
    else window.scrollTo(0, 0);
  }, [pathname, search, hash]);

  useEffect(() => {
    const [, slug, leaf] = pathname.split("/");
    const doc = getSet(slug);
    const leafTitle = leaf ? LEAVES[leaf] : undefined;

    document.title = !doc
      ? pathname === "/comments"
        ? "All comments"
        : "Vocabulary — every set"
      : leafTitle
        ? `${leafTitle} · ${doc.title}`
        : `${doc.title} — ${doc.theme}`;
  }, [pathname]);

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
          {/* Vocabulary sets */}
          <Route path="/:set/words" element={<Words />} />
          <Route path="/:set/quiz" element={<Quiz />} />
          {/* Grammar guides */}
          <Route path="/:set/rules" element={<Rules />} />
          <Route path="/:set/practice" element={<Practice />} />
          <Route path="/:set/comments" element={<Comments />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
