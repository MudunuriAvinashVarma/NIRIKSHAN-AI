from contextlib import asynccontextmanager
from pathlib import Path
import ast

import pandas as pd
from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.exception_handlers import request_validation_exception_handler
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from backend.auth.config import get_auth_settings
from backend.auth.database import ensure_db
from backend.auth.router import get_current_user, router as auth_router, validation_error_response

AUTH_SETTINGS = get_auth_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create the SQLite file and tables on first start (safe to repeat).
    ensure_db(AUTH_SETTINGS.db_path)
    yield


app = FastAPI(
    title="NIRIKSHAN AI API",
    description=(
        "Public Finance Intelligence Platform "
        "for MPLADS sanctioned-work pattern analysis."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS: the browser app (http://localhost:3000) may call this API and send
# cookies. allow_credentials=True requires an explicit origin list (no "*").
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(AUTH_SETTINGS.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    # Auth routes get readable messages that never echo the submitted password;
    # every other route keeps FastAPI's default 422 behaviour.
    if request.url.path.startswith("/api/v1/auth"):
        return validation_error_response(exc)
    return await request_validation_exception_handler(request, exc)


app.include_router(auth_router)

# Locate the anomaly explanations dataset
BASE_DIR = Path(__file__).resolve().parent.parent

DATA_FILE = (
    BASE_DIR
    / "datasets"
    / "processed"
    / "anomaly_explanations.csv"
)


def load_anomaly_data():
    """Load and prepare anomaly explanation records."""

    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_FILE}"
        )

    df = pd.read_csv(DATA_FILE)

    # Convert missing values to None
    df = df.astype(object).where(pd.notna(df), None)

    records = df.to_dict(orient="records")

    prepared_records = []

    for record in records:

        # Convert Review Signals from Python-list text to a list
        signals = record.get("Review Signals")

        if isinstance(signals, str):
            try:
                signals = ast.literal_eval(signals)
            except (ValueError, SyntaxError):
                signals = []

        if not isinstance(signals, list):
            signals = []

        record["Review Signals"] = signals

        # Convert NumPy values into standard Python values
        for key, value in record.items():
            if hasattr(value, "item"):
                record[key] = value.item()

        prepared_records.append(record)

    return prepared_records


@app.get("/")
def root():
    return {
        "status": "success",
        "message": "Welcome to NIRIKSHAN AI API",
        "version": "1.0.0"
    }


@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "application": "NIRIKSHAN AI",
        "message": "Backend is running successfully."
    }


# Protected: a valid session cookie is required. The dependency runs BEFORE the
# query parameters are validated and before the dataset is read, so a visitor
# without a session always gets 401 and learns nothing else about the API.
@app.get("/api/v1/anomalies", dependencies=[Depends(get_current_user)])
def get_anomalies(
    state: str | None = Query(default=None),
    work_status: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0)
):
    """
    Retrieve anomaly candidates and their review explanations.
    """

    try:
        records = load_anomaly_data()

        # Optional state filter
        if state:
            records = [
                record for record in records
                if str(record.get("State", "")).lower()
                == state.lower()
            ]

        # Optional work-status filter
        if work_status:
            records = [
                record for record in records
                if str(record.get("Work Status", "")).lower()
                == work_status.lower()
            ]

        total_records = len(records)

        # Pagination
        paginated_records = records[offset:offset + limit]

        return {
            "status": "success",
            "total_records": total_records,
            "limit": limit,
            "offset": offset,
            "data": paginated_records,
            "notice": (
                "These records are statistical anomaly candidates "
                "and analytical review signals, not evidence of "
                "financial irregularity or wrongdoing."
            )
        }

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to retrieve anomaly records: {str(error)}"
        )