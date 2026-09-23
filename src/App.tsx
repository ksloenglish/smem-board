import { useCallback, useState } from "react";
import snapshot from "./generated/public-data.json";
import type { PublicSiteSnapshot } from "./types";
import { LeaderboardPage } from "./LeaderboardPage";
import { AwardsPage } from "./AwardsPage";
import "./styles.css";

const data = snapshot as PublicSiteSnapshot;

type PublicView = "leaderboards" | "awards";

export default function App() {
  const [view, setView] = useState<PublicView>("leaderboards");
  const showLeaderboards = useCallback(() => {
    setView("leaderboards");
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);
  const showAwards = useCallback(() => {
    setView("awards");
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return view === "leaderboards"
    ? <LeaderboardPage snapshot={data} onAwards={showAwards} />
    : <AwardsPage snapshot={data} onHome={showLeaderboards} />;
}
