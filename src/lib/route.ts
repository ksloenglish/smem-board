export type PublicView = "leaderboards" | "awards";

/** Match only the Awards subdirectory of this Pages project, with or without a trailing slash. */
export function publicViewForPath(pathname: string, baseUrl: string): PublicView {
  const base = baseUrl.replace(/\/+$/, "");
  const path = pathname.replace(/\/+$/, "");
  return path === `${base}/awards` ? "awards" : "leaderboards";
}

export function publicViewHref(view: PublicView, baseUrl: string): string {
  const base = `${baseUrl.replace(/\/+$/, "")}/`;
  return view === "awards" ? `${base}awards/` : base;
}
