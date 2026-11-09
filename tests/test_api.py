"""
tests/test_api.py

Automated tests for the anomaly, root and health endpoints in backend/main.py.

/api/v1/anomalies now REQUIRES a valid login session; "/" and "/api/v1/health"
stay public. Fixtures therefore come in two flavours:
  * client / client_missing_dataset              -> signed in through the REAL
    register + login endpoints (no authentication is mocked or bypassed).
  * anonymous_client / anonymous_client_missing_dataset -> no session at all.

How these tests stay safe and repeatable
----------------------------------------
* They never touch your real datasets/processed/anomaly_explanations.csv.
  Each test builds a tiny CSV in pytest's temporary folder and points the
  app at it by replacing the module-level DATA_FILE (monkeypatch undoes the
  change automatically after every test).
* All rows are SYNTHETIC test data with obviously fake names. They only exercise
  the code and say nothing about real MPLADS works.
* The tests describe what main.py does TODAY (e.g. raw CSV column names such
  as "State" and "Review Signals" in the JSON). If you later rename fields to
  the snake_case contract, these tests will fail on purpose and show exactly
  what changed.

Run from the project root:   python -m pytest -v
"""

import pandas as pd
import pytest
from fastapi.testclient import TestClient

from backend import main as api_module  # the module that owns DATA_FILE
from backend.auth import security
from backend.auth.config import AuthSettings, get_auth_settings

TEST_USER = {
    "full_name": "Api Test User",
    "email": "api-tests@example.org",
    "password": "CorrectHorse9Battery",
}
NOT_AUTHENTICATED = {"detail": "Session expired or invalid. Please re-authenticate."}

# Columns mirror the ones main.py reads: "State", "Work Status", "Review Signals".
COLUMNS = [
    "Sr. No.",
    "State",
    "Work Status",
    "Sanction Amount ( ₹ )",
    "Review Signals",
]

# Five synthetic rows. Sr. No. 1..5 lets pagination tests check exact order.
ROWS = [
    [1, "Testland A", "Completed", 500000.0, "['Global Isolation Forest', 'State-Year Delay Comparison']"],
    [2, "Testland A", "In Progress", 250000.0, "['State-Year Delay Comparison']"],
    [3, "Testland B", "Completed", 40000.0, "['Category-Year Delay Comparison']"],
    [4, "Testland B", "Physical Inspection", None, "['Global Isolation Forest']"],  # missing amount
    [5, "Testland C", "Completed", 75000.0, "this is not a python list"],        # malformed signals
]


@pytest.fixture
def csv_path(tmp_path):
    path = tmp_path / "anomaly_explanations.csv"
    pd.DataFrame(ROWS, columns=COLUMNS).to_csv(path, index=False, encoding="utf-8")
    return path


@pytest.fixture(autouse=True)
def isolated_auth_database(tmp_path):
    """Every test gets its own throw-away auth database, so these tests never
    create or touch your real instance/nirikshan.sqlite3."""
    settings = AuthSettings(environment="test", db_path=tmp_path / "auth_for_api_tests.sqlite3")
    api_module.app.dependency_overrides[get_auth_settings] = lambda: settings
    security.login_throttle.clear()
    yield
    api_module.app.dependency_overrides.pop(get_auth_settings, None)


def sign_in(test_client):
    """Register and log in through the real endpoints; the cookie jar keeps the session."""
    assert test_client.post("/api/v1/auth/register", json=TEST_USER).status_code == 201
    login = {"email": TEST_USER["email"], "password": TEST_USER["password"]}
    assert test_client.post("/api/v1/auth/login", json=login).status_code == 200
    return test_client


@pytest.fixture
def anonymous_client(csv_path, monkeypatch):
    # load_anomaly_data() looks up DATA_FILE each time it runs, so replacing
    # the module attribute redirects every request to our temporary CSV.
    monkeypatch.setattr(api_module, "DATA_FILE", csv_path)
    return TestClient(api_module.app)


@pytest.fixture
def client(csv_path, monkeypatch):
    monkeypatch.setattr(api_module, "DATA_FILE", csv_path)
    return sign_in(TestClient(api_module.app))


@pytest.fixture
def anonymous_client_missing_dataset(tmp_path, monkeypatch):
    monkeypatch.setattr(api_module, "DATA_FILE", tmp_path / "no_such_file.csv")
    return TestClient(api_module.app)


@pytest.fixture
def client_missing_dataset(tmp_path, monkeypatch):
    monkeypatch.setattr(api_module, "DATA_FILE", tmp_path / "no_such_file.csv")
    return sign_in(TestClient(api_module.app))


def sr_numbers(response):
    return [row["Sr. No."] for row in response.json()["data"]]


# ------------------------------------------- /api/v1/anomalies requires login
def test_anomalies_rejects_requests_without_a_session(anonymous_client):
    response = anonymous_client.get("/api/v1/anomalies")
    assert response.status_code == 401
    assert response.json() == NOT_AUTHENTICATED
    assert "Testland" not in response.text  # no record data leaks in the error


@pytest.mark.parametrize(
    "params",
    [
        {},
        {"state": "Testland A"},
        {"work_status": "Completed"},
        {"limit": 2, "offset": 1},
        {"state": "Testland B", "work_status": "Completed", "limit": 1},
    ],
)
def test_filters_and_pagination_do_not_bypass_authentication(anonymous_client, params):
    response = anonymous_client.get("/api/v1/anomalies", params=params)
    assert response.status_code == 401
    assert response.json() == NOT_AUTHENTICATED


def test_authentication_is_checked_before_parameter_validation(anonymous_client):
    # An anonymous visitor must not learn anything about parameter rules.
    response = anonymous_client.get("/api/v1/anomalies", params={"limit": 0})
    assert response.status_code == 401
    assert response.json() == NOT_AUTHENTICATED


def test_anonymous_visitors_cannot_trigger_dataset_errors(anonymous_client_missing_dataset, tmp_path):
    # Without a session the server answers 401 BEFORE touching the dataset,
    # so the file path in the 500 message is never reachable anonymously.
    response = anonymous_client_missing_dataset.get("/api/v1/anomalies")
    assert response.status_code == 401
    assert str(tmp_path) not in response.text and "Dataset not found" not in response.text


def test_forged_session_cookie_is_rejected(anonymous_client):
    anonymous_client.cookies.set("access_token", "forged-token-value")
    assert anonymous_client.get("/api/v1/anomalies").status_code == 401


def test_anomalies_work_with_a_valid_session(client):
    response = client.get("/api/v1/anomalies")
    assert response.status_code == 200
    assert response.json()["total_records"] == 5


def test_session_ends_at_logout_for_the_anomalies_endpoint(client):
    stolen = client.cookies.get("access_token")
    assert client.get("/api/v1/anomalies").status_code == 200
    assert client.post("/api/v1/auth/logout").status_code == 200
    assert client.get("/api/v1/anomalies").status_code == 401
    attacker = TestClient(api_module.app)  # a copied cookie must be dead on the server too
    attacker.cookies.set("access_token", stolen)
    assert attacker.get("/api/v1/anomalies").status_code == 401


def test_unauthorised_response_is_readable_by_the_frontend_origin(anonymous_client):
    # The browser only lets the frontend read the 401 if CORS headers are present.
    response = anonymous_client.get("/api/v1/anomalies", headers={"Origin": "http://localhost:3000"})
    assert response.status_code == 401
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert response.headers["access-control-allow-credentials"] == "true"


def test_preflight_for_anomalies_still_succeeds_without_a_session(anonymous_client):
    # Browsers send OPTIONS without cookies; it must not be blocked or the
    # real (credentialed) request would never be sent.
    response = anonymous_client.options(
        "/api/v1/anomalies",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"},
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-credentials"] == "true"


# ------------------------------------------------------------------ GET /
def test_root_returns_welcome_message(anonymous_client):
    response = anonymous_client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "Welcome to NIRIKSHAN AI API",
        "version": "1.0.0",
    }


# ------------------------------------------------------- GET /api/v1/health
def test_health_check_reports_healthy(anonymous_client):
    response = anonymous_client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert body["application"] == "NIRIKSHAN AI"
    assert body["message"] == "Backend is running successfully."


def test_health_does_not_need_the_dataset(anonymous_client_missing_dataset):
    # Health must keep working without a login and even when the data file is missing.
    assert anonymous_client_missing_dataset.get("/api/v1/health").status_code == 200


# ----------------------------------------------------- GET /api/v1/anomalies
def test_anomalies_default_response_structure(client):
    response = client.get("/api/v1/anomalies")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["total_records"] == 5
    assert body["limit"] == 50      # default page size
    assert body["offset"] == 0
    assert len(body["data"]) == 5
    assert "not evidence of financial irregularity or wrongdoing" in body["notice"]


def test_anomalies_review_signals_are_returned_as_a_list(client):
    first = client.get("/api/v1/anomalies").json()["data"][0]
    assert first["Review Signals"] == [
        "Global Isolation Forest",
        "State-Year Delay Comparison",
    ]


def test_malformed_review_signals_become_empty_list(client):
    fifth = client.get("/api/v1/anomalies").json()["data"][4]
    assert fifth["Sr. No."] == 5
    assert fifth["Review Signals"] == []


def test_missing_values_become_json_null(client):
    response = client.get("/api/v1/anomalies")
    fourth = response.json()["data"][3]
    assert fourth["Sanction Amount ( ₹ )"] is None
    assert "NaN" not in response.text  # NaN is not valid JSON


def test_numbers_are_plain_json_numbers(client):
    first = client.get("/api/v1/anomalies").json()["data"][0]
    assert first["Sr. No."] == 1
    assert first["Sanction Amount ( ₹ )"] == 500000.0


# ----------------------------------------------------------- state filtering
def test_state_filter_returns_only_that_state(client):
    response = client.get("/api/v1/anomalies", params={"state": "Testland A"})
    assert response.status_code == 200
    assert response.json()["total_records"] == 2
    assert sr_numbers(response) == [1, 2]
    assert {row["State"] for row in response.json()["data"]} == {"Testland A"}


def test_state_filter_is_case_insensitive(client):
    response = client.get("/api/v1/anomalies", params={"state": "tEsTlAnD b"})
    assert sr_numbers(response) == [3, 4]


def test_state_filter_needs_an_exact_match(client):
    # "Testland" is only part of a name, so nothing matches.
    response = client.get("/api/v1/anomalies", params={"state": "Testland"})
    assert response.status_code == 200
    assert response.json()["total_records"] == 0
    assert response.json()["data"] == []


def test_unknown_state_returns_empty_result_not_error(client):
    response = client.get("/api/v1/anomalies", params={"state": "Atlantis"})
    assert response.status_code == 200
    assert response.json()["total_records"] == 0


# ------------------------------------------------------ work-status filtering
def test_work_status_filter(client):
    response = client.get("/api/v1/anomalies", params={"work_status": "Completed"})
    assert response.status_code == 200
    assert sr_numbers(response) == [1, 3, 5]


def test_work_status_filter_is_case_insensitive(client):
    response = client.get("/api/v1/anomalies", params={"work_status": "physical inspection"})
    assert sr_numbers(response) == [4]


def test_state_and_work_status_filters_combine(client):
    response = client.get(
        "/api/v1/anomalies",
        params={"state": "Testland B", "work_status": "Completed"},
    )
    assert sr_numbers(response) == [3]


# ---------------------------------------------------------------- pagination
def test_pagination_limit_and_offset(client):
    first = client.get("/api/v1/anomalies", params={"limit": 2, "offset": 0}).json()
    second = client.get("/api/v1/anomalies", params={"limit": 2, "offset": 2}).json()
    third = client.get("/api/v1/anomalies", params={"limit": 2, "offset": 4}).json()

    # Trace: records 1..5 -> [1,2] [3,4] [5]
    assert [r["Sr. No."] for r in first["data"]] == [1, 2]
    assert [r["Sr. No."] for r in second["data"]] == [3, 4]
    assert [r["Sr. No."] for r in third["data"]] == [5]
    # total_records counts ALL matches, not just the current page.
    assert first["total_records"] == second["total_records"] == third["total_records"] == 5
    assert (first["limit"], first["offset"]) == (2, 0)


def test_pagination_applies_after_filtering(client):
    response = client.get(
        "/api/v1/anomalies",
        params={"work_status": "Completed", "limit": 2, "offset": 1},
    )
    assert response.json()["total_records"] == 3   # 1, 3, 5
    assert sr_numbers(response) == [3, 5]


def test_offset_beyond_the_end_returns_empty_page(client):
    response = client.get("/api/v1/anomalies", params={"offset": 100})
    assert response.status_code == 200
    assert response.json()["data"] == []
    assert response.json()["total_records"] == 5


def test_maximum_allowed_limit_is_accepted(client):
    assert client.get("/api/v1/anomalies", params={"limit": 500}).status_code == 200


# ---------------------------------------------------- invalid pagination input
@pytest.mark.parametrize(
    "params",
    [
        {"limit": 0},        # below minimum (1)
        {"limit": -5},
        {"limit": 501},      # above maximum (500)
        {"limit": "abc"},    # not a number
        {"offset": -1},      # below minimum (0)
        {"offset": "xyz"},
    ],
)
def test_invalid_pagination_parameters_return_422(client, params):
    response = client.get("/api/v1/anomalies", params=params)
    assert response.status_code == 422
    assert "detail" in response.json()


# ------------------------------------------------------ missing dataset
def test_missing_dataset_returns_500_with_a_message(client_missing_dataset):
    response = client_missing_dataset.get("/api/v1/anomalies")
    assert response.status_code == 500
    assert "Dataset not found" in response.json()["detail"]


def test_root_still_works_when_dataset_is_missing(anonymous_client_missing_dataset):
    assert anonymous_client_missing_dataset.get("/").status_code == 200


@pytest.mark.xfail(
    strict=True,
    reason="KNOWN ISSUE: the error detail currently includes the full file path.",
)
def test_missing_dataset_error_does_not_leak_file_path(client_missing_dataset, tmp_path):
    detail = client_missing_dataset.get("/api/v1/anomalies").json()["detail"]
    assert str(tmp_path) not in detail