import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

files = [
    "isolation_forest_results.csv",
    "cohort_aware_delay_analysis.csv",
    "peer_group_anomaly_analysis.csv"
]

for filename in files:

    path = BASE_DIR / "datasets" / "processed" / filename

    print("\n" + "=" * 60)
    print(filename)
    print("=" * 60)

    if not path.exists():
        print("FILE NOT FOUND")
        continue

    df = pd.read_csv(path)

    print("Rows:", len(df))
    print("\nColumns:")

    for column in df.columns:
        print("-", column)

    print("\nFirst two records:")
    print(df.head(2).to_string(index=False))