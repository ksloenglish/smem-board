import { useCallback, useEffect, useState } from "react";
import snapshot from "./generated/public-data.json";
import type { PublicSiteSnapshot } from "./types";
import { LeaderboardPage } from "./LeaderboardPage";
import { AwardsPage } from "./AwardsPage";
import { publicViewForPath, publicViewHref, type PublicView } from "./lib/route";
import "./styles.css";

const data = snapshot as PublicSiteSnapshot;

export default function App() {
  const [view, setView] = useState<PublicView>(() => publicViewForPath(window.location.pathname, import.meta.env.BASE_URL));
  useEffect(() => {
    const onPopState = () => setView(publicViewForPath(window.location.pathname, import.meta.env.BASE_URL));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => {
    document.title = `SolidMemory ${view === "awards" ? "Awards" : "Leaderboards"} | HKMA K S Lo College`;
  }, [view]);
  const navigate = useCallback((next: PublicView) => {
    const path = publicViewHref(next, import.meta.env.BASE_URL);
    if (window.location.pathname !== path) window.history.pushState({}, "", path);
    setView(next);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);
  const showLeaderboards = useCallback(() => {
    navigate("leaderboards");
  }, [navigate]);
  const showAwards = useCallback(() => {
    navigate("awards");
  }, [navigate]);

  return view === "leaderboards"
    ? <LeaderboardPage snapshot={data} onAwards={showAwards} />
    : <AwardsPage snapshot={data} onHome={showLeaderboards} />;
}
