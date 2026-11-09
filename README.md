# NIRIKSHAN AI
### Public Finance Intelligence Platform

**An AI-powered analytical platform for identifying unusual patterns and potential review signals in public infrastructure expenditure data.**

NIRIKSHAN AI applies unsupervised machine learning, statistical analysis, and peer-group comparisons to help analysts identify sanctioned public works that may warrant further examination.

> **Important:** NIRIKSHAN AI is an analytical decision-support system. An anomaly or review signal is not proof of corruption, fraud, financial irregularity, or wrongdoing. All findings require independent verification.

---

## 1. Project Overview

Public infrastructure programmes involve thousands of sanctioned works across different states, constituencies, categories, and financial years.

Manually identifying unusual patterns across such large datasets can be challenging.

NIRIKSHAN AI addresses this challenge by analysing sanctioned-work records and highlighting unusual patterns using machine learning and statistical techniques.

The platform provides an interactive dashboard where users can explore national trends, examine anomaly candidates, compare peer groups, and generate investigation dossiers.

## 2. Key Features

- **National Dashboard:** Overview of sanctioned works, financial amounts, and analytical indicators.
- **AI-Based Anomaly Detection:** Identification of unusual records using unsupervised machine-learning models.
- **Isolation Forest Analysis:** Detection of records with unusual combinations of features.
- **Local Outlier Factor (LOF):** Identification of observations that differ from their local neighbourhood.
- **Peer-Group Analysis:** Comparison across relevant state-year and category-year groups.
- **Delay Analysis:** Identification of unusual sanction delays.
- **Anomaly Explanations:** Supporting signals and contextual information for individual candidates.
- **Investigation Dossiers:** Detailed analytical summaries for further examination.
- **CSV Export:** Export of anomaly candidate data.
- **Authentication:** User registration, login, session management, and protected API access.

## 3. Machine Learning Methodology

The project uses multiple analytical approaches:

| Technique | Purpose |
|---|---|
| Isolation Forest | Detect globally unusual observations |
| Local Outlier Factor | Identify locally unusual observations |
| Peer-Group Analysis | Compare works against relevant groups |
| Delay Analysis | Identify unusual sanction timelines |
| PCA | Support dimensionality reduction and visualisation |

Multiple analytical signals help provide context rather than relying on a single anomaly score.

**Anomaly scores are not fraud probabilities.** They indicate unusual patterns that may deserve further analytical review.

## 4. Dataset Overview

The current analytical dataset contains approximately:

| Metric | Value |
|---|---:|
| Total sanctioned-work records | 39,000 |
| Anomaly review/explanation records | 3,487 |
| Total sanctioned amount | ₹2,030.51 Crore |
| Average sanction delay | 127.27 days |

The review subset is an analytical candidate dataset, not a confirmed irregularity dataset.

The platform analyses sanctioned-work information. Actual expenditure and completion-date information are not available in the current dataset, so fund-utilisation percentages and sanction-to-completion durations cannot be established from it.

## 5. Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- Framer Motion
- Lucide React

### Backend
- Python
- FastAPI
- Pandas
- NumPy
- Scikit-learn
- SQLite
- Argon2 authentication

### Development and Version Control
- Visual Studio Code
- Git
- GitHub

## 6. Project Architecture

```text
NIRIKSHAN-AI/
│
├── backend/
│   ├── auth/
│   ├── main.py
│   └── ...
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── datasets/
│   ├── raw/
│   └── processed/
│
├── docs/
├── tests/
├── requirements.txt
├── requirements-dev.txt
├── .env.example
├── .gitignore
├── START_NIRIKSHAN.bat
└── README.md
```

## 7. Running the Project Locally

### Prerequisites

Install:

- Python 3.10 or later
- Node.js and npm
- Git

### Step 1: Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd NIRIKSHAN-AI
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your GitHub repository URL.

### Step 2: Set up the backend

Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install Python dependencies:

```powershell
pip install -r requirements.txt
```

Create your local environment file:

```powershell
Copy-Item .env.example .env
```

Start FastAPI:

```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001
```

Backend health check:

```text
http://localhost:8001/api/v1/health
```

### Step 3: Set up the frontend

Open another terminal:

```powershell
cd frontend
npm install
```

Create `frontend/.env.local` containing:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

Start Next.js:

```powershell
npm run dev
```

### Step 4: Open the application

Visit:

**http://localhost:3000**

Keep both backend and frontend terminals running while using the application.

Alternatively, on the configured development machine, use `START_NIRIKSHAN.bat` to launch both services.

## 8. Testing

The project has undergone local testing.

- Backend: 88 tests passed, 1 expected failure.
- Frontend: Next.js production build completed successfully.

These results describe the development verification performed for the current project version.

## 9. Security

- Password hashing using Argon2.
- HTTP-only session cookies.
- Protected anomaly API endpoints.
- Environment-based configuration.
- Local environment files excluded from Git.
- Temporary review directories excluded from Git.

Never commit real passwords, API keys, secret tokens, or production environment files.

## 10. Limitations

- Anomaly detection identifies unusual patterns, not proven wrongdoing.
- Model outputs depend on the quality and completeness of the available data.
- Peer-group comparisons depend on the selected grouping criteria.
- Actual expenditure and completion-date data are not available in the current dataset.
- Analytical findings require human investigation and independent verification.

## 11. Future Scope

- Live deployment and cloud hosting.
- Expanded data integration.
- Improved explainability and model monitoring.
- More advanced peer-group comparisons.
- Additional analytical reports.
- Role-based access control and administrative capabilities.

## 12. Disclaimer

NIRIKSHAN AI is an independent analytical and research project intended to support public-finance transparency and data-driven review.

It is not an official government platform and does not make legal, financial, or investigative determinations.

All analytical signals should be independently verified before any conclusions are drawn.

---

**NIRIKSHAN AI — Turning Public Finance Data into Actionable Intelligence.**