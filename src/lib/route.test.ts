import { describe, expect, it } from "vitest";
import { publicViewForPath, publicViewHref } from "./route";

describe("GitHub Pages public routes", () => {
  it("opens Awards directly from both canonical and slashless project URLs", () => {
    expect(publicViewForPath("/smem-board/awards/", "/smem-board/")).toBe("awards");
    expect(publicViewForPath("/smem-board/awards", "/smem-board/")).toBe("awards");
    expect(publicViewForPath("/smem-board/", "/smem-board/")).toBe("leaderboards");
  });

  it("produces project-relative links and rejects unrelated paths", () => {
    expect(publicViewHref("awards", "/smem-board/")).toBe("/smem-board/awards/");
    expect(publicViewHref("leaderboards", "/smem-board/")).toBe("/smem-board/");
    expect(publicViewForPath("/smem-board/awards-history/", "/smem-board/")).toBe("leaderboards");
    expect(publicViewForPath("/awards/", "/smem-board/")).toBe("leaderboards");
  });
});
