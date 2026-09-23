export type LeaderboardEntryDTO = {
  rank: number;
  class: string;
  group: string;
  eName: string;
  cName: string;
  classNo: string;
  exerciseDone: number;
  daysWithExerciseDone: number;
  firstAttempted: number;
  allAttempted: number;
  retentionRate: string;
  rankChange: number | null;
};

export type BoardKind = "monthly" | "annual" | "wordsmith";

export type LeaderboardDTO = {
  boardKey: string;
  kind: BoardKind;
  form: string | null;
  title: string;
  period: string | null;
  reportTime: string | null;
  fetchedAt: number | null;
  entries: LeaderboardEntryDTO[];
};

export type LeaderboardMeta = {
  availableBoards: string[];
  s6Visible: boolean;
  lastUpdated: number | null;
};

export type AwardType = "monthly" | "annual" | "s6final";

export type AwardWinnerDTO = {
  rank: number;
  form: string;
  class: string;
  group: string;
  eName: string;
  cName: string;
  classNo: string;
  exerciseDone: number;
  daysWithExerciseDone: number;
  firstAttempted: number;
  allAttempted: number;
  prize: string;
};

export type AwardListDTO = {
  awardType: "vocab" | "annual" | "wordsmith";
  formScope: string;
  winners: AwardWinnerDTO[];
  status: "success" | "error";
  message: string | null;
  generatedAt: number | null;
};

export type AwardPeriodDTO = {
  periodKey: string;
  type: AwardType;
  label: string;
  schoolYear: string;
  startMs: number;
  endMs: number;
  annualStartMs: number | null;
  minDays: number;
  minFirstAttempted: number;
  prizeText: string | null;
  published: boolean;
  showS6: boolean;
  hasGeneratedResults: boolean;
  latestGeneratedAt: number | null;
};

export type PublicSiteSnapshot = {
  version: 1;
  generatedAt: number;
  leaderboard: {
    meta: LeaderboardMeta;
    boards: LeaderboardDTO[];
  };
  awards: {
    periods: AwardPeriodDTO[];
    winnersByPeriod: Record<string, AwardListDTO[]>;
  };
};
