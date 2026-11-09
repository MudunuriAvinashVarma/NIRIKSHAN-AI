import pandas as pd
import numpy as np


# ==========================================
# 1. LOAD ISOLATION FOREST RESULTS
# ==========================================

df = pd.read_csv(
    "datasets/processed/isolation_forest_results.csv"
)

print("Total records:", len(df))


# ==========================================
# 2. EXTRACT RECOMMENDATION AND SANCTION YEAR
# ==========================================

df["Recommended date"] = pd.to_datetime(
    df["Recommended date"],
    errors="coerce"
)

df["Sanction Date"] = pd.to_datetime(
    df["Sanction Date"],
    errors="coerce"
)

df["Recommended Year"] = (
    df["Recommended date"].dt.year
)

df["Sanction Year"] = (
    df["Sanction Date"].dt.year
)

df["Flagged"] = (
    df["Isolation Forest Prediction"] == -1
)


# ==========================================
# 3. RECOMMENDATION YEAR ANALYSIS
# ==========================================

print("\n========== RECOMMENDATION YEAR ANALYSIS ==========")

recommendation_summary = (
    df.groupby("Recommended Year")
    .agg(
        Total=("Flagged", "size"),
        Flagged=("Flagged", "sum"),
        Median_Delay=("Sanction Delay (Days)", "median")
    )
)

recommendation_summary["Flag_Rate_Percent"] = (
    recommendation_summary["Flagged"]
    / recommendation_summary["Total"] * 100
)

print(recommendation_summary.round(2).to_string())


# ==========================================
# 4. SANCTION YEAR ANALYSIS
# ==========================================

print("\n========== SANCTION YEAR ANALYSIS ==========")

sanction_summary = (
    df.groupby("Sanction Year")
    .agg(
        Total=("Flagged", "size"),
        Flagged=("Flagged", "sum"),
        Median_Delay=("Sanction Delay (Days)", "median")
    )
)

sanction_summary["Flag_Rate_Percent"] = (
    sanction_summary["Flagged"]
    / sanction_summary["Total"] * 100
)

print(sanction_summary.round(2).to_string())


# ==========================================
# 5. RECOMMENDATION YEAR VS SANCTION YEAR
# ==========================================

print("\n========== COHORT CROSS ANALYSIS ==========")

cohort = (
    df.groupby(
        ["Recommended Year", "Sanction Year"]
    )
    .agg(
        Total=("Flagged", "size"),
        Flagged=("Flagged", "sum"),
        Median_Delay=("Sanction Delay (Days)", "median")
    )
)

cohort["Flag_Rate_Percent"] = (
    cohort["Flagged"] / cohort["Total"] * 100
)

print(cohort.round(2).to_string())


# ==========================================
# 6. SAVE COHORT RESULTS
# ==========================================

output_path = (
    "datasets/processed/cohort_analysis.csv"
)

cohort.to_csv(output_path)

print("\nCohort analysis saved to:", output_path)


# ==========================================
# 7. COMPARE FLAGGED AND NORMAL DELAYS
# ==========================================

print("\n========== DELAY PROFILE BY PREDICTION ==========")

delay_profile = (
    df.groupby("Flagged")["Sanction Delay (Days)"]
    .agg(["count", "mean", "median", "min", "max"])
)

print(delay_profile.round(2).to_string())