# NIRIKSHAN AI – API Documentation

> Status: **PLANNED**. No endpoint is implemented yet. This is the contract
> the backend and frontend will both follow. All example values below are
> ILLUSTRATIVE PLACEHOLDERS using synthetic IDs, not real data.

## 1. Conventions

- Base URL (local): `http://localhost:8000/api/v1`
- Format: JSON in, JSON out
- FastAPI auto-generates interactive docs at `http://localhost:8000/docs`
- Dates: ISO 8601 strings
- Every response involving data includes `data_origin` (`real` or `synthetic`)
- Errors use this shape:

```json
{ "detail": "Human-readable error message" }
```

| HTTP code | Meaning |
|-----------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad input |
| 404 | Not found |
| 422 | Validation error (automatic from FastAPI) |
| 500 | Server error |

## 2. Endpoints

### 2.1 System

#### `GET /health`
Checks that the server is running.

```json
{ "status": "ok", "version": "0.1.0" }
```

### 2.2 Datasets

#### `GET /datasets`
Lists all loaded datasets.

```json
[
  {
    "id": 1,
    "name": "Synthetic demo set",
    "data_origin": "synthetic",
    "row_count": 300,
    "ingested_at": "2026-11-08T10:00:00"
  }
]
```

#### `POST /datasets/synthetic`
Generates and loads synthetic demonstration data.

Request:
```json
{ "n_rows": 300, "seed": 42, "anomaly_fraction": 0.05 }
```
Response (201):
```json
{ "dataset_id": 1, "data_origin": "synthetic", "row_count": 300 }
```

#### `POST /datasets/ingest`
Loads a real file already placed in `data/raw/`.

Request:
```json
{
  "filename": "<file in data/raw>",
  "name": "<descriptive name>",
  "source_note": "<official URL and download date>",
  "period_covered": "<period>"
}
```
Response (201): same shape as above with `"data_origin": "real"`.
Returns 400 if required internal fields cannot be mapped.

#### `GET /datasets/{dataset_id}/quality`
Returns the data-quality report.

```json
{
  "dataset_id": 1,
  "rows": 300,
  "missing_by_column": { "<column>": 0 },
  "duplicates_removed": 0,
  "cleaning_log": ["<description of each change>"]
}
```

### 2.3 Analysis runs

#### `POST /analysis/runs`
Starts an analysis on a dataset.

Request:
```json
{
  "dataset_id": 1,
  "contamination": 0.05,
  "pca_components": 2,
  "lof_neighbors": 20,
  "random_seed": 42
}
```
Response (201):
```json
{ "run_id": 7, "status": "pending" }
```

#### `GET /analysis/runs`
Lists runs with status and parameters.

#### `GET /analysis/runs/{run_id}`
Returns run metadata.

```json
{
  "id": 7,
  "dataset_id": 1,
  "status": "done",
  "data_origin": "synthetic",
  "params": { "contamination": 0.05, "random_seed": 42 },
  "finished_at": "2026-11-08T10:01:00"
}
```

#### `GET /analysis/runs/{run_id}/results`
Paginated scored records.

Query parameters: `flagged_only` (bool), `sort` (`combined_score`), `limit`,
`offset`.

```json
{
  "run_id": 7,
  "data_origin": "synthetic",
  "total": 300,
  "items": [
    {
      "record_id": 12,
      "entity_id": "SYN-MP-012",
      "period": "SYN-PERIOD-1",
      "iforest_score": 0.91,
      "lof_score": 0.84,
      "combined_score": 0.875,
      "is_flagged": true,
      "explanation": [
        { "feature": "utilisation_ratio", "value": 0.12, "peer_median": 0.80 }
      ]
    }
  ]
}
```

#### `GET /analysis/runs/{run_id}/summary`
Counts for dashboard cards.

```json
{
  "run_id": 7,
  "data_origin": "synthetic",
  "total_records": 300,
  "flagged_records": 15,
  "score_histogram": [{ "bin_start": 0.0, "bin_end": 0.1, "count": 40 }]
}
```

#### `GET /analysis/runs/{run_id}/pca`
2-D points for the scatter plot.

```json
{
  "explained_variance_ratio": [0.45, 0.22],
  "points": [{ "record_id": 12, "x": 1.2, "y": -0.4, "is_flagged": true }]
}
```

#### `GET /records/{record_id}?run_id=7`
Full detail for one record, including cleaned values and explanation.

## 3. Pydantic Schema Names (planned)

`DatasetOut`, `SyntheticRequest`, `IngestRequest`, `QualityReport`,
`RunRequest`, `RunOut`, `ScoredRecord`, `ResultsPage`, `SummaryOut`, `PCAOut`.

## 4. Frontend Usage Notes

- `frontend/lib/api.ts` holds one typed function per endpoint.
- `frontend/types/` mirrors the schemas above.
- Any page showing results must read `data_origin` and render the
  synthetic banner when it equals `synthetic`.

## 5. Change Log

| Date | Change |
|------|--------|
| 2026-11-07 | Initial planned contract |