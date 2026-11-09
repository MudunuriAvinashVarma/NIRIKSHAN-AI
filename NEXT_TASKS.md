# NIRIKSHAN AI – Next Tasks

Work top to bottom. Tick items in DEVELOPMENT_STATUS.md as you finish them.
Each task should take roughly 30–90 minutes.

## Before Day 1 (data research, no coding)

- **D1**: Visit the official sources in DATA_DICTIONARY.md Section 3. Note
  what is downloadable and its format.
- **D2**: Create `data/raw/SOURCES.md` and record URLs, dates and licences.
- **D3**: Read the official MPLADS guidelines to understand how funds are
  released and spent.

## Day 1 – Foundation

- **B1**: Create folder structure from PROJECT_BLUEPRINT.md Section 4.
- **B2**: Create a Python virtual environment; install `fastapi`, `uvicorn`,
  `pandas`, `numpy`, `scikit-learn`, `pydantic`; save `requirements.txt`.
- **B3**: Create `main.py` with `GET /health`; run with `uvicorn`.
- **B4**: Write the SQLite schema (DATA_DICTIONARY.md Section 6) and a script
  that creates the tables.
- **B5**: Write `synthetic.py` (fixed seed, fake IDs, injected anomalies).
- **B6**: Write ingestion and cleaning with a cleaning log.
- **B7**: Add the datasets endpoints.

**Day 1 done when**: you can generate synthetic data via the API and see it
in `GET /datasets`.

## Day 2 – Machine Learning

- **M1**: Write `features.py` with the ratios from DATA_DICTIONARY.md
  Section 7, handling divide-by-zero.
- **M2**: Standardise features (`StandardScaler`).
- **M3**: Apply PCA; inspect explained variance.
- **M4**: Fit Isolation Forest; get scores.
- **M5**: Fit LOF; get scores.
- **M6**: Normalise both scores to 0–1 and average them.
- **M7**: Write the explanation function (feature vs peer median).
- **M8**: Save everything to the database; add the analysis endpoints.
- **M9**: Validate: check how many injected synthetic anomalies were flagged.

**Day 2 done when**: `GET /analysis/runs/{id}/results` returns scored
records and most injected anomalies rank near the top.

## Day 3 – Frontend and Polish

- **F1**: `npx create-next-app@latest` with TypeScript and Tailwind.
- **F2**: Create `lib/api.ts` and `types/`.
- **F3**: Dashboard page with summary cards.
- **F4**: Anomaly table with sorting and a flagged-only filter.
- **F5**: PCA scatter plot (a lightweight chart library).
- **F6**: Record detail page showing the explanation.
- **F7**: Synthetic-data banner and the disclaimer text.
- **F8**: Write README with setup steps; update DEVELOPMENT_STATUS.md.
- **F9**: Add a few tests for cleaning and feature functions.

**Day 3 done when**: someone else can follow the README, run both servers,
and see the demo dashboard.

## After Day 3 (backlog)

- Replace synthetic input with real data once the mapping is complete.
- Peer grouping (compare within state or category).
- Multi-year trend features.
- Compare additional detectors.
- Stability analysis across random seeds.
- PostgreSQL and authentication.