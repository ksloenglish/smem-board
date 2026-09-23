# K S Lo English SolidMemory Board

This repository publishes the **student-facing static** SolidMemory Leaderboards and published Awards site at:

<https://ksloenglish.github.io/smem-board/>

The GitHub Pages deployment rebuilds shortly after the existing 08:00 and 20:00 HKT data refreshes, and can also be started manually from the repository’s **Actions** tab.

## Privacy boundary

The repository never contains a live leaderboard snapshot. During deployment, the workflow obtains the current allow-listed display data and validates that it contains no student user identifiers, report URLs, credentials, raw-archive metadata or unpublished award results. The generated snapshot is used only in the Pages deployment artefact; it is not committed to Git history.

The owner-only Administration area, data-source configuration, SolidMemory token connection, raw-data archives, schedules, award drafting and publication remain in the private production system.

## Local development

```bash
pnpm install
pnpm dev
```

Without a generated deployment snapshot, the site displays its empty public-state interface. Do not add real leaderboard records to this repository for local testing.
