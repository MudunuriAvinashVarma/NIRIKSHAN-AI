# NIRIKSHAN AI – Project Blueprint

> Public Finance Intelligence Platform for MPLADS fund utilisation analysis.
> Status: Architecture phase. See DEVELOPMENT_STATUS.md.

## 1. Purpose

NIRIKSHAN AI analyses MPLADS (Members of Parliament Local Area Development
Scheme) fund utilisation and project execution data and **flags unusual
patterns for human review**.

### What this project IS
- A decision-support and research tool that highlights statistical outliers.
- A transparent pipeline: every flag can be explained with the numbers behind it.

### What this project is NOT
- It does NOT detect corruption, fraud or wrongdoing.
- An "anomaly" means "statistically different from its peers". There are often
  innocent explanations (a remote district, a large one-off project, data
  entry delays, a different reporting period).
- Output language everywhere in the UI must say "unusual pattern" or
  "flagged for review", never "suspicious" or "fraudulent".

## 2. Design Principles

1. **Modular**: data, features, models and API are separate layers. Any one can
   be swapped without rewriting the others.
2. **Honest about data**: real and synthetic data are physically separated and
   labelled (see DATA_DICTIONARY.md, Section 2).
3. **Explainable**: every flagged record shows which features drove the flag.
4. **Achievable**: the 3-day scope is a working vertical slice, not a full product.
5. **Research-ready**: model parameters, versions and results are stored so
   experiments can be reproduced and compared.

## 3. System Architecture

```
┌────────────────────────────────────────────────────────────┐
│  FRONTEND  (Next.js + TypeScript + Tailwind)               │
│  Dashboard | Anomaly table | Record detail | Data banner   │
└───────────────────────────┬────────────────────────────────┘
                            │ HTTP / JSON (REST)
┌───────────────────────────▼────────────────────────────────┐
│  BACKEND API  (FastAPI)                                    │
│  Routers → Services → Repositories                         │
│  Pydantic schemas validate all input/output                │
└──────────────┬─────────────────────────────┬───────────────┘
               │                             │
┌──────────────▼──────────────┐   ┌──────────▼───────────────┐
│  ML PIPELINE (Python)       │   │  DATABASE (SQLite)       │
│  1. Load & clean            │◄──►  records, features,      │
│  2. Feature engineering     │   │  model_runs, anomaly     │
│  3. Scale + PCA             │   │  scores                  │
│  4. Isolation Forest + LOF  │   └──────────▲───────────────┘
│  5. Combine scores+explain  │              │
└──────────────▲──────────────┘              │
               │                             │
┌──────────────┴─────────────────────────────┴───────────────┐
│  DATA LAYER                                                │
│  data/raw (official, real)  → data/processed (cleaned)     │
│  data/synthetic (demo only, clearly labelled)              │
└────────────────────────────────────────────────────────────┘
```

### Layer responsibilities

| Layer | Responsibility | Must NOT do |
|-------|----------------|-------------|
| Data layer | Store raw files untouched; produce cleaned files | Modify raw files |
| ML pipeline | Turn cleaned data into features and scores | Talk to HTTP or the UI |
| Database | Persist records, scores, run metadata | Contain business logic |
| API | Validate requests, call services, return JSON | Train models inside a request |
| Frontend | Display and filter results | Compute anomaly scores |

## 4. Planned Folder Structure

```
nirikshan-ai/
├── docs/                      # these six documents
├── data/
│   ├── raw/                   # REAL official files, never edited
│   ├── processed/             # cleaned output of our pipeline
│   └── synthetic/             # DEMO data only (see DATA_DICTIONARY.md)
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── config.py          # paths, settings, constants
│   │   ├── api/               # routers (one file per resource)
│   │   ├── schemas/           # Pydantic request/response models
│   │   ├── db/                # SQLite connection, table definitions
│   │   ├── services/          # business logic between API and ML
│   │   └── ml/
│   │       ├── ingestion.py       # load + validate files
│   │       ├── cleaning.py        # missing values, types, duplicates
│   │       ├── features.py        # feature engineering
│   │       ├── models.py          # PCA, IsolationForest, LOF wrappers
│   │       ├── scoring.py         # combine model outputs, explanations
│   │       └── synthetic.py       # synthetic data generator
│   ├── tests/
│   └── requirements.txt
└── frontend/
    ├── app/                   # Next.js App Router pages
    ├── components/            # reusable UI pieces
    ├── lib/api.ts             # typed API client
    └── types/                 # TypeScript types mirroring API schemas
```

## 5. Core Modules

1. **Ingestion**: reads a file, checks that the expected fields exist,
   records the data source and whether it is real or synthetic.
2. **Cleaning**: fixes types, handles missing values, removes duplicates,
   and logs every change it makes.
3. **Feature engineering**: converts raw fields into comparable numeric
   features (ratios, durations, per-unit values).
4. **Anomaly engine**: PCA for dimensionality reduction, then Isolation
   Forest and LOF produce scores that are combined.
5. **Explanation**: for each flagged record, lists which features deviate
   most from the peer median.
6. **API**: exposes datasets, runs, results and summaries.
7. **Dashboard**: summary cards, anomaly table, detail page, data-source banner.

## 6. Data Flow

1. Place a file in `data/raw/` (real) or generate one in `data/synthetic/`.
2. `POST /datasets/ingest` validates and loads it into SQLite.
3. `POST /analysis/runs` triggers cleaning, features, models and scoring.
4. Scores and run metadata are saved to the database.
5. The frontend reads `GET /analysis/runs/{id}/results` and displays them.

## 7. Real vs Synthetic Data Policy

- Every dataset row carries `data_origin` = `real` or `synthetic`.
- The UI shows a persistent banner whenever synthetic data is displayed:
  **"DEMONSTRATION DATA – not real MPLADS records."**
- Synthetic data exists only to build and test the pipeline. No conclusion
  about any real MP, constituency or project may be drawn from it.
- Real data must come from official sources (Section 8 of DATA_DICTIONARY.md).

## 8. Three-Day Scope

| Day | Goal | Deliverable |
|-----|------|-------------|
| 1 | Foundation | Folders, synthetic generator, SQLite schema, ingestion, cleaning, FastAPI skeleton with health endpoint |
| 2 | ML | Features, scaling, PCA, Isolation Forest, LOF, combined score, saved to DB, ML endpoints |
| 3 | Frontend + polish | Next.js dashboard, anomaly table, detail view, synthetic-data banner, README, tests for key functions |

**Out of scope for 3 days**: authentication, deployment, PostgreSQL migration,
real-time data, deep learning, geospatial maps, automated scraping.

## 9. Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Database | SQLite | Zero setup; fine for one user and modest data |
| ORM | Plain `sqlite3` or SQLAlchemy | Pick one on Day 1; SQLAlchemy eases a later PostgreSQL move |
| Models | Unsupervised only | There are no verified "fraud" labels |
| Scoring | Ensemble of two detectors | Each catches different outlier types |
| Training in API | Run as a background task or script | Keeps requests fast |

## 10. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Real data format differs from expectations | Keep a mapping layer (ingestion) so only one file changes |
| Data is incomplete or inconsistent | Cleaning logs plus a data-quality report endpoint |
| Misinterpretation of flags as accusations | Neutral wording, disclaimer on every results page |
| Scope creep | Follow NEXT_TASKS.md order strictly |
| Unlabelled data makes accuracy unmeasurable | Validate using injected synthetic anomalies (ML_METHODOLOGY.md) |

## 11. Future Research Extensions

- Compare more detectors (One-Class SVM, autoencoders) behind the same interface.
- Time-series views of utilisation across years.
- Peer grouping (compare only similar constituencies or project categories).
- Stability analysis of flagged records across random seeds.
- Migration to PostgreSQL; authentication; scheduled data refresh.