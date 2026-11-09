import pandas as pd
import numpy as np
from pathlib import Path


# ==========================================
# 1. DEFINE FILE PATHS
# ==========================================

project_root = Path(__file__).resolve().parent.parent

raw_file = (
    project_root
    / "datasets"
    / "raw"
    / "mplads_works_sanctioned_raw.csv"
)

processed_folder = project_root / "datasets" / "processed"

processed_file = (
    processed_folder / "mplads_works_sanctioned_features.csv"
)


# ==========================================
# 2. LOAD ORIGINAL DATASET
# ==========================================

print("\n========== LOADING DATASET ==========")

df = pd.read_csv(raw_file, skiprows=1)

print("Original rows:", len(df))


# ==========================================
# 3. REMOVE SUMMARY ROW
# ==========================================

df = df[
    df["Sr. No."].astype(str).str.strip() != "Grand Total"
].copy()

print("Rows after removing summary row:", len(df))


# ==========================================
# 4. CONVERT DATA TYPES
# ==========================================

print("\n========== DATA TYPE CONVERSION ==========")

df["Recommended date"] = pd.to_datetime(
    df["Recommended date"],
    format="%d-%b-%Y",
    errors="coerce"
)

df["Sanction Date"] = pd.to_datetime(
    df["Sanction Date"],
    format="%d-%b-%Y",
    errors="coerce"
)

df["Sanction Amount ( ₹ )"] = pd.to_numeric(
    df["Sanction Amount ( ₹ )"],
    errors="coerce"
)

print("Date and amount conversion completed.")


# ==========================================
# 5. FEATURE ENGINEERING
# ==========================================

print("\n========== FEATURE ENGINEERING ==========")

# Calculate recommendation-to-sanction delay

df["Sanction Delay (Days)"] = (
    df["Sanction Date"] - df["Recommended date"]
).dt.days


# Apply logarithmic transformation to sanction amount

df["Log Sanction Amount"] = np.log1p(
    df["Sanction Amount ( ₹ )"]
)


# Extract calendar year

df["Sanction Year"] = df["Sanction Date"].dt.year


print("Sanction delay calculated.")
print("Log transformation completed.")
print("Sanction year extracted.")


# ==========================================
# 6. CHECK FEATURE QUALITY
# ==========================================

print("\n========== FEATURE QUALITY CHECK ==========")

features = [
    "Sanction Amount ( ₹ )",
    "Sanction Delay (Days)",
    "Log Sanction Amount"
]

print("\nMissing values:")

print(df[features].isnull().sum())

print(
    "\nNegative sanction delays:",
    (df["Sanction Delay (Days)"] < 0).sum()
)

print(
    "\nInvalid or non-positive sanction amounts:",
    (df["Sanction Amount ( ₹ )"] <= 0).sum()
)


# ==========================================
# 7. DISPLAY PREPARED FEATURES
# ==========================================

print("\n========== PREPARED FEATURE SUMMARY ==========")

print(
    df[
        [
            "Sanction Amount ( ₹ )",
            "Sanction Delay (Days)",
            "Log Sanction Amount"
        ]
    ].describe().round(2)
)


# ==========================================
# 8. SAVE PROCESSED DATASET
# ==========================================

processed_folder.mkdir(parents=True, exist_ok=True)

df.to_csv(processed_file, index=False)

print("\n========== DATASET SAVED ==========")

print("Processed dataset:", processed_file)
print("Total records saved:", len(df))
print("Total columns saved:", len(df.columns))

print("\nFeature preparation completed successfully.")