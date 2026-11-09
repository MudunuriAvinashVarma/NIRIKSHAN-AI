import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA


# ==========================================
# 1. LOAD DATASET
# ==========================================

df = pd.read_csv(
    "datasets/processed/isolation_forest_results.csv"
)

print("Total records:", len(df))


# ==========================================
# 2. PREPARE FEATURES
# ==========================================

features = [
    "Log Sanction Amount",
    "Sanction Delay (Days)"
]

X = df[features].copy()


# ==========================================
# 3. STANDARDISE FEATURES
# ==========================================

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)


# ==========================================
# 4. APPLY PCA
# ==========================================

pca = PCA(n_components=2)

X_pca = pca.fit_transform(X_scaled)

pca_df = pd.DataFrame(
    X_pca,
    columns=["PC1", "PC2"]
)

pca_df["Isolation Forest Prediction"] = (
    df["Isolation Forest Prediction"].values
)


# ==========================================
# 5. EXPLAINED VARIANCE
# ==========================================

print("\n========== PCA EXPLAINED VARIANCE ==========")

for i, variance in enumerate(
    pca.explained_variance_ratio_,
    start=1
):
    print(
        f"PC{i}: {variance * 100:.2f}%"
    )

print(
    "\nTotal explained variance:",
    round(
        pca.explained_variance_ratio_.sum() * 100,
        2
    ),
    "%"
)


# ==========================================
# 6. PCA COMPONENT LOADINGS
# ==========================================

print("\n========== PCA COMPONENT LOADINGS ==========")

loadings = pd.DataFrame(
    pca.components_.T,
    columns=["PC1", "PC2"],
    index=X.columns
)

print(loadings.to_string())


# ==========================================
# 7. SAVE PCA DATA
# ==========================================

output_path = "datasets/processed/pca_results.csv"

pca_df.to_csv(output_path, index=False)

print("\nPCA results saved to:", output_path)


# ==========================================
# 8. VISUALISE PCA
# ==========================================

plt.figure(figsize=(10, 7))

normal = pca_df[
    pca_df["Isolation Forest Prediction"] == 1
]

anomalies = pca_df[
    pca_df["Isolation Forest Prediction"] == -1
]

plt.scatter(
    normal["PC1"],
    normal["PC2"],
    alpha=0.25,
    s=8,
    label="Normal"
)

plt.scatter(
    anomalies["PC1"],
    anomalies["PC2"],
    alpha=0.6,
    s=12,
    label="Anomaly Candidates"
)

plt.xlabel("Principal Component 1")
plt.ylabel("Principal Component 2")

plt.title(
    "PCA Visualization of MPLADS Sanctioned Works"
)

plt.legend()
plt.tight_layout()

plt.savefig(
    "datasets/processed/pca_visualization.png",
    dpi=300
)

plt.show()

print("\nPCA visualization saved successfully.")