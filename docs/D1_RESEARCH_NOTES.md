# D1 Research Notes

Date of research: 7 November 2026

Objective: Identify publicly available official MPLADS data and the formats in which it is provided.

## Website A: Official MPLADS eSAKSHI Portal

Website: https://mplads.mospi.gov.in/

### Page 1: Public Dashboard – Lok Sabha

- Page name: MPLADS Dashboard – Details of 18th Lok Sabha MPs
- Web address: https://mplads.mospi.gov.in/
- Format available: Online table with Excel, CSV and PDF export buttons.
- Visible column headings (exactly as shown):
  1. Sr. No.
  2. State
  3. Hon'ble Members of Parliaments
  4. Constituency
  5. Allocated AMOUNT (₹)
- Parliamentary term: 18th Lok Sabha.
- Obstacles: No login requirement visible in the inspected dashboard screenshot.
- Downloaded data: No. Downloads are reserved for D2.

### Dashboard summary categories

The dashboard displays these categories:

1. Allocated Limit for Hon'ble MPs
2. Amount consented for Calamity
3. Works Recommended
4. Works Sanctioned
5. Works Completed
6. Expenditure on Completed and On-going Works as on Date

### Page 2: Public Dashboard – Rajya Sabha

- Page name: MPLADS Dashboard – Details of Rajya Sabha MPs.
- Web address: https://mplads.mospi.gov.in/
- Format available: Online table with Excel, CSV and PDF export buttons.
- Visible column headings (exactly as shown):
  1. Sr. No.
  2. State
  3. Hon'ble Members of Parliament
  4. Elected/Nominated
  5. Allocated AMOUNT (₹)
- Years or terms covered: Rajya Sabha dashboard; exact historical coverage not confirmed.
- Obstacles: No login requirement visible in the screenshot.
- Downloaded data: No. Downloads are reserved for D2.

### Page 3: eSAKSHI Public Dashboard – Work Information

- Page name: Revamped eSAKSHI Public Dashboard.
- Web address: https://mplads.mospi.gov.in/digigov/dashboard.html
- Format available: Online tables with Excel, CSV and PDF export buttons.
- Information inspected: Works Recommended, Works Sanctioned and Works Completed.

#### Works Recommended

Visible column headings:

1. Sr. No.
2. State
3. Hon'ble Members of Parliaments
4. Constituency
5. Allocated AMOUNT (₹)

Observation: The visible headings resemble the allocation table. Their relationship to individual recommended works requires further verification.

#### Works Sanctioned

Visible column headings across horizontally scrollable table screenshots:

1. Sr. No.
2. Work category
3. WORK
4. State
5. IDA
6. Hon'ble Members of Parliament
7. Constituency
8. Work description
9. Recommended date
10. RECOMMENDED AMOUNT (₹)
11. Sanction Date

Observation: The table contains work descriptions, recommendation dates, recommended amounts and sanction dates. Some columns were outside the visible horizontal area.

#### Works Completed

Visible column headings across horizontally scrollable table screenshots:

1. Sr. No.
2. Work Category
3. Work
4. State
5. IDA
6. Hon'ble Members of Parliament
7. Constituency
8. Image
9. Completion Date
10. Amount Disbursed (₹)

Observation: The table contains work completion dates and disbursed amounts, which may support project-duration and expenditure analysis. Some columns were outside the visible horizontal area.

#### Export availability

- Excel: Visible.
- CSV: Visible.
- PDF: Visible.
- Actual files downloaded: No. Downloads are reserved for D2.

#### Research significance

The sanctioned and completed work tables expose information that may support:

- Recommended-to-sanctioned time analysis.
- Sanction-to-completion time analysis.
- Recommended amount versus amount disbursed analysis, subject to matching records.
- State-wise and constituency-wise comparisons.
- Work-category comparisons.
- Identification of unusual project timelines and expenditure patterns.

These are potential analytical features, not yet validated anomaly indicators.

## Website B: MoSPI MPLADS Dashboard

- Page name: MoSPI MPLADS Dashboard.
- Web address: https://mospi.gov.in/dashboard/dashboard/mplads
- Format available: Dashboard.
- Information visible: The older dashboard URL could not be independently verified during this research.
- As-on date: Not confirmed.
- Download button: Not confirmed.
- Observation: The revamped eSAKSHI dashboard is a more relevant source for current information.

## Website C: Government Open Data Platform

Website: https://data.gov.in/

### Dataset 1: Punjab MPLADS Fund Utilisation

- Title: Utilisation of MPLAD Scheme funds and detail of works – Since inception of scheme.
- Web address: https://punjab.data.gov.in/catalog/utilisation-mplad-scheme-funds-and-detail-works-inception-scheme
- Publishing department: Punjab Planning Department and Department of Economic and Statistical Organization, Punjab.
- Published: 31 December 2024.
- Last updated: 31 December 2024.
- Format: Catalog API and ZIP Download.
- Licence: Government Open Data License – India.
- Exact resource column headings: Not confirmed from the accessible catalogue page.

Indicators described in the dataset:

1. Total funds available.
2. Total sanctioned funds.
3. Total expenditure.
4. Percentage of utilisation of funds.
5. Total works sanctioned.
6. Total works completed.
7. Total pending works.
8. Percentage of completed works.

### Dataset 2: District-wise MPLADS Expenditure in Punjab

- Title: District-wise total actual expenditure in Punjab under MPLAD scheme from 1968 to 2022 (As on Dec.).
- Web address: https://punjab.data.gov.in/resource/district-wise-total-actual-expenditure-punjab-under-mplad-scheme-1968-2022-dec
- Publishing department: Punjab Planning Department / Department of Economic and Statistical Organization, Punjab.
- Format: Resource page; downloadable file format not confirmed.
- Published: 31 December 2024.
- Exact column headings: Not confirmed.
- Years covered: 1968–2022, as stated in the resource title.
- Obstacles: Actual resource file and column structure need verification.

## Important Data Availability Finding

MPLADS moved from physical implementation to the digital eSAKSHI system from 1 April 2023.

Therefore:

- Current eSAKSHI information is available through its public dashboard.
- Historical records may be held by district authorities and older government reporting systems.
- Historical and current data may have different structures and levels of detail.
- The data should not be assumed to form one continuous, consistent dataset.

## Overall Summary

Official MPLADS information is publicly available through the eSAKSHI portal, MoSPI and government open-data platforms. The information includes fund allocation, recommended works, sanctioned works, completed works, expenditure and district-level fund utilisation.

The eSAKSHI dashboard provides Excel, CSV and PDF export options for at least the Lok Sabha allocation table inspected. However, exact work-level dataset columns, Rajya Sabha table structure and historical data availability still require verification.

For NIRIKSHAN AI, the official eSAKSHI data should be investigated as the primary source. Historical state-level open datasets may be supplementary sources. Synthetic data must be clearly labelled if used for demonstrations.


## D1 Completion Status

- [x] Official MPLADS portal inspected.
- [x] Lok Sabha dashboard table inspected.
- [x] Lok Sabha visible column headings recorded.
- [x] Excel, CSV and PDF export options identified.
- [x] MoSPI dashboard source identified.
- [x] Government open-data catalogue investigated.
- [x] Additional Punjab MPLADS resource identified.
- [x] Historical data limitations documented.
- [x] Rajya Sabha table headings independently verified.
- [x] Works Recommended section inspected.
- [x] Works Sanctioned section inspected.
- [x] Works Completed section inspected.
- [x] Visible work-level column headings recorded.
- [x] Exact work-level downloadable column headings verified.
### Verified Works Sanctioned Dataset

The Works Sanctioned export from the official eSAKSHI MPLADS portal was downloaded and inspected.

Verified fields:
- Sr. No.
- Work category
- Work
- State
- IDA
- Hon'ble Members of Parliament
- Constituency
- Work description
- Recommended date
- Sanction Date
- Sanction Amount (₹)
- Work Status

Format: CSV
### D1 Research Completion

All D1 research and verification tasks have been completed. Official MPLADS data sources, dashboard sections, export options, visible column headings and historical data limitations have been documented.

### D2 Dataset Verification Reference

The Works Sanctioned dataset was subsequently downloaded during D2. Its actual CSV column headings were verified.

The raw dataset remains unchanged.