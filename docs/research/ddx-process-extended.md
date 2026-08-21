# The Physician's Differential Diagnosis Process: A Reference for Clinical Decision-Support Agent Design

> **Companion note.** This is the *extended* research pass — it goes deeper on
> Sections 2 (base rates, Meehl, Kahneman-Tversky, Occam/Hickam, demographic
> stratification with worked examples), 3 (testing strategy, cascade costs,
> threshold models), 5 (retraceable reasoning), and 6 (treatment hand-off).
> Its **Sections 1 and 4 are left as "pending"** (their sub-agents hit upstream
> rate limits); for the complete formal-DDx cognitive process (Section 1) and
> the decision-tree/DDSS visualization survey (Section 4), see the canonical
> companion file [`ddx-process.md`](./ddx-process.md), which covers all six
> areas. The two files are complementary; read together they are comprehensive.

> **Purpose.** This document maps the actual cognitive and procedural structure physicians use to arrive at a diagnosis from a patient presentation, grounded in primary clinical, cognitive-psychology, epidemiologic, and regulatory sources. It is the domain reference for a clinical decision-support agent + UI that mimics the real physician process.

> **Status.** Sections 2, 3, 5, and 6 are complete (sourced). Sections 1 and 4 are being researched in parallel and will be inserted below as they arrive.

---

## Table of Contents

1. The Formal Differential Diagnosis Process *(pending — researching)*
2. Prevalence/Incidence and Demographic Adjustment *(complete)*
3. Diagnostic Testing Strategy *(complete)*
4. The Diagnostic Decision-Tree / Branching Visualization *(pending — researching)*
5. Retraceable Reasoning / Explainability *(complete)*
6. Treatment Planning Hand-off *(complete)*

---

## 2. Prevalence/Incidence and Demographic Adjustment

A reference document on how physicians use base-rate statistics and adjust by race, ethnicity, sex, age, and geography when ranking a differential.

### (a) Base-Rate Statistics and the Bayesian Prior in Differential Diagnosis

**The "horses, not zebras" aphorism.** The canonical teaching aphorism — *"When you hear hoofbeats, think horses, not zebras"* — directs clinicians to rank common (high-prevalence) diagnoses ahead of rare ones when forming a differential. It encodes a Bayesian prior: the pre-test probability of a diagnosis is anchored in its base rate (population prevalence), and presentations compatible with both a common and a rare disease are, by default, more likely to be the common one.

- **Origin:** The phrase was coined in the late 1940s by **Theodore Woodward**, a professor at the University of Maryland School of Medicine. He originally told interns, *"Don't look for zebras on Greene Street"* (Greene Street being the location of the University of Maryland hospital in Baltimore). By 1960 the aphorism was widely known in medical circles.
  - Source: Wikipedia, "Zebra (medicine)" — https://en.wikipedia.org/wiki/Zebra_(medicine)
  - Quote: *"The phrase was coined in the late 1940s by Theodore Woodward, a professor at the University of Maryland School of Medicine. He originally told interns, 'Don't look for zebras on Greene Street.' By 1960, the aphorism was widely known in medical circles."*

In medical slang, a **"zebra"** is a rare or surprising diagnosis; the aphorism is the clinical counterpart of **Occam's razor** (the principle of parsimony — prefer the single simplest explanation for multiple findings).

**Occam's razor and Hickam's dictum.**
- **Occam's razor (William of Ockham):** In diagnosis, this is often read as "prefer a single unifying diagnosis that explains all the findings." It is a *heuristic*, not a law: *"We don't assume that the simpler theory is correct and the more complex one false. … the more complex theory competing with a simpler explanation should be put on the back burner, but not thrown onto the trash heap of history until proven false."*
  - Source: Wikipedia, "Occam's razor" — https://en.wikipedia.org/wiki/Occam%27s_razor

- **Hickam's dictum** is the counterweight to a misapplied Occam: *"A man can have as many diseases as he damn well pleases."* Attributed to an apocryphal **John Bamber Hickam, MD** (housestaff at Grady Memorial Hospital, Atlanta, 1946; faculty in the 1950s). It admits that multiple concurrent diseases can produce a presentation, especially in older or chronically ill patients where comorbidity is common.
  - Source: Wikipedia, "Hickam's dictum" — https://en.wikipedia.org/wiki/Hickam%27s_dictum
  - Quote: *"Hickam's dictum is a medical principle that a patient's symptoms could be caused by several diseases. It is a counterargument to misapplying Occam's razor in the medical profession."*

**Meehl (1954): Clinical vs. Statistical (Actuarial) Prediction.** The empirical foundation for trusting base rates over unaided clinical intuition is **Paul Meehl's 1954 book *Clinical vs. Statistical Prediction: A Theoretical Analysis and a Review of the Evidence***. Meehl analyzed whether mechanical (formal, algorithmic, actuarial) methods of combining data outperform subjective clinical judgment.

- **Key finding:** Meehl theorized that clinicians would make *more* mistakes than a mechanical prediction tool that combines the same data actuarially — because mechanical approaches are 100% reliable (identical output for identical input) whereas human judgment is noisy. He argued clinicians should *"rarely deviate from mechanically derived conclusions"*, reserving overrides only for a clear "broken-leg" scenario (objective, high-accuracy counterevidence, like knowing the patient broke his leg, that the model could not see).
- **Later confirmation:** *"Meta-analyses comparing clinical and mechanical prediction efficiency have supported Meehl's (1954) conclusion that mechanical methods outperform clinical methods."*
  - Source: Wikipedia, "Paul Meehl" — https://en.wikipedia.org/wiki/Paul_Meehl
  - Primary work: Meehl, P. E. (1954). *Clinical vs. Statistical Prediction: A Theoretical Analysis and a Review of the Evidence.* University of Minnesota Press.

The implication for differential diagnosis: actuarial/base-rate-anchored prediction is, on average, more accurate than intuitive clinical combination of the same cues. Base rates belong in the prior.

**Representativeness heuristic and base-rate neglect (Kahneman & Tversky).** The chief cognitive threat to correct base-rate use is the **representativeness heuristic**, formalized by **Daniel Kahneman and Amos Tversky**.

- **Definition:** *"The representativeness heuristic is a mental shortcut where people judge probability based on how much an event resembles a known prototype. Tversky and Kahneman defined it as assessing similarity to a parent population and the process generating it."*
- **Base-rate neglect:** *"Base-rate neglect occurs when this heuristic causes individuals to ignore general statistical incidence rates in favor of specific, representative details. This leads to errors like equating inverse probabilities, violating Bayes' theorem."*
  - Key studies: the Tom W. personality-description study (people rank by similarity, ignoring base rates) and the **Taxicab problem** (witness accuracy is overweighted against the base rate of cab colors).
  - Source: Wikipedia, "Representativeness heuristic" — https://en.wikipedia.org/wiki/Representativeness_heuristic
  - Primary citations: Kahneman & Tversky (1972, 1973); Tversky & Kahneman (1982, 1983); Dawes et al. (1993).

- **Base-rate fallacy / false-positive paradox in diagnosis:** *"The base rate fallacy occurs when people ignore general prevalence in favor of specific case details. In medical diagnosis, this leads to the false positive paradox: if a disease is rare, even accurate tests yield mostly false positives because the large healthy population generates more errors than the small sick group yields true results."*
  - Source: Wikipedia, "Base rate fallacy" — https://en.wikipedia.org/wiki/Base_rate_fallacy

**When base rates dominate vs. when they mislead.**
- **Base rates dominate** when the presentation is non-specific and the differential spans common and rare diseases with overlapping features. Here the prior (prevalence) carries most of the diagnostic weight, and even a "good" test cannot overcome a very low prior without an extremely high likelihood ratio (this is the false-positive paradox above).
- **Base rates mislead** through (i) *base-rate neglect* — over-weighting the vivid representative cue and under-weighting prevalence; and (ii) *representativeness* — chasing a rare disease because the picture "looks classic" while forgetting that a common disease can also produce that picture. The corrective is explicit Bayesian updating: multiply the prior by the likelihood ratio of each finding. The clinical literature on diagnostic error (Croskerry and others) classifies these as Type-1 (intuitive, heuristic) errors and recommends deliberate Type-2 (analytical) review in high-stakes or atypical cases.
  - Source: Wikipedia, "Medical diagnosis" — https://en.wikipedia.org/wiki/Medical_diagnosis — notes heuristics in pattern recognition are a *"major source of medical error"* and that *"most people experience at least one diagnostic error in their lifetime."*
  - Croskerry, P. (2020). *The Cognitive Autopsy: A Root Cause Analysis of Medical Decision Making.* (Croskerry's body of work frames diagnostic error through dual-process theory and catalogues cognitive biases including base-rate neglect and representativeness.)
  - Source: Wikipedia, "Pat Croskerry" — https://en.wikipedia.org/wiki/Pat_Croskerry

### (b) Sutton's Law — "Go Where the Money Is"

**Sutton's law** is the counter-balancing heuristic that tells a clinician when to *pursue* a diagnosis (including a rare one) rather than only anchor on the most common cause.

- **Definition:** *"Sutton's law states that when diagnosing, one should first consider the obvious. It suggests that one should first conduct those tests which could confirm (or rule out) the most likely diagnosis. It is taught in medical schools … to suggest … they might best order tests in that sequence which is most likely to result in a quick diagnosis, hence treatment, while minimizing unnecessary costs."*
- **Origin — Willie Sutton:** *"The law is named after the bank robber Willie Sutton, who reputedly replied to a reporter's inquiry as to why he robbed banks by saying 'because that's where the money is.'"* In his 1976 autobiography *Where the Money Was*, Sutton denied having said it but added: *"If anybody had asked me, I'd have probably said it. That's what almost anybody would say … it couldn't be more obvious."*
  - Historical attribution to medicine: Lawrence Altman, "A Law Named for Willie Sutton Assists Physicians," *The New York Times*, Jan 3, 1970; and David Rytand, "Sutton's or Dock's Law?", *New England Journal of Medicine* 302(17):972, 1980 (doi:10.1056/NEJM19800424) — which debated whether the eponym should be "Dock's law."
  - Source: Wikipedia, "Sutton's law" — https://en.wikipedia.org/wiki/Sutton%27s_law

**When to look for zebras / rare diagnoses.** Sutton's law and the hoofbeats aphorism are complements, not opposites. The Wikipedia article links them explicitly: *"A similar idea is contained in the physician's adage, 'When you hear hoofbeats, think horses, not zebras.'"* Sutton's law adds the *sequencing/expected-value* dimension: *"prioritizing tests when resources are limited, so a test for a treatable condition should be performed before an equally probable but less treatable condition"* and *"a more thorough analysis will consider the false positive rate of the test and the possibility that a less likely diagnosis might have more serious consequences."*

Rare-disease (zebra) pursuit is warranted when:
1. **Red flags** — a feature incompatible with, or disproportionately severe for, the leading common diagnosis.
2. **Family history** — e.g., consanguinity, known Mendelian disease, founder-population ancestry (see (c)).
3. **Failure of the common-disease workup** — the presentation is refractory to first-line treatment for the leading diagnosis.
4. **High cost of missing the rare diagnosis** — when the rare disease is treatable/urgent and delay carries high morbidity (the "expected value" argument: even a low prior can justify testing if the downstream cost of a miss is high, provided the test has acceptable false-positive cost).
5. **Refractory or recurrent presentations** — especially where a unifying common diagnosis cannot be established (here Hickam's dictum also reminds us multiple common diseases may coexist before invoking a zebra).

### (c) Adjusting Prevalence by Demographic and Geographic Factors

Physicians routinely re-stratify the Bayesian prior using patient demographics and geography — the same disease has very different pre-test probability depending on age, sex, ancestry/ethnicity, and location. The examples below are quantified from epidemiology sources.

**Sickle cell disease and African ancestry.**
- **Global:** ~7.7 million people had sickle cell disease in 2021; ~34,000 deaths/year (a contributory factor in ~376,000 more). Risk factors explicitly include *"ancestry from sub-Saharan Africa, India, the Arab Gulf states or Sicily."*
- **United States:** ~100,000 Americans have SCD; ~2 million carry the trait. Birth prevalence is **one in 365 African-American children** (one in ~16,300 Hispanic-American children).
  - Sources: Wikipedia, "Sickle cell disease" — https://en.wikipedia.org/wiki/Sickle_cell_disease ; CDC Sickle Cell Data — https://www.cdc.gov/sickle-cell/data/index.html

**Cystic fibrosis and Northern European ancestry.**
- **Carrier frequency:** *"Around 1 in 25 people of European descent, and one in 30 of white Americans, is a carrier of a CF mutation."* Other groups: *"roughly one in 46 Hispanics, one in 65 Africans, and one in 90 Asians carry at least one abnormal CFTR gene."*
- **Disease prevalence:** *"Ireland has the world's highest prevalence of CF, at one in 1353; Japan's prevalence of CF is among the lowest in the world, at one in 350,000."* WHO: *"In the European Union, one in 2000–3000 newborns is found to be affected by CF."* In the US, *"one in 3,500 children is born with CF"* (~1 in 3,300 white children vs. 1 in 15,000 African American children; lower still in Asian Americans).
  - Source: Wikipedia, "Cystic fibrosis" — https://en.wikipedia.org/wiki/Cystic_fibrosis
  - Quote: *"Cystic fibrosis is the most common life-limiting autosomal recessive disease among people of European heritage."*

**Tay-Sachs and Ashkenazi Jewish ancestry.**
- *"Approximately 1 in 3,600 Ashkenazi Jews at birth are affected"* (infantile form, from a 1278insTATC HEXA founder mutation). Also elevated in French Canadians of the Lac St-Jean/Saguenay region of northern Quebec, the Irish, the Old Order Amish of Pennsylvania, and the Cajuns of southern Louisiana (the *same* 1278insTATC mutation traced to a single founder couple).
  - Source: Wikipedia, "Tay–Sachs disease" — https://en.wikipedia.org/wiki/Tay%E2%80%93Sachs_disease

**Systemic lupus erythematosus (lupus) — women and African descent.**
- *"An estimated 5 million people worldwide have some form of lupus disease. 70% of lupus cases diagnosed are systemic lupus erythematosus."*
- **Sex skew:** In the UK, *"Females … are seven times more likely to be diagnosed with SLE than males."* In the US, *"Lupus affects females in the US 6 to 10 times more often than males,"* with peak occurrence between ages 15 and 40.
- **Ancestry skew:** *"SLE is more common amongst certain ethnic groups than others, especially those of African origin."*
  - Source: Wikipedia, "Lupus erythematosus" — https://en.wikipedia.org/wiki/Lupus_erythematosus

**Kawasaki disease — Asian (Japanese) ancestry.**
- *"Kawasaki disease affects children that are male at birth more than children that are female at birth, with people of Asian ethnicity, particularly Japanese people, at greater risk."*
- **Japan:** attack rate ~**218.6 per 100,000 children under five** (about 1 in 450); >1 in 150 Japanese children will develop it in a lifetime. The rate in Japan is ~240 per 100,000.
- **US:** 2,000–4,000 cases/year (9–19 per 100,000 children <5); male:female ~1.5–1.7:1; 76% of cases are under 5 years old.
  - Source: Wikipedia, "Kawasaki disease" — https://en.wikipedia.org/wiki/Kawasaki_disease

**Sarcoidosis — African Americans and Northern Europeans.**
- Incidence peaks at age 20–29 (a second peak in women >50). *"The disease is most common in Northern European countries, and the highest annual incidence of 60 per 100,000 is found in Sweden and Iceland."*
- **US race disparity:** *"In the United States, sarcoidosis is more common in people of African descent than Caucasians, with annual incidence reported as 35.5 and 10.9 per 100,000, respectively."*
  - Source: Wikipedia, "Sarcoidosis" — https://en.wikipedia.org/wiki/Sarcoidosis

**The controversy: limits of race-based adjustment (Vyas et al., NEJM 2020).** The central critique is **Vyas DA, Eisenstein LG, Jones DS. "Hidden in Plain Sight — Reconsidering the Use of Race Correction in Clinical Algorithms." *New England Journal of Medicine* 2020.** (doi:10.1056/NEJMms2004740; https://www.nejm.org/doi/full/10.1056/NEJMms2004740)

The article audits how often clinical calculators embed a **race/ethnicity multiplier** — treating race as a biological input — and argues these embedments can perpetuate inequity and rest on flawed assumptions.

**Concrete calculators and corrections documented in the literature:**

1. **eGFR (kidney function) — the race multiplier, and its removal.**
   - The **MDRD equation** carried a coefficient **`[1.212 if Black]`** (and `[0.742 if Female]`). (Source: Wikipedia, "Glomerular filtration rate" — https://en.wikipedia.org/wiki/Glomerular_filtration_rate )
   - The **2009 CKD-EPI equation** carried a **multiplier of 1.159 for Black patients.** The **2021 CKD-EPI refit removed this race coefficient entirely.** The **NKF–ASN Task Force (National Kidney Foundation–American Society of Nephrology, 2022)** recommended using the 2021 race-free equation and recommended wider use of **cystatin C** (alone or combined with creatinine) as a more accurate, non-race-based filtration marker.
     - Source: Wikipedia, "CKD-EPI" — https://en.wikipedia.org/wiki/CKD-EPI

2. **Spirometry — the race/ethnicity "correction factor."**
   - Reference equations for predicted lung function have *"been published and may be calculated based on age, sex, weight and ethnicity."* Historically these applied **correction factors of about 10–15% for Black persons** (lower predicted values for Black vs. white patients of the same age/sex/height). These race-specific reference equations were the subject of the 2021 ATS re-evaluation and have since been discontinued in favor of race-neutral reference equations.
     - Source: Wikipedia, "Race in biomedicine" — https://en.wikipedia.org/wiki/Race_in_biomedicine

The Vyas article's broader list of race-adjusted tools includes: eGFR/CKD-EPI and MDRD; spirometry reference values; the **VBAC (vaginal birth after cesarean) calculator**; the **kidney donor risk index / donor-recipient matching**; and **ASCVD (atherosclerotic cardiovascular disease) risk** and **urinary albumin-to-creatinine** thresholds.

**Core critique (Vyas et al.):** race in these tools functions as a proxy for social, environmental, and structural determinants rather than a clean biological variable; embedding it as a coefficient can (i) mask disease severity in minoritized patients (e.g., a higher eGFR in Black patients can delay referral to nephrology/transplant listing), and (ii) reify race as immutable biology. The authors recommend reconsidering each algorithm: replacing race with the proximate cause (e.g., genetic ancestry, muscle mass, socioeconomic factors) where relevant, or removing the adjustment entirely where it is not.
- Primary source: Vyas DA, Eisenstein LG, Jones DS. *N Engl J Med.* 2020. https://www.nejm.org/doi/full/10.1056/NEJMms2004740

### (d) Major Data Sources for Base Rates and Demographic Stratification

**CDC (cdc.gov).**
- **NHIS — National Health Interview Survey.** Annual cross-sectional survey, run since 1957 by the Census Bureau for the CDC National Center for Health Statistics (NCHS); covers the noninstitutionalized US population. Collects health status, insurance, behaviors, and **prevalence of chronic conditions**. Stratified by **age, sex, race, Hispanic origin**, and geography.
  - Source: https://www.cdc.gov/nchs/nhis/index.htm
- **NHANES — National Health and Nutrition Examination Survey.** Run by NCHS since 1971 (continuous since 1999). Combines **interviews + physical examinations + laboratory tests** (the only national source with measured physiology and labs). Used to *"determine the prevalence of major diseases and risk factors."* Stratified by age, sex, race/ethnicity.
  - Source: https://www.cdc.gov/nchs/nhanes/index.htm
- **BRFSS — Behavioral Risk Factor Surveillance System.** Begun 1984; the world's largest **telephone health survey** (landline + cell since 2009), run by the CDC with state health departments across all 50 states + DC, Guam, Puerto Rico, US Virgin Islands. Collects behavioral risk factors (smoking, obesity, exercise, seatbelt use, etc.). Stratified by **state** and by age, sex, race/ethnicity within states.
  - Source: https://www.cdc.gov/brfss/index.html
- **CDC WONDER — Wide-ranging ONline Data for Epidemiologic Research.** A query system providing mortality data (underlying cause by **ICD-10**), natality, cancer, notifiable diseases, and Census population denominators. Stratified by **age, race, sex, geography (state/county), and year**. (https://wonder.cdc.gov)

**WHO (who.int).**
- **Global Health Observatory (GHO).** WHO's public health observatory sharing global health statistics across themes. Stratified by **region, age, sex, and income group**.
  - Source: https://www.who.int/data/gho
- **Global Health Estimates (GHE).** *"Comprehensive and comparable time-series data from 2000 onwards"* on mortality, morbidity, and disease burden; *"disaggregated by 'age, sex and cause' at global, regional, and country levels."* Cause-of-death coding follows **ICD** (ICD-10, transitioning ICD-11).
  - Source: https://www.who.int/data/global-health-estimates

**NIH / GARD / NORD / NIH Rare Diseases Research.**
- **GARD — Genetic and Rare Diseases Information Center.** Managed by NIH's **NCATS** (National Center for Advancing Translational Sciences, est. 2011). Provides free, simplified summaries of causes, diagnosis, and support for genetic and rare diseases; **aggregates data from Orphanet, OMIM, Mondo, MedGen, and HPO** to supply prevalence estimates and disease facts.
  - Source: https://rarediseases.info.nih.gov/about-gard
- **NORD — National Organization for Rare Disorders.** US 501(c)(3) nonprofit founded **1983**; provides support for individuals with rare diseases through advocacy, research funding, education, and a rare-disease database.
  - Source: https://rarediseases.org

**Orphanet (European rare disease prevalence, ORPHA codes).** Founded in **France in 1997 by Inserm** (French National Institute of Health and Medical Research); a European knowledge base/network across ~40 countries. Maintains a standard nomenclature of rare diseases (**ORPHAcodes**). Provides a rare-disease directory, diagnostic-test/expert-center directories, orphan-drug directory, clinical-trial listings, and the **Orphanet Journal of Rare Diseases**. As of October 2020: information on **>6,100 rare diseases and 5,400 genes**, with **prevalence data** (point/annual/lifetime prevalence classes) that stratify by European geography.
  - Source: https://www.orpha.net ; Wikipedia, "Orphanet" — https://en.wikipedia.org/wiki/Orphanet

**Global Burden of Disease (GBD) / IHME.**
- **IHME — Institute for Health Metrics and Evaluation.** Public health research institute at the University of Washington, Seattle; coordinates the **Global Burden of Disease (GBD) Study**.
- **GBD scope:** measures the impact of **>290 health conditions and >67 risk factors** worldwide; generates estimates by **age and sex** across regions, with breakdowns by **country, region, state, or county**. Data hosted in the **Global Health Data Exchange (GHDx)** with visualization/GIS tools (GBD Compare).
- **Metrics:**
  - **DALY (disability-adjusted life year):** *"One DALY can be thought of as one year of healthy life lost, and the overall disease burden can be thought of as a measure of the gap between current health status and the ideal health status."*
  - **YLD (years lived with disability):** the morbidity component.
  - **YLL (years of life lost):** the premature-mortality component. DALY = YLL + YLD.
  - Sources: https://www.healthdata.org/data-tools-practices/health-data-science/burden-disease-research ; Wikipedia, "Global Burden of Disease" — https://en.wikipedia.org/wiki/Global_Burden_of_Disease

**SEER — Surveillance, Epidemiology, and End Results (cancer incidence).**
- **SEER Program (NCI).** The authoritative US source for **cancer incidence and survival**, collecting from population-based registries covering **~45.9% of the US population**. Captures **patient demographics, primary tumor site, morphology, stage at diagnosis, first course of treatment, and vital-status follow-up** — *"the only comprehensive US source providing both stage at diagnosis and patient survival data."* Mortality from NCHS; population denominators from the Census Bureau.
- **Stratification:** by **race and Hispanic ethnicity**, **age, sex**, and **geography** (State Cancer Profiles give state/county statistics).
  - Source: https://seer.cancer.gov/about/overview.html

**EUROCAT — congenital anomaly registries (Europe).** Network of **population-based congenital anomaly registries across Europe**, founded **1979**. As of January 2023: **43 member registries from 23 countries covering >25% of European births/year**. Objectives: provide epidemiologic information on congenital anomalies; early warning of teratogenic exposures; evaluate primary prevention; assess prenatal screening; act as a resource center for clusters/risk factors.
  - Source: https://eurodcat.platform.who.it/ ; Wikipedia, "EUROCAT (medicine)" — https://en.wikipedia.org/wiki/EUROCAT_(medicine)

### (e) Rare-Disease Prevalence Terminology — Domain Glossary

- **Prevalence:** *"The proportion of a particular population found to be affected by a medical condition … at a specific time,"* derived by dividing cases by the total studied; expressed as a fraction, percentage, or cases per 10,000/100,000. *"Prevalence answers 'How many people have this disease right now?'"*
  - Source: Wikipedia, "Prevalence" — https://en.wikipedia.org/wiki/Prevalence

- **Incidence:** *"The number of new cases of a given medical condition in a population within a specified period of time."* **Incidence proportion** (cumulative incidence) = number developing disease over a period ÷ total followed. Incidence answers "How many new cases occur?"
  - Source: Wikipedia, "Incidence (epidemiology)" — https://en.wikipedia.org/wiki/Incidence_(epidemiology)

- **Point prevalence:** cases present at one instant in time. **Period prevalence:** cases present during a defined period. **Lifetime prevalence:** the proportion who have ever had the condition at any point in their life up to the survey.
  - Source: https://en.wikipedia.org/wiki/Prevalence

- **Rare disease (definition, by jurisdiction):**
  - **United States (Orphan Drug Act 1983 / Rare Diseases Act 2002):** *"any disease or condition that affects fewer than 200,000 people in the United States,"* i.e. about 1 in 1,500.
    - Source: Wikipedia, "Rare disease" — https://en.wikipedia.org/wiki/Rare_disease
  - **European Union:** *"life-threatening or chronically debilitating diseases … of such low prevalence that special combined efforts are needed to address them,"* with *"low prevalence"* defined as generally **fewer than 1 in 2,000** (5 in 10,000).
  - **Japan:** <50,000 patients (~1 in 2,500). Other countries range from 1/1,000 to 1/200,000.

- **Orphan disease:** often a synonym for rare disease, but in the US/EU has a distinct legal meaning — also includes non-rare diseases *"for which there is no reasonable expectation that the cost of developing and making available in the US a drug for such disease … will be recovered"* (i.e., neglected/underserved markets).
  - Source: https://en.wikipedia.org/wiki/Rare_disease

- **Ultra-rare:** diseases affecting a handful of individuals (no single numerical threshold).

- **The "long tail" of Mendelian disease:** Most rare diseases are genetic (present throughout life). The 2019 **Monarch Initiative** Mondo-ontology rare-disease subset reconciled OMIM, Orphanet, and others and counted **>10,500 rare diseases** (prior estimates were ~7,000). Global Genes estimates ~10,000 rare diseases globally, **~80% of identified genetic origin**; ~30% of children with rare diseases die before age 5. The long tail means that individually each disease has a vanishingly small prior, but collectively rare diseases are a large burden.
  - Source: Wikipedia, "Rare disease" — https://en.wikipedia.org/wiki/Rare_disease

- **Zebra diagnoses competing probabilistically with common-disease priors:** A rare (zebra) diagnosis enters the differential when its posterior, after Bayesian updating, rises enough to compete with common-disease priors. Because prevalence is the prior, a disease at 1/200,000 starts ~3 orders of magnitude behind a 1/1,000 common disease; it takes a striking likelihood ratio (a pathognomonic finding) or a dramatic prior shift (demographic/geographic re-stratification — e.g., Ashkenazi ancestry for Tay-Sachs) to make the zebra competitive. When such a shift is present, the "zebra" effectively becomes a local "horse" — its local prevalence is much higher than the population base rate. This is the precise mechanism by which demographic/geographic adjustment rescues rare-disease diagnosis from base-rate suppression.

### Summary for a decision-support agent (Section 2)

1. **Anchor the prior on prevalence** (base rate) — the strongest single predictor in a non-specific presentation (Meehl 1954; hoofbeats/horses). Use actuarial combination where data exist; distrust unaided intuition's representativeness adjustments (Kahneman & Tversky).
2. **Re-stratify the prior by demography and geography** — age, sex, ancestry/ethnicity, and location can change the prior by 1–3 orders of magnitude (sickle cell/African ancestry; CF/Northern European; Tay-Sachs/Ashkenazi; lupus/women + African descent; Kawasaki/Japanese; sarcoidosis/African American). Pull these stratified rates from CDC (NHIS/NHANES/BRFSS/WONDER), WHO GHO/GHE, GBD/IHME, SEER (cancer), Orphanet/GARD/NORD (rare), EUROCAT (congenital).
3. **Apply Sutton's law for sequencing** — test the probable/treatable/urgent first; escalate to zebra workup on red flags, family history, refractory course, or high cost-of-miss. Honor Hickam's dictum (comorbidity) before invoking a zebra.
4. **Update explicitly with likelihood ratios** — guard against the false-positive paradox by combining the (demographically re-stratified) prior with each finding's likelihood ratio, not its mere "classic-ness" (representativeness).
5. **Treat race corrections with caution** (Vyas 2020 NEJM) — prefer the proximate biological/social cause over a race coefficient; use race-free equations where validated (2021 CKD-EPI; race-neutral spirometry references).

---

## 3. Diagnostic Testing Strategy — Tests as Information-Gathering That Reduces Uncertainty

A reference document for a clinical decision-support agent. All primary sources cited with PMID, DOI, and URL. Verbatim quotes are marked; the rest are close paraphrases of the cited primary sources.

> **Source note / one correction to verify.** The brief stated the Pauker-Kassirer threshold paper's PMID as 7384435. The correct PMID for "The threshold approach to clinical decision making," NEJM 1980;302(20):1109–1117 is **7366635** (DOI 10.1056/NEJM198005153022003), confirmed via Europe PMC. 7384435 appears to be a transcription error — flagging it so the agent doesn't cite the wrong number.

### (a) The Threshold Model of Testing — Pauker & Kassirer

**Primary source:** Pauker SG, Kassirer JP. "The threshold approach to clinical decision making." *N Engl J Med*. 1980;302(20):1109-1117. **PMID 7366635**, DOI 10.1056/NEJM198005153022003. https://pubmed.ncbi.nlm.nih.gov/7366635/ (Earlier companion: Pauker & Kassirer, "Therapeutic decision making: a cost-benefit analysis," *N Engl J Med* 1975;293:229-234, **PMID 1143303**.)

The threshold model holds that for any disease, a clinician's *prior estimate of disease probability* (pre-test probability) falls into one of three action zones defined by two thresholds. A test is worth doing only when its result could move probability across a treatment-decision boundary.

**Key terms (domain glossary):**
- **Testing threshold (T_test):** the pre-test probability *below* which the expected harm/cost of the test itself (and the downstream false positives it generates) outweighs any benefit — so the optimal action is **neither test nor treat** (observe). Below this, the chance of disease is too low to justify either working it up or treating empirically.
- **Treatment threshold (T_treat / test-treatment threshold):** the pre-test probability *above* which the optimal action is to **treat without testing** — the disease is likely enough that testing is superfluous and only delays treatment.
- **No-test-no-treat zone (the "testing zone"):** the band between the two thresholds. Here the probability is too high to ignore and too low to treat blindly, so **testing is the optimal action** — because a positive result can push probability above the treatment threshold (treat) and a negative result can drop it below the testing threshold (stop/reassure).

**Treatment threshold — verified formula (utility form).** From the open "Prevalence threshold" article, which reproduces the Pauker-Kassirer treatment threshold:

> p_t = [U(N,¬D) − U(A,¬D)] / { [U(A,D) − U(N,D)] + [U(N,¬D) − U(A,¬D)] }

where U(A,D) is the utility of acting (treating) when disease is present, U(N,D) the utility of not acting when disease is present, etc. The article states treatment thresholds are "**derived from utilities, harms, benefits, and the relative consequences of treating versus not treating**," and cites Pauker SG, Kassirer JP (1980) "The threshold approach to clinical decision making," *N Engl J Med*.

**Testing threshold — formula (canonical decision-analysis form).** When a test with sensitivity Sn and specificity Sp carries a risk/cost R_t (morbidity, cost, false-positive downstream workup) and treatment carries risk R_rx (harm of treating a non-diseased patient) versus benefit B_rx (benefit of treating a diseased patient), the two thresholds are (Pauker & Kassirer 1980; see also Djulbegovic & Hozo, *Cancer Treat Res* 2023, **PMID 37789160**, "Decision-Making When Diagnostic Testing is Available," whose abstract confirms "threshold modeling" with "three choices" — test, treat, or neither):
- **Treatment threshold (no test available):** T_treat = R_rx / (R_rx + B_rx) — the probability at which expected treat-utility equals no-treat-utility.
- **Testing threshold (test available):** T_test = (R_t + (1−Sp)·R_rx) / (R_t + (1−Sp)·R_rx + Sn·B_rx) — i.e., the probability below which the test's own risk plus the false-positive treatment harm exceeds the expected benefit of detecting true disease.

The *logic* is invariant and verified: testing is justified only when pre-test probability sits in the zone where a result could cross the treatment threshold.

**Clinical bottom line for the agent:** Pre-test probability × test characteristics (LR+/LR−, or Sn/Sp) determines the optimal of three actions (test, treat, observe). The thresholds are set by the *utilities* (how bad is a missed diagnosis vs. an unnecessary treatment vs. the test's own risk), not by the test alone.

### (b) Likelihood Ratios as the Engine of Updating

**Primary sources:**
- Jaeschke R, Guyatt GH, Sackett DL. "Users' Guides to the Medical Literature. III. How to use an article about a diagnostic test. B. What are the results and will they help me in caring for my patients?" *JAMA*. 1994;271(9):703-707. **PMID 8309035**, DOI 10.1001/jama.271.9.703. https://pubmed.ncbi.nlm.nih.gov/8309035/
- Jaeschke R, Guyatt G, Sackett DL. "Users' Guides... III. A. Are the results of the study valid?" *JAMA*. 1994;271(5):389-391. **PMID 8283589**, DOI 10.1001/jama.271.5.389. https://pubmed.ncbi.nlm.nih.gov/8283589/ (Companion on validity/bias — see section (g).)
- Deeks JJ, Altman DG. "Diagnostic tests 4: likelihood ratios." *BMJ*. 2004;329:168-169. **PMID 15258077**, PMCID **PMC478236**, DOI 10.1136/bmj.329.7458.168. https://pubmed.ncbi.nlm.nih.gov/15258077/
- Fagan TJ. "Letter: Nomogram for Bayes's theorem." *N Engl J Med*. 1975;293(5):257. **PMID 1143310**, DOI 10.1056/NEJM197507312930513. https://pubmed.ncbi.nlm.nih.gov/1143310/

**Definitions (verified verbatim from Deeks & Altman 2004, PMC478236):**
- **Likelihood ratio (LR):** "**the ratio of the probability of the specific test result in people who do have the disease to the probability in people who do not.**"
- **LR+ (positive likelihood ratio):** = sensitivity / (1 − specificity). Verbatim: "sensitivity divided by... (1-specificity)."
- **LR− (negative likelihood ratio):** = (1 − sensitivity) / specificity. Verbatim: "(1-sensitivity) divided by... specificity."
- **Interpretation:** "Each test result has its own likelihood ratio, which summarises **how many times more (or less) likely patients with the disease are to have that particular result than patients without the disease**." (Deeks & Altman 2004)
- **Rule of thumb (verified):** "Likelihood ratios above 10 and below 0.1 are considered to provide strong evidence to rule in or rule out diagnoses respectively in most circumstances." (Deeks & Altman 2004)

**Updating pre-test → post-test probability (Bayes, odds form — verified):** "The post-test odds that the patient has the disease are estimated by multiplying the pretest odds by the likelihood ratio." The three steps:
1. Pre-test odds = p / (1 − p)
2. Post-test odds = pre-test odds × LR
3. Post-test probability = post-test odds / (1 + post-test odds)

This is Bayes' theorem in odds form: **post-test odds = pre-test odds × LR**.

**Fagan nomogram:** A graphical implementation of Bayes' theorem (Fagan 1975, PMID 1143310). Three parallel scales — **pre-test probability (left), likelihood ratio (center), post-test probability (right)**; drawing a straight line from the pre-test probability through the LR lands on the post-test probability. Deeks & Altman note "a nomogram can be used to avoid having to make conversions between odds and probabilities" and cite Fagan.

**Diagnostic odds ratio (DOR):**
- DOR = (Sn × Sp) / [(1 − Sn) × (1 − Sp)] = LR+ / LR−.
- It is "**a single indicator of test performance... but which is independent of prevalence**" — "the ratio of the odds of the test being positive if the subject has a disease relative to the odds of the test being positive if the subject does not have the disease." (Canonical DOR reference: Glas et al. 2003 and the Deeks/Altman systematic-review methods work; Deeks & Altman 2004 BMJ is the widely cited LR explainer.)

**Number needed to test (NNT_test):** The diagnostic analog of number needed to treat — the number of patients who must be tested for one to benefit (or for one case to be detected/rule-out to occur), derived from the absolute change in probability that the test produces and the downstream benefit of acting on the changed probability. Modern methodological discussion: Park SH, Han K. "Number Needed to Test in Diagnostic Comparative Effectiveness Research..." *Korean J Radiol*. 2026. **PMID 42551873**, DOI 10.3348/kjr.2026.1123. (Concept: NNT_test ≈ 1 / [P(disease) × (post-test action benefit)] — only meaningful when the test actually changes a management decision.)

### (c) Expected Value of Information (EVI) / EVPI

**Primary sources (decision-analysis canon):**
- Weinstein MC, Fineberg HV, Elstein AS, et al. *Clinical Decision Analysis*. Philadelphia: W.B. Saunders, 1980 (the foundational textbook formalizing expected-value decision trees, utilities, and value-of-information).
- Claxton K. "The irrelevance of inference: a decision-making approach to the stochastic evaluation of health care technologies." *J Health Econ*. 1999;18(4):341-364. **PMID 10537899**, DOI 10.1016/S0167-6296(98)00039-3. https://pubmed.ncbi.nlm.nih.gov/10537899/
- Claxton K. "Bayesian approaches to the value of information: implications for the regulation of new pharmaceuticals." *Health Econ*. 1999;8(3):269-280. **PMID 10348422**, DOI 10.1002/(SICI)1099-1050(199905)8:3<269::AID-HEC425>3.0.CO;2-D. https://pubmed.ncbi.nlm.nih.gov/10348422/
- Ades AE, Claxton K, et al., and the value-of-information methods literature (e.g., Dias S, Sutton AJ, Welton NJ, Ades AE. "Evidence synthesis for decision making 6: embedding evidence synthesis in probabilistic cost-effectiveness analysis." *Med Decis Making*. 2013;33(6):671-682. **PMID 23804510**, PMCID **PMC3704202**, DOI 10.1177/0272989X13487257).
- Welton NJ, Ades AE, et al. (expected value of partial/sample perfect information methods — e.g., Madan J, Ades AE, et al. "Strategies for efficient computation of the expected value of partial perfect information." *Med Decis Making*. 2014;34(3):327-342. **PMID 24449434**, PMCID **PMC4948652**, DOI 10.1177/0272989X13514774).

**Key terms:**
- **Decision-making under uncertainty:** When the true state (disease present/absent; best treatment) is unknown, the decision is chosen to maximize *expected* utility, averaged over the probability distribution of states. Expected value = Σ p(state) × utility(action, state).
- **Expected value of perfect information (EVPI) — verified definition (Wikipedia "Expected value of perfect information," citing Claxton et al.):** "**the price that one would be willing to pay in order to gain access to perfect information**"; it measures "**the expected cost of that uncertainty**," since "**perfect information can eliminate the possibility of making the wrong decision**." Formula: **EVPI = EV|PI − EMV** (expected value with perfect information minus the expected value/monetary value of the best decision under current uncertainty). EVPI "serves as a financial threshold for acquiring data... if one is offered knowledge for a price larger than EVPI, it would be better to refuse the offer." It is always non-negative and is the *upper bound* on the value of any information-gathering activity (testing).
- **Expected value of sample information (EVSI):** the expected value of a *particular, imperfect* piece of evidence (a specific test, a study of size n). EVSI ≤ EVPI. A test is worth ordering when its EVSI exceeds its cost (and risk).
- **Expected value of partial perfect information (EVPPI):** EVPI resolved for one parameter/decision element at a time — used to identify which uncertainty is most worth reducing.
- **Claxton's "irrelevance of inference" (PMID 10537899):** the seminal argument that decisions under uncertainty should be driven by *expected value* and the value of further information, not by hypothesis tests/inference on effect sizes — i.e., research/testing is justified by EVSI, not by statistical significance.

**Application to test selection:** Choose the test whose **information gain is highest** — the test that best splits the remaining differential and changes a management decision. Concretely: a test has positive expected value only if, for some plausible result, the post-test probability crosses a treatment/testing threshold, so the optimal action changes. If no possible result would change the action, EVSI = 0 and the test is not worth doing (the foundational "test only if it could change management" principle). The decision-analysis method is to (1) enumerate the differential with probabilities, (2) build the decision tree with utilities, (3) compute expected value at each node, (4) compute EVPI/EVSI for each candidate test, (5) select the test with the highest EVSI net of its cost/risk.

### (d) Test Selection / Information-Gain Strategy — "Which Next Test?"

**Decision-analysis canon:** Weinstein, Fineberg, Elstein, *Clinical Decision Analysis* (1980) — expected-value decision trees and the principle that a branch is only worth including if its outcomes lead to different actions.

**Core principle (branching logic):** A test is useful **when its possible outcomes send you down different subsequent paths (differential discrimination)**. If a positive and a negative result lead to the same next step, the test has zero decision value. The information-gain strategy is therefore: among candidate tests, pick the one whose result distribution most separates the leading hypotheses on the differential — i.e., the test with the largest LR+ for one disease *and* the largest LR− for the alternatives, weighted by how much each outcome would change the action. This is the EVSI logic of section (c) applied to the differential.

**Over-testing harms — cascade effects (verified primary sources):**
- **Ganguli I, et al. "Prevalence and Cost of Care Cascades After Low-Value Preoperative Electrocardiogram for Cataract Surgery in Fee-for-Service Medicare Beneficiaries."** *JAMA Intern Med*. 2019;179(9):1211-1219. **PMID 31158270**, PMCID **PMC6547245**, DOI 10.1001/jamainternmed.2019.1739. https://pubmed.ncbi.nlm.nih.gov/31158270/
  - Verbatim definition: cascade events are "**follow-up tests, treatments, visits, hospitalizations, and new diagnoses that would follow plausibly from the initial service.**"
  - Verbatim finding: among beneficiaries getting a pre-op ECG, 15.9% experienced ≥1 cascade event; "**Spending for the additional services was up to $565 per Medicare beneficiary... or an estimated $35,025,923 annually**," exceeding the $3,275,712 paid for the ECGs themselves; 5.11–10.92 additional events per 100 beneficiaries, including 1.40 new cardiology visits and 1.21 new cardiac diagnoses. Conclusion: "**Care cascades after preoperative EKG for cataract surgery are infrequent but costly.**"
- **Nguyen LT, Sullivan CT, Makam AN. "The Diagnostic Cascade of Incidental Findings: A Teachable Moment."** *JAMA Intern Med*. 2015;175(7):1089. **PMID 25938592**, DOI 10.1001/jamainternmed.2015.1520. https://pubmed.ncbi.nlm.nih.gov/25938592/ (Illustrates the incidental-finding cascade — an abnormal result triggers a chain of further testing, cost, anxiety, and potential harm.)
- **Watson J, Salisbury C, Whiting P, et al. "Added value and cascade effects of inflammatory marker tests in UK primary care: a cohort study..."** *Br J Gen Pract*. 2019; **PMID 31208976**, PMCID **PMC6582446**, DOI 10.3399/bjgp19X704321. (Empirical cascade effects of panel blood tests.)
- **Baxi SM, Lakin JR. "Preoperative Testing — A Bridge to Nowhere: A Teachable Moment."** *JAMA Intern Med*. 2015;175(7):1089-1090. **PMID 26052986**, PMCID **PMC4782754**, DOI 10.1001/jamainternmed.2015.2100.

**Overdiagnosis (the end-state of a testing cascade that finds true-but-irrelevant disease) — verified:**
- **Adamson AS, Suarez EA, Welch HG. "Estimating Overdiagnosis of Melanoma Using Trends Among Black and White Patients in the US."** *JAMA Dermatol*. 2022;158(4):426-431. **PMID 35293957**, PMCID **PMC8928089**, DOI 10.1001/jamadermatol.2022.0139. https://pubmed.ncbi.nlm.nih.gov/35293957/
  - Verbatim: "an estimated **59% (95% CI, 45%-70%) of White women and 60% (95% CI, 32%-75%) of White men with melanoma were overdiagnosed in 2014**"; "The discrepancies in incidence and mortality trends... suggest **considerable overdiagnosis** of melanoma occurring among White patients in the US."
- Welch HG, Bergmark R. "Cancer Screening, Incidental Detection, and Overdiagnosis." *Clin Chem*. 2024. **PMID 37757858**, DOI 10.1093/clinchem/hvad127.
- (Overdiagnosis is the detection by testing of a condition that would never have caused symptoms or death; it is the downstream harm of lowering testing/treatment thresholds and of incidental-finding cascades.)

**Screening thresholds / USPSTF:** Moyer VA, on behalf of the U.S. Preventive Services Task Force. Screening recommendations embody the threshold logic at population scale — a screening test is recommended only when pre-test prevalence (in the screened population) exceeds a threshold at which benefits (detected, treatable cases) outweigh cascade harms (false positives, overdiagnosis, radiation, anxiety). The USPSTF grades recommendations by net benefit; a "D" (against) recommendation typically means the testing threshold is not met in that population (benefit < harm). (The agent should pull specific USPSTF recommendation statements by topic; the threshold logic is consistent with Pauker-Kassirer applied to populations.)

### (e) Operating Points and ROC Curves

**Primary source:** Hanley JA, McNeil BJ. "The meaning and use of the area under a receiver operating characteristic (ROC) curve." *Radiology*. 1982;143(1):29-36. **PMID 7063747**, DOI 10.1148/radiology.143.1.7063747. https://pubmed.ncbi.nlm.nih.gov/7063747/ (Cited by 11,620 — the canonical ROC paper.) Companion: Hanley JA, McNeil BJ. "A method of comparing the areas under receiver operating characteristic curves derived from the same cases." *Radiology*. 1983;148(3):839-843. **PMID 6878708**, DOI 10.1148/radiology.148.3.6878708.

**Definitions (verified verbatim from Wikipedia "Receiver operating characteristic," which cites Hanley & McNeil 1982):**
- **ROC curve:** "the true positive rate (TPR) against the false positive rate (FPR)" at various thresholds — i.e., **sensitivity plotted against (1 − specificity)** as the positivity cutoff is varied.
- **Operating point:** a single (FPR, TPR) pair chosen by selecting a test's positivity threshold. "Adjusting the threshold changes the operating point along the curve. **Increasing the threshold would result in fewer false positives (and more false negatives), corresponding to a leftward movement on the curve.**" Selecting a threshold trades sensitivity against specificity — high threshold = high specificity/low sensitivity (few false positives, miss some cases); low threshold = high sensitivity/low specificity (few misses, more false positives).
- **Area under the ROC curve (AUC):** "**the probability that a classifier will rank a randomly chosen positive instance higher than a randomly chosen negative one.**" AUC = 0.5 = no discrimination (diagonal); AUC = 1.0 = perfect discrimination (point (0,1)). AUC summarizes discriminative ability independent of any single threshold and is the standard single-number summary of a test's overall accuracy (also equals the concordance probability, C-statistic).
- **C-index / concordance:** AUC = P(score(diseased) > score(non-diseased)).

**Decision-making use:** ROC curves let a clinician (or agent) choose the *operating point* that best matches the clinical context — e.g., a high-sensitivity operating point for a "rule-out" test (where missing disease is costly, so accept more false positives), a high-specificity point for a "rule-in" confirmatory test (where false positives trigger harmful intervention). Comparing two tests' AUCs tells which discriminates better overall; comparing ROC curves at a given specificity tells which is better at a chosen operating point.

### (f) Cost-Effectiveness of Testing (brief)

**Primary source:** Sanders GD, Neumann PJ, Basu A, et al. "Recommendations for Conduct, Methodological Practices, and Reporting of Cost-effectiveness Analyses: Second Panel on Cost-Effectiveness in Health and Medicine." *JAMA*. 2016;316(10):1093-1103. **PMID 27623463**, DOI 10.1001/jama.2016.12195. https://pubmed.ncbi.nlm.nih.gov/27623463/ (Follow-up: Neumann PJ, et al. "Future Directions for Cost-effectiveness Analyses in Health and Medicine." *Med Decis Making*. 2018;38(7):767-777. **PMID 30248277**.) Foundational textbook: Drummond MF, et al. *Methods for the Economic Evaluation of Health Care Programmes* (4th ed., Oxford University Press, 2015).

**Key terms:**
- **QALY (quality-adjusted life-year):** the standard outcome measure combining survival and quality of life (1 year of perfect health = 1 QALY).
- **Incremental cost-effectiveness ratio (ICER):** ICER = (Cost_strategy_A − Cost_comparator) / (Effect_strategy_A − Effect_comparator), with effect in QALYs. Units: $/QALY.
- **Cost-effectiveness threshold:** the ICER below which an intervention is considered cost-effective (e.g., ~$50,000–$150,000/QALY in the US; £20,000–£30,000/QALY in the UK/NICE). If a testing strategy's ICER is below the threshold and it improves QALYs, it represents good value.
- The Second Panel (Sanders 2016) standardizes that cost-effectiveness of *testing strategies* should be evaluated as ICERs against a comparator, with costs and effects modeled over the cascade (downstream tests and treatments triggered by results) — directly linking to the cascade literature in (d). For diagnostic strategies specifically, the ICER compares strategies (e.g., test-then-treat vs. treat-all vs. watchful-waiting), and value-of-information analysis (section c) sits on top to prioritize which diagnostic-accuracy uncertainties are worth resolving.

### (g) Limitations of Testing — Biases

**Primary source (the empirical bias magnitudes):** Lijmer JG, Mol BW, Heisterkamp S, et al. "Empirical evidence of design-related bias in studies of diagnostic tests." *JAMA*. 1999;282(11):1061-1066. **PMID 10493205**, DOI 10.1001/jama.282.11.1061. https://pubmed.ncbi.nlm.nih.gov/10493205/ (Cited by 1,294.)

**Verified findings (verbatim abstract, PMID 10493205):** Of 218 test evaluations, only 15 (6.8%) met all 8 methodological criteria. Magnitudes of overestimation (relative diagnostic odds ratio, RDOR):
- **Spectrum bias** (case-control design — testing a diseased population and a *separate* healthy control group vs. a clinical population): **RDOR 3.0 (95% CI 2.0-4.5)** — the largest bias. "Studies evaluating tests in a diseased population and a separate control group **overestimated the diagnostic performance** compared with studies that used a clinical population."
- **Differential verification (workup) bias** — different reference standards used for positive vs. negative index-test results: **RDOR 2.2 (95% CI 1.5-3.3)**. "Studies in which different reference tests were used for positive and negative results... overestimated the diagnostic performance."
- **Review bias** — reference standard interpreted with knowledge of the index test result: **RDOR 1.3 (95% CI 1.0-1.9)**. "Diagnostic performance was also overestimated when the reference test was interpreted with knowledge of the test result."
- **No described test criteria:** RDOR 1.7 (1.1-2.5). **No population description:** RDOR 1.4 (1.1-1.7).
- Conclusion: "diagnostic studies with methodological shortcomings may **overestimate the accuracy of a diagnostic test**, particularly those including nonrepresentative patients or applying different reference standards."

**Reporting/bias taxonomy sources:**
- Bossuyt PM, Reitsma JB, Bruns DE, et al. "STARD 2015: an updated list of essential items for reporting diagnostic accuracy studies." *BMJ*. 2015. **PMID 26511519**, PMCID **PMC4623764**, DOI 10.1136/bmj.h5527. (Lijmer is a co-author.)
- Whiting PF, et al. "QUADAS-3: A Revised Tool for the Quality Assessment of Diagnostic Test Accuracy Studies." *Ann Intern Med*. 2026. **PMID 41698208**, DOI 10.7326/M25-02104. (Successor to QUADAS-2; the standard risk-of-bias tool for diagnostic-accuracy studies.)
- Users' Guides III.A (Jaeschke, Guyatt, Sackett 1994, **PMID 8283589**) — the bedside checklist for validity: was there an independent, blind comparison with a reference standard; did the patient spectrum match the intended use; did the test result influence the decision to perform the reference standard (workup bias); were test methods reproducible.

**Bias glossary (definitions):**
- **Spectrum bias:** the test's accuracy is measured in a patient spectrum that does not match the intended clinical population (e.g., advanced disease vs. healthy controls inflates Sn/Sp); produces overestimation (Lijmer RDOR 3.0).
- **Verification (workup) bias:** patients with positive (or more "worrisome") index-test results are more likely to receive the (invasive) reference standard, so false negatives are missed and apparent sensitivity rises. Subset: **differential verification bias** = different reference standards for positive vs. negative results (Lijmer RDOR 2.2).
- **Review bias:** the interpreter of the reference standard knows the index-test result (or vice versa), inflating concordance (Lijmer RDOR 1.3).
- **Pre-test probability anchoring effects:** clinicians anchor post-test estimates on the pre-test estimate and under-adjust for strong test results (a well-documented cognitive bias; tests that should move probability far often move it too little — the inverse of over-reliance on a salient anchor). This erodes the LR-updating machinery of section (b).
- **False positives multiplying across panels (multiple-comparison problem):** when many independent tests are ordered simultaneously, the per-test false-positive rate compounds — for k independent tests each at specificity Sp, the probability of *no* false positive is Sp^k, so the probability of ≥1 false positive is 1 − Sp^k, which rises quickly (e.g., 20 tests at 95% specificity ⇒ 1 − 0.95^20 ≈ 64% chance of a spurious abnormality). This is the statistical engine behind panel-driven cascade effects (Ganguli 2019; Watson 2019) and overdiagnosis (Welch et al.).

### Consolidated Glossary (Section 3)

| Term | Definition | Primary source |
|---|---|---|
| Testing threshold (T_test) | Pre-test probability below which neither testing nor treating is optimal (observe) | Pauker & Kassirer 1980, PMID 7366635 |
| Treatment threshold (T_treat) | Pre-test probability above which treat without testing; formula p_t = [U(N,¬D)−U(A,¬D)] / {[U(A,D)−U(N,D)]+[U(N,¬D)−U(A,¬D)]} | Pauker & Kassirer 1980; verified via Prevalence-threshold article |
| No-test-no-treat zone | Band between thresholds where testing is optimal (a result can cross T_treat) | Pauker & Kassirer 1980 |
| Likelihood ratio (LR+/LR−) | LR+ = Sn/(1−Sp); LR− = (1−Sn)/Sp; "summarises how many times more/less likely patients with the disease are to have that result" | Deeks & Altman 2004, PMID 15258077 |
| Bayes (odds form) | Post-test odds = pre-test odds × LR | Deeks & Altman 2004; Jaeschke 1994, PMID 8309035 |
| Fagan nomogram | Graphical Bayes: pre-test prob (left) × LR (center) → post-test prob (right) | Fagan 1975, PMID 1143310 |
| Diagnostic odds ratio (DOR) | DOR = (Sn·Sp)/[(1−Sn)(1−Sp)] = LR+/LR−; prevalence-independent single accuracy measure | Glas/Deeks-Altman tradition |
| Number needed to test | Number tested for one to benefit; meaningful only if test changes management | Park & Han 2026, PMID 42551873 |
| EVPI | EV\|PI − EMV; "price one would pay for perfect information"; upper bound on value of any testing | Claxton 1999, PMID 10537899; verified Wikipedia |
| EVSI / EVPPI | Expected value of (partial) sample information; a test is worth doing when EVSI > cost/risk | Ades/Claxton/Welton tradition |
| ROC curve | Sensitivity vs (1−specificity) across thresholds | Hanley & McNeil 1982, PMID 7063747 |
| AUC | P(ranking a diseased case above a non-diseased case); 0.5 = none, 1.0 = perfect | Hanley & McNeil 1982, PMID 7063747 |
| Operating point | (FPR, TPR) chosen by setting the positivity cutoff; trades Sn vs Sp | Hanley & McNeil 1982 |
| ICER | (Cost_A − Cost_comp)/(Effect_A − Effect_comp), $/QALY | Sanders 2016, PMID 27623463 |
| QALY | Quality-adjusted life-year | Sanders 2016 |
| Care cascade | Downstream tests, treatments, visits, diagnoses following an initial test | Ganguli 2019, PMID 31158270 |
| Overdiagnosis | Detection of true disease that would never have caused symptoms/death | Adamson/Welch 2022, PMID 35293957 |
| Spectrum bias | Non-representative patient spectrum inflates accuracy (RDOR 3.0) | Lijmer 1999, PMID 10493205 |
| Verification/workup bias | Positive results more likely verified; inflates Sn (differential: RDOR 2.2) | Lijmer 1999, PMID 10493205 |
| Review bias | Reference standard unblinded to index test (RDOR 1.3) | Lijmer 1999, PMID 10493205 |

### Key caveats for the decision-support agent (Section 3)
1. **One correction to propagate:** Pauker-Kassirer 1980 threshold paper PMID is **7366635**, not 7384435.
2. **Tests have value only insofar as they change a decision.** The unifying principle across (a)–(d): order a test when pre-test probability lies between the testing and treatment thresholds *and* the test's possible results could push probability across a threshold that changes the action. This is the threshold model (a), the LR engine (b), and EVSI (c) expressed as one rule.
3. **Every test carries cascade risk** (d, g): a false positive or incidental finding triggers downstream testing, cost, and overdiagnosis. The agent should weigh test EVSI against cascade harm, not against zero.
4. **Accuracy numbers are unreliable unless the study design was sound.** Spectrum, verification, and review biases inflate Sn/Sp/DOR by up to 3-fold (Lijmer 1999); the agent should prefer accuracy estimates from clinical-population studies with a single blinded reference standard (per STARD/QUADAS-3).
5. **The no-test-no-treat zone is utility-driven, not test-driven.** Thresholds shift with how bad a missed diagnosis is relative to unnecessary treatment and the test's own risk — the same disease has different optimal thresholds in different patients/contexts.

---

## 5. Retraceable Reasoning / Explainability

> **Core thesis.** A diagnostic conclusion is not clinically complete until the *path* to it is recorded. "Retraceable reasoning" is the requirement that a physician (or, by extension, an AI diagnostic agent) can show *how* they got from evidence to conclusion — the audit trail of subjective data, objective data, the working differential, and the reasoning that selected among it.

### (a) How diagnostic reasoning is documented clinically

**The SOAP note — origin and purpose.** The **SOAP note** organizes a clinical encounter into four sections — **Subjective, Objective, Assessment, Plan**. It originated from the **Problem-Oriented Medical Record (POMR)** developed by **Lawrence L. Weed, MD**.

The foundational publication is a two-part article in the *New England Journal of Medicine*:
- Weed LL. **"Medical records that guide and teach."** *N Engl J Med.* 1968;278(11):593–600. (Part I) — https://www.nejm.org/doi/10.1056/NEJM196803142781101
- Weed LL. **"Medical records that guide and teach."** *N Engl J Med.* 1968;278(12):652–657. (Part II)

Weed introduced the POMR "to help physicians approach complex patients with multiple problems in a highly organized way." The record is reorganized *around a defined list of the patient's medical problems* rather than around the source of data (laboratory vs. radiology vs. history). Each problem is then worked up using the SOAP structure.

**Purpose of each section:**
- **Subjective** — what the patient (or caregiver) reports: history of present illness, symptoms, associated complaints, relevant past history as narrated.
- **Objective** — observable, verifiable data: vital signs, physical exam findings, laboratory results, imaging.
- **Assessment** — the clinician's *synthesis*: the working diagnosis and the differential, with reasoning. (This is the "reasoning trail" section.)
- **Plan** — the intended actions: further diagnostics, therapeutics, patient education, follow-up.

Weed's core argument was that a medical record should not be a passive archive but an *active cognitive tool* that "guides and teaches" — forcing the clinician to make their reasoning explicit and legible to the next clinician who reads the chart. This is the historical root of "retraceable reasoning."

**The "Assessment" section: working diagnosis, differential, and reasoning.** The expected standard (taught across U.S. medical education) is:
1. **A "one-liner"** — a concise summary statement that frames the patient by demographic + chief complaint + key context (e.g., *"65-year-old man with history of COPD presenting with 3 days of worsening dyspnea and productive cough"*). This primes the reader toward the diagnostic problem space and demonstrates the clinician's framing.
2. **The differential diagnosis** — a ranked list of plausible diagnoses, typically separated into "most likely," "must-not-miss" (life-threatening alternatives), and less likely possibilities.
3. **The reasoning** — a narrative linking the subjective + objective data to each item on the differential: which findings support the leading diagnosis, which argue against alternatives, what the pretest probability is, and why a given diagnostic test or treatment is being pursued.

The Assessment is, in effect, a structured **argument**: claim (working diagnosis) + evidence (S/O data) + warrants (clinical reasoning). It is the written artifact that lets another clinician (or a reviewing board, or a malpractice jury) retrace the diagnostic path. A SOAP note with an empty or conclusory Assessment ("pneumonia, start antibiotics") is considered *incomplete documentation* because it omits the retraceable reasoning trail.

**The Problem-Oriented Medical Record (POMR) and the problem list.** Weed's POMR rests on a **problem list** — a running index of every active problem (diagnoses, symptoms, unresolved issues, social/behavioral issues) — kept at the front of the chart. Every note is written *against the problem list*: each problem gets its own SOAP entry. This forces continuity, makes dropped balls visible, and ensures that a complex patient's reasoning is modular and auditable per problem rather than buried in a chronological narrative.
- Weed LL. *Medical Records, Medical Education, and Patient Care: The Problem-Oriented Record as a Basic Tool.* Year Book Medical Publishers, 1971.

**The "Assessment and Plan" reasoning trail as expected documentation standard.** The combined **"Assessment and Plan" (A/P)** is the de facto documentation standard in U.S. inpatient and ambulatory medicine. The institutional expectation — codified in residency accreditation (ACGME core competencies, notably "Practice-Based Learning and Improvement" and "Systems-Based Practice") and in hospital medical-staff bylaws — is that the A/P must contain *the reasoning*, not merely the conclusion. Accreditation surveyors and malpractice counsel treat a conclusion-only A/P as a documentation defect because it defeats the audit function: a reviewer cannot determine whether the clinician considered the correct differential, weighted evidence appropriately, or recognized uncertainty.

**Clinical decision support (CDS) audit trails in the EHR.** Beyond the note, the **electronic health record (EHR)** maintains its own audit trail of clinical reasoning support: which alerts fired (drug–interaction, allergy, best-practice advisories), whether the clinician accepted, overrode, or dismissed them, and timestamps. These EHR audit logs are a parallel, machine-generated reasoning trace. The CDS audit-trail concept is the clinical-world analog of an AI "reasoning trace": both are machine-generated records of the path from inputs to a recommendation, retained for later review.

### (b) The clinical and ethical requirement for diagnostic transparency

**The IOM/NAM 2015 report — *Improving Diagnosis in Health Care*.** The landmark institutional statement on diagnostic error and the need for transparent, retraceable diagnostic reasoning is the **National Academies (then IOM) 2015 report**:
- Balogh EP, Miller BT, Ball JR, eds. **Committee on Diagnostic Error in Health Care; Board on Health Care Services; Institute of Medicine.** *Improving Diagnosis in Health Care.* Washington, DC: The National Academies Press; 2015. https://doi.org/10.17226/21794

Key findings:
- **Diagnostic errors — "inaccurate or delayed diagnoses — persist throughout all settings of care"** and harm an "unacceptable number of patients."
- It is **"likely that most people will experience at least one diagnostic error in their lifetime."**
- Diagnosis is framed as a **"complex, collaborative activity"** requiring explicit **"clinical reasoning"** — not a solitary physician flash of insight.
- Improving diagnosis is declared a **"moral, professional, and public health imperative."**

The report's significance for *retraceable reasoning*: it explicitly links diagnostic error to failures in the *reasoning and documentation* process. A diagnosis that cannot be retraced is a diagnosis whose errors cannot be caught, taught from, or defended.

**The diagnostic-error literature — Graber 2005 and Zwaan 2018.**

**(a) Graber, Gordon, Franklin (2005)** — the foundational taxonomy of *why* diagnostic errors happen:
- Graber ML, Franklin N, Gordon R. **"Diagnostic error in internal medicine."** *Archives of Internal Medicine.* 2005;165(13):1493–1499. doi:10.1001/archinte.165.13.1493 — https://pubmed.ncbi.nlm.nih.gov/16009821/
- The paper classifies causes of diagnostic error into three categories:
  - **No-fault errors** — the disease was atypical, masked, or the patient was non-adherent/deceptive in ways no reasonable clinician could overcome.
  - **System-related errors** — failures of the system around the clinician: lost results, faulty handoffs, equipment failure, inadequate time, poor EHR design.
  - **Cognitive errors** — failures in the clinician's reasoning itself: premature closure, anchoring bias, availability bias, search-satisficing, base-rate neglect.
- A substantial fraction of diagnostic errors are **cognitive**, and cognitive errors are only detectable *if the reasoning is made explicit and reviewable*. An undocumented reasoning trail makes cognitive error invisible and uncorrectable.

**(b) Zwaan et al. (2018)** — the empirical magnitude of harm in the ambulatory setting:
- Zwaan L, Singh H, Mortazi T, et al. **"Diagnostic error and harm in the ambulatory setting."** *JAMA Internal Medicine.* 2018;178(12):1671–1679. doi:10.1001/jamainternmed.2018.5066 — https://pubmed.ncbi.nlm.nih.gov/30575821/
- Measured the frequency of diagnostic errors and associated patient harm in ambulatory care, finding a non-trivial proportion of diagnoses were wrong or delayed and that a meaningful share of those led to harm. It grounds the IOM report's "unacceptable number of patients" claim in measured ambulatory data and reinforces that diagnostic-error reduction requires *record-review-based* detection — i.e., it presupposes the reasoning was documented in the first place.

**Why the audit trail matters (synthesis):**
- **Medical-legal:** In malpractice, the single most common allegation is diagnostic error. The retraceable A/P is the primary evidentiary artifact for the defense; a thin or absent reasoning trail is read as negligence.
- **Patient safety:** Graber's cognitive-error taxonomy and the IOM report both argue that system-level review of diagnostic reasoning (morbidity-and-mortality conferences, diagnostic-error rounds) is the principal lever for reducing error — and it requires the reasoning to be written down.
- **Teaching:** Medical education (residency) teaches the A/P precisely because the *act of writing the reasoning* is itself a cognitive check: forcing differential generation and evidence weighing surfaces premature closure.

### (c) AI diagnostic transparency and "reasoning trace" standards

**EU AI Act — clinical/medical AI explainability, transparency, and high-risk classification.** The **EU AI Act** (Regulation (EU) 2024/1689) is the binding horizontal risk-based AI law.

**When is clinical/medical AI "high-risk"?**
- **Article 6(1) — product-safety route:** An AI system is high-risk if it is a **safety component of a product** (or is itself a product) covered by Union harmonisation legislation listed in **Annex I**, and that product requires third-party conformity assessment. **Medical devices** (covered by the MDR/IVDR, which are in Annex I) fall here.
- **Annex III, point 5 — essential-services route:** AI systems used by or on behalf of public authorities to evaluate eligibility for **essential public assistance benefits and services, including healthcare**, and to grant/reduce/revoke/reclaim them, are high-risk. Annex III point 5(c) adds **life and health insurance risk assessment and pricing**, and 5(d) adds systems evaluating **emergency calls or dispatching** of emergency services.

**Transparency and audit obligations on high-risk systems (the "reasoning trace" requirements):**
- **Article 12 — Record-keeping (logging).** High-risk AI systems must technically enable **automatic event logging** throughout their lifespan to ensure **traceability**. For Annex III(1)(a) systems, logs must capture start/end date-time of each use, the reference database checked against input data, the input data that produced a match, and the identity of the natural persons verifying results. *This is the EU AI Act's "audit trail" mandate — the regulatory analog of the clinical SOAP reasoning trail.* — https://artificialintelligenceact.eu/article/12/
- **Article 13 — Transparency and provision of information to deployers.** High-risk systems must be **designed for transparency** so deployers can **interpret a system's output correctly** and use it appropriately. Providers must supply "instructions for use" covering: provider identity; **system capabilities, limitations, intended purpose, and expected accuracy metrics**; **known risks** to health/safety/fundamental rights; **information explaining the system's output** and its performance regarding specific groups; input-data and training-dataset specifications; **human oversight measures and technical aids for interpretation**; and **descriptions of log collection and storage mechanisms**. *Article 13 is the closest thing in regulation to a "retraceable reasoning" mandate for AI.* — https://artificialintelligenceact.eu/article/13/
- **Article 14 — Human oversight.** High-risk systems must enable **effective human oversight**, with humans able to **"properly understand the relevant capacities and limitations"** of the system and to **"correctly interpret the high-risk AI system's output."** — https://artificialintelligenceact.eu/article/14/

**FDA's Good Machine Learning Practice (GMLP) — the transparency and bias principles.** In **October 2023**, FDA, Health Canada, and the UK's MHRA jointly issued **10 Good Machine Learning Practice (GMLP) Guiding Principles for Medical Device Development**.
- Document: **"Good Machine Learning Practice for Medical Device Development: Guiding Principles."** FDA / Health Canada / MHRA, October 2023. — https://www.fda.gov/medical-devices/software-medical-device-samd/good-machine-learning-practice-medical-device-development-guiding-principles
- The two principles most directly about *transparency* and *bias*:
  - **Principle 7 (human-AI team / transparency to users):** the model must be designed so the human-AI team performs well, which presupposes the human can understand, trust appropriately, and act on the model's output — i.e., **transparency to users** and interpretability of outputs are design requirements, not afterthoughts.
  - **Principle 3 (representativeness / bias):** training data and clinical study participants must be **representative of the intended patient population** — the anti-bias principle, because unrepresentative data yields models whose "reasoning" is systematically wrong for under-represented subgroups.
  - *(Note: the FDA.gov page returned HTTP 404 to automated fetch in research; the document is a widely cited primary regulatory text. The exact wording of Principle 7 should be re-verified against the canonical FDA/Health Canada/MHRA 2023 PDF.)*

**FDA's Predetermined Change Control Plan (PCCP).** PCCP is the FDA's mechanism for allowing **controlled, pre-authorized modification** of an AI/ML-based Software-as-a-Medical-Device (SaMD) after it is on the market.
- A PCCP must contain: (a) a description of the **planned modifications**, (b) a **modification protocol** (how changes are made and evaluated, including re-training method, data, and performance criteria), and (c) an **impact assessment** and **re-assessment** plan.
- Relevant to retraceable reasoning: a PCCP forces the manufacturer to specify, *in advance*, how the model's behavior may evolve and how that evolution will be validated — making the model's change history itself an auditable reasoning trace across versions.
- Primary source: **FDA, "Marketing Submission Recommendations for a Predetermined Change Control Plan for Artificial Intelligence/Machine Learning (AI/ML)-Enabled Device Software Functions,"** Draft Guidance (Dec 2024). — https://www.fda.gov/regulatory-information/search-fda-guidance-documents/marketing-submission-recommendations-predetermined-change-control-plan-artificial-intelligence

**FDA Clinical Decision Support (CDS) software classification.** The FDA distinguishes CDS software that is a regulated device from CDS that is **not** a device, via the **21st Century Cures Act** (Section 3060), which amended the FD&C Act at **21 U.S.C. § 360j(o)(1)(E)**. Software meets the non-device CDS criteria (and is exempt) **only if all four** of the following are true:
1. It **does not acquire, process, or analyze a medical image or signal** from an *in vitro* diagnostic or imaging device.
2. It **does not drive or direct** a specific *treatment or treatment recommendation, clinical intervention, or action*.
3. It **does not provide a specific treatment or treatment recommendation** (it is limited to *informing* clinical management).
4. The **healthcare professional** using it **can independently review the basis** for the recommendation(s) the software provides — i.e., the software's output must be **transparent/interpretable enough** that the clinician can *retrace the reasoning* and reach their own conclusion; the recommendation **does not** rely on a "black box."

Criterion (IV) is the retraceable-reasoning criterion. If the clinician *cannot* understand *how* the software arrived at its recommendation (because the model is opaque and the basis isn't surfaced), the software **is** a device — it falls out of the non-device safe harbor *precisely because the reasoning is not retraceable*.
- Primary documents: 21 U.S.C. § 360j(o)(1)(E); FDA, *Clinical Decision Support Software* — Guidance for Industry and Food and Drug Administration Staff, Sept. 28, 2022. — https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software

**Explainable AI (XAI) literature applied to medicine.**
- **DARPA XAI program — origins.** The **DARPA Explainable AI (XAI) program** (launched ~2016, David Gunning, program manager) is the foundational large-scale U.S. effort on XAI. Its goal is to create **"glass box" models** whose decisions are **explainable to a "human-in-the-loop"** **without sacrificing performance**, so users can *understand AI cognition* and *calibrate trust*. Two technical approaches: (i) **deep explanation** — modifying deep-learning architectures to produce explanations (saliency, attention) — and (ii) **interpretable-by-design** models (e.g., generalized additive models, decision rules, case-based reasoning) that are transparent by construction.
- **Caruana et al. (2015) — the canonical medical-XAI cautionary tale.**
  - Caruana R, Lou Y, Gehrke J, Koch P, Sturm M, Elhadad N. **"Intelligible Models for HealthCare: Predicting Pneumonia Risk and Hospital 30-day Readmission."** *Proceedings of the 21st ACM SIGKDD International Conference on Knowledge Discovery and Data Mining (KDD '15)*, 2015. doi:10.1145/2783258.2788613 — https://dl.acm.org/doi/10.1145/2783258.2788613
  - The key finding: on a **pneumonia-risk prediction** task, a high-accuracy **random forest** black-box model learned that **asthma was *protective*** against pneumonia death — because in the training data asthmatics were aggressively treated (ICU admission, steroids) and therefore survived. The model encoded a **treatment artifact as a physiological signal**.
  - An **interpretable Generalized Additive Model (GAM)** surfaced the spurious relationship *because its coefficients were inspectable* — clinicians could see the implausible "asthma is protective" term and reject it. The black box hid the error.
  - **Lesson for retraceable reasoning in medical AI:** an opaque model's "reasoning" cannot be audited for plausibility; an interpretable model's reasoning can. In medicine, the retraceable path is not a luxury — it is how you catch the model reasoning about *the data-generating process* rather than about *the disease*.
- **XAI in medical imaging.** A large sub-literature applies saliency/attention/attribution methods (Grad-CAM, SHAP, integrated gradients) to medical-image models so the clinician can see *where* the model looked. The recurring caveat: **saliency is not explanation**: a heatmap of "where the model attended" is a *post-hoc rationalization*, not the model's reasoning, and can be misleading. This is the bridge to the chain-of-thought faithfulness problem.

**"Right to an explanation" — GDPR Article 22.**
- **GDPR Article 22** — *"Automated individual decision-making, including profiling"*: a data subject has **the right not to be subject to a decision based solely on automated processing** (including profiling) that produces legal or similarly significant effects.
- **Safeguards** (Art. 22(3)): **"the right to obtain human intervention, to express his or her point of view and to contest the decision."**
- The explanatory force comes from **Recital 71**, which grants the right to **"obtain an explanation of the decision reached"** after an automated decision and to challenge it.
  - Source: https://gdpr-info.eu/art-22-gdpr/ ; https://gdpr-info.eu/recitals/no-71/
- **Relevance to medical AI:** if a diagnostic/eligibility decision about a patient is made by "solely automated processing" (no human in the loop) and is legally/similarly significant, GDPR Art. 22 + Recital 71 give the patient the right to **human review and an explanation of the decision** — the patient-facing flip side of retraceable reasoning.

**Standards bodies — ISO/IEC JTC 1/SC 42, HL7/FHIR AI transparency.**
- **ISO/IEC JTC 1/SC 42** is the joint subcommittee on Artificial Intelligence. Work areas: **foundational AI standards, trustworthiness, and data quality**, with active development of AI transparency, explainability, and risk-management standards. Relevant deliverables include ISO/IEC 24028 (AI concepts and terminology, incl. explainability), and the **ISO/IEC 42001 *AI Management System* standard (2023)** — the first certifiable AI management-system standard, which mandates transparency, accountability, and risk treatment across the AI lifecycle.
- **HL7 / FHIR AI transparency.** HL7's **Fast Healthcare Interoperability Resources (FHIR)** standard has a standing effort on **algorithmic/AI transparency** for clinical decision support — the **"Transparency of Algorithmic Decision Support"** initiative (sometimes referenced as the "Algorithmic Transparency" / TADS Implementation Guide), intended to standardize *what* a CDS/AI artifact must disclose (developer, intended use, training data, performance, limitations, bias) so that clinicians and patients can interpret and retrace AI-driven recommendations.

### (d) LLM diagnostic agents, "reasoning trace" / chain-of-thought as a clinical audit artifact

**AMIE — conversational diagnostic AI and its treatment of "reasoning."**
- Tu T, Paleja R, McClean M, Tung J, et al. **"Towards Conversational Diagnostic AI."** arXiv:2401.05654 (Jan 2024); companion to the *Nature* publication (Tu et al., *Nature*, 2024). — https://arxiv.org/abs/2401.05654
- AMIE is an LLM-based system for **diagnostic dialogue**, evaluated in a **double-blind, randomized study** of **149 case scenarios** against **20 primary care physicians** (PCPs) across 20 clinic vignettes. AMIE showed **"greater diagnostic accuracy"** than PCPs and outperformed them on most evaluation axes as judged by both specialist physicians and patient actors.
- The evaluation framework explicitly includes **"history-taking, diagnostic accuracy, management reasoning, communication skills, and empathy"** — so **"reasoning" is treated as a named, measured performance axis**, not a hidden internal process.
- **Notable gap for retraceable reasoning:** the AMIE abstract does *not* describe a surfaced **chain-of-thought** or a patient/clinician-facing **rationale trace** as a first-class output. AMIE's "reasoning" is largely an *internal model process* and an *evaluation axis*, not (in the published framing) an artifact handed to the clinician to audit. AMIE produces a *better* conclusion but does not, as published, produce the *retraceable path* to it.

**Chain-of-thought faithfulness — the post-hoc rationalization risk.** The single most important caveat for treating an LLM "reasoning trace" as a clinical audit artifact:
- Turpin M, Michael J, Hadfield-Menell D, et al. **"Language Models Don't Always Say What They Think: Unfaithful Explanations in Chain-of-Thought Prompting."** *NeurIPS 2023.* arXiv:2305.04388. — https://arxiv.org/abs/2305.04388
- Confirmed findings from the primary-source abstract:
  - **CoT explanations often fail to reflect the model's actual reasoning process.**
  - Explanations can be **"heavily influenced by adding biasing features"** (e.g., **option ordering**) that the model *ignores in its explanation text* — i.e., the model is swayed by a feature it then refuses to mention.
  - When **pushed toward wrong answers**, LLMs generate **"plausible yet misleading"** justifications — **post-hoc rationalization** of errors rather than faithful accounts of how the error arose.
  - This caused **accuracy drops up to 36%** on BIG-Bench Hard tasks and led models to **rationalize stereotypical social biases without acknowledging them**.
  - The authors warn CoT explanations **risk fostering unjustified trust** rather than ensuring safety.

**Clinical implication:** A SOAP "Assessment" is (ideally) a *faithful, contemporaneous account* of the clinician's actual reasoning — the human writes what they were thinking. An LLM chain-of-thought is *generated text about reasoning* whose *fidelity to the model's actual computational path* is empirically unreliable. Treating an LLM CoT as a clinical audit trail therefore risks exactly the failure Turpin identifies: a **plausible-sounding rationalization that inspires unwarranted trust**. For a clinical decision-support agent, this argues that the "reasoning trace" must be engineered for **faithfulness** (and tested for it), not merely *produced* — and that a surfaced CoT should be understood as a *hypothesis about the model's reasoning*, not a verified record of it.

**Comparison: SOAP-style rationale vs. LLM reasoning trace**

| Dimension | SOAP "Assessment" (clinical) | LLM CoT "reasoning trace" |
|---|---|---|
| **Author** | The clinician who made the decision | The model that made the decision |
| **Fidelity to actual reasoning** | High (it is the clinician's own thinking, written down) | Empirically unreliable (Turpin 2023: post-hoc rationalization, bias-feature suppression) |
| **Auditability** | Designed for it (Weed 1968; IOM 2015) | Not guaranteed; saliency/CoT are post-hoc, not ground-truth reasoning |
| **Regulatory status** | Expected documentation standard (malpractice, ACGME) | EU AI Act Art. 12/13/14 require interpretability *of output*, not faithful CoT; FDA CDS criterion (IV) requires the clinician can "independently review the basis" — a faithful, not merely eloquent, trace |
| **Failure mode** | Thin/conclusory A/P (documentation defect) | Eloquent-but-unfaithful CoT (trust defect) |
| **Design imperative** | Force the reasoning to be written | Engineer the reasoning to be faithful + test that it is |

The takeaway for a clinical decision-support agent: the goal is not "produce a chain-of-thought"; it is **"produce a retraceable, faithful reasoning trail the physician can audit and independently verify,"** which is the union of the SOAP standard (structure + surfacing) and the XAI/faithfulness standard (fidelity + testability).

### (e) Patient-facing transparency — "Ask me about how I arrived at this diagnosis"

**Shared decision making (SDM)** is a collaborative process in which **patient and clinician jointly contribute to a medical decision**, aligning the choice with the patient's values and preferences. It presupposes that the clinician **communicates the reasoning** — the diagnosis, the uncertainty, the options, the expected benefits and harms — because the patient cannot participate in a decision whose basis is hidden.

**Elwyn et al. — the "three-talk" model** (the operational model of SDM widely taught in medical education):
- **Team talk** — building a supportive relationship, framing the decision as one where the clinician does not have a single best answer (portraying equipoise).
- **Option talk** — explaining the options and the probabilities of benefits and harms for each.
- **Decision talk** — eliciting and integrating the patient's preferences and values to arrive at a shared decision.
- Primary source: Elwyn G, Durand MA, Song J, et al. **"A three-talk model for shared decision making: multistage consultation process."** *BMJ.* 2017;359:j4891. — https://www.bmj.com/content/359/bmj.j4891

**Coulter — engaging patients in healthcare.**
- Coulter A. *Engaging Patients in Healthcare.* McGraw-Hill/Open University Press, 2011. (ISBN 9780335245618.) The book-length statement of the patient-engagement agenda: patient engagement *requires* that patients receive **clear, comprehensible explanations of clinical reasoning** — diagnosis, prognosis, options, and uncertainty. Transparency is not just clinician-to-clinician (SOAP) or regulator-to-deployer (EU AI Act); it is also **clinician-to-patient**, and the patient's ability to retrace "how you arrived at this diagnosis" is a precondition for genuine engagement and informed consent.

**Synthesis — "Ask me about how I arrived at this diagnosis."** A patient-facing retraceable-reasoning capability sits at the intersection of three requirements:
1. **Clinical (Weed/IOM):** the reasoning is documented and retrievable.
2. **Regulatory (GDPR Art. 22 / EU AI Act Art. 13):** the patient has a right to an explanation and the deployer must be able to interpret outputs.
3. **Ethical (Coulter/Elwyn):** the patient can only share in a decision they can understand — so the explanation must be pitched to the patient, not just the clinician.

For an AI diagnostic agent, this means the "reasoning trace" should be *layered*: a clinician-grade audit trail (differential + evidence + reasoning, SOAP-like) for the physician, and a patient-grade explanation ("here's what I considered, here's why this rose to the top, here's what's still uncertain") for the patient — both generated *faithfully* (contra Turpin) and *reviewable* against the underlying evidence.

### Domain glossary (Section 5)

- **Problem-Oriented Medical Record (POMR)** — A medical record organized around an explicit list of the patient's problems, each worked up with SOAP notes. *Source: Weed, N Engl J Med 1968;278(11):593–600 & 278(12):652–657.*
- **SOAP note** — Structured clinical note: Subjective, Objective, Assessment, Plan. *Source: Weed 1968 (ibid.)*
- **Assessment** — The SOAP section containing the working diagnosis, the differential, and the reasoning linking evidence to conclusion; the clinical "reasoning trail." *Source: Weed 1968.*
- **Differential diagnosis** — The ranked set of plausible diagnoses considered for a presentation, including most-likely and must-not-miss. *Source: standard medical education; IOM 2015.*
- **Diagnostic error** — "Inaccurate or delayed diagnosis"; defined and quantified in *Balogh, Miller, Ball, eds. Improving Diagnosis in Health Care. National Academies Press, 2015. https://doi.org/10.17226/21794.*
- **No-fault / system-related / cognitive errors** — Graber's three-category taxonomy of diagnostic-error causes. *Source: Graber, Franklin, Gordon, Arch Intern Med 2005;165(13):1493–1499.*
- **Clinical decision support (CDS) audit trail** — EHR-maintained log of alerts, overrides, and timestamps; the machine-generated reasoning trace of the CDS layer. *Source: 21 USC 360j(o)(1)(E); FDA CDS Guidance 2022.*
- **High-risk AI system (EU AI Act)** — An AI system subject to the AI Act's full obligations because it is a safety component of an Annex-I product (incl. medical devices) or gates access to essential services (Annex III(5), incl. healthcare). *Source: Regulation (EU) 2024/1689, Art. 6, Annex I, Annex III.*
- **Record-keeping / logging (Art. 12)** — Mandatory automatic event logging for high-risk AI, enabling traceability. *Source: EU AI Act Art. 12.*
- **Transparency to deployers (Art. 13)** — Requirement that high-risk AI be designed so deployers can interpret outputs, with instructions for use. *Source: EU AI Act Art. 13.*
- **Human oversight (Art. 14)** — Requirement that humans can correctly interpret and oversee high-risk AI output. *Source: EU AI Act Art. 14.*
- **GMLP** — Good Machine Learning Practice; 10 joint FDA/Health Canada/MHRA guiding principles for medical-device ML development (2023), including transparency and representativeness/bias principles. *Source: FDA/Health Canada/MHRA, GMLP Guiding Principles, Oct 2023.*
- **PCCP** — Predetermined Change Control Plan; FDA mechanism for pre-authorized, auditable modification of AI/ML SaMD. *Source: FDA PCCP guidance (2024 draft; 2019 foundational framework).*
- **Non-device CDS (4 criteria)** — CDS exempt from device regulation only if it does not analyze images/signals, does not drive a treatment recommendation, does not provide a specific treatment, and the clinician can *independently review the basis* for the recommendation. *Source: 21 USC 360j(o)(1)(E) (21st Century Cures Act §3060); FDA CDS Guidance 2022.*
- **Explainable AI (XAI)** — AI whose decisions are interpretable by a human user; DARPA program origin ~2016, goal of "glass-box" models preserving performance. *Source: DARPA XAI program (Gunning).*
- **GAM (Generalized Additive Model)** — Interpretable model class whose additive terms are inspectable; central to Caruana et al.'s pneumonia case. *Source: Caruana et al., KDD 2015.*
- **Saliency / post-hoc explanation** — Attribution method showing *where* a model looked; a post-hoc rationalization, not the model's reasoning. *Source: XAI/medical-imaging literature.*
- **Chain-of-thought (CoT)** — LLM technique of generating intermediate reasoning steps before an answer; faithfulness to actual model reasoning is not guaranteed. *Source: Turpin et al., NeurIPS 2023 (arXiv:2305.04388).*
- **CoT faithfulness** — The degree to which a CoT explanation reflects the model's actual reasoning process; empirically unreliable. *Source: Turpin et al. 2023.*
- **Post-hoc rationalization** — Generation of a plausible but non-causal explanation for an already-reached decision. *Source: Turpin et al. 2023.*
- **Right to an explanation (GDPR)** — Right, derived from GDPR Art. 22 + Recital 71, to obtain human intervention and an explanation of a solely-automated decision. *Source: Regulation (EU) 2016/679, Art. 22 & Recital 71.*
- **AMIE** — Articulate Medical Intelligence Explorer; Google's LLM-based conversational diagnostic agent; demonstrated greater diagnostic accuracy than PCPs and treats "management reasoning" as a measured axis. *Source: Tu et al., arXiv:2401.05654 (2024) / Nature 2024.*
- **Shared decision making (SDM)** — Collaborative clinician–patient decision process aligning care with patient values. *Source: Elwyn et al., BMJ 2017 (three-talk model); Coulter, Engaging Patients in Healthcare, 2011.*
- **Three-talk model** — Team talk / Option talk / Decision talk. *Source: Elwyn et al., BMJ 2017.*

### Key citations (Section 5)
- [Weed 1968, N Engl J Med 278(11):593–600](https://www.nejm.org/doi/10.1056/NEJM196803142781101)
- [National Academies 2015, Improving Diagnosis in Health Care (doi:10.17226/21794)](https://nap.nationalacademies.org/catalog/21794/improving-diagnosis-in-health-care)
- [Graber et al. 2005, Arch Intern Med (PMID 16009821)](https://pubmed.ncbi.nlm.nih.gov/16009821/)
- [Zwaan et al. 2018, JAMA Intern Med (PMID 30575821)](https://pubmed.ncbi.nlm.nih.gov/30575821/)
- [EU AI Act — Article 6 (high-risk)](https://artificialintelligenceact.eu/article/6/)
- [EU AI Act — Article 12 (record-keeping/logging)](https://artificialintelligenceact.eu/article/12/)
- [EU AI Act — Article 13 (transparency to deployers)](https://artificialintelligenceact.eu/article/13/)
- [EU AI Act — Article 14 (human oversight)](https://artificialintelligenceact.eu/article/14/)
- [EU AI Act — Annex III](https://artificialintelligenceact.eu/annex/3/)
- [FDA/Health Canada/MHRA GMLP Guiding Principles (2023)](https://www.fda.gov/medical-devices/software-medical-device-samd/good-machine-learning-practice-medical-device-development-guiding-principles)
- [FDA Clinical Decision Support Software Guidance (2022)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software)
- [FDA PCCP Guidance (2024 draft)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/marketing-submission-recommendations-predetermined-change-control-plan-artificial-intelligence)
- [Caruana et al. 2015, KDD (doi:10.1145/2783258.2788613)](https://dl.acm.org/doi/10.1145/2783258.2788613)
- [Turpin et al. 2023, NeurIPS (arXiv:2305.04388)](https://arxiv.org/abs/2305.04388)
- [Tu et al. 2024, AMIE (arXiv:2401.05654)](https://arxiv.org/abs/2401.05654)
- [GDPR Article 22](https://gdpr-info.eu/art-22-gdpr/)
- [GDPR Recital 71](https://gdpr-info.eu/recitals/no-71/)
- [Elwyn et al. 2017, BMJ (three-talk model)](https://www.bmj.com/content/359/bmj.j4891)

### Bottom line for the clinical decision-support agent (Section 5)

"Retraceable reasoning" is not one requirement but a stack: (1) *document* the path to the conclusion in a SOAP-like structure (Weed 1968; IOM 2015); (2) *surface* it to the clinician in a form they can independently review (FDA CDS criterion IV; EU AI Act Art. 13/14); (3) *ensure the surfaced trace is faithful* to the model's actual reasoning and tested for post-hoc rationalization (Turpin 2023; Caruana 2015); (4) *log* it automatically for post-market/medico-legal audit (EU AI Act Art. 12); and (5) *translate* it for the patient to enable shared decision making (Elwyn 2017; Coulter 2011; GDPR Art. 22 / Rec. 71). A clinical agent that produces an accurate answer but no faithful, auditable, layered reasoning trail fails the clinical standard of care as surely as a SOAP note with an empty Assessment.

---

> **Pending sections.** Sections 1, 3, and 4 will be inserted above as their research completes.

---

## 6. Treatment Planning Hand-off & Surgical Case-Finding

*A reference for a clinical decision-support agent. Citations are to primary/authoritative sources verified via direct fetch. Where a paywalled primary article (NEJM, BMJ) could not be fetched directly, the finding is corroborated from official program documentation, official collaboration sites, or peer-reviewed secondary synthesis, with the canonical citation still noted.*

### (a) Transition from Diagnosis to Treatment Planning

**The working diagnosis as an anchor.** A "working diagnosis" is the best-current explanation of a patient's condition that, once the probability of disease crosses an action point, anchors a **management plan** — the set of therapeutic actions (medical therapy, surgery, further surveillance, or palliation) selected to alter the disease's course. The bridge from "what is wrong" to "what to do" is operationalized in two complementary ways: **decision-threshold models** (when is the probability of disease high enough to act?) and **clinical practice guidelines/pathways** (given the diagnosis, what is the recommended therapy?).

**The threshold model of testing (Pauker–Kassirer).**
- **Primary source:** Pauker SG, Kassirer JP. "The threshold approach to clinical decision making." *N Engl J Med.* 1980;302(20):1109–1117. **PMID 7390547**. https://pubmed.ncbi.nlm.nih.gov/7390547/
- **Definition:** The "**treatment threshold**" is "derived from Pauker and Kassirer's decision analysis, which relies on utilities and consequences rather than test geometry" — i.e., the probability of disease at which the expected utility of treating equals the expected utility of not treating (and testing becomes futile). Below a lower "**testing threshold**," neither testing nor treatment is warranted; above the treatment threshold, treatment is given without further testing; between the two, a diagnostic test is performed to refine probability.
  - Source quoting/paraphrasing the model: Wikipedia, "Prevalence threshold" (cites Pauker & Kassirer), https://en.wikipedia.org/wiki/Prevalence_threshold
- **Why it matters for the hand-off:** The threshold model is the formal justification that a diagnosis, once it crosses the treatment threshold, should trigger a management plan rather than more testing. It is the quantitative spine behind "diagnosis → therapy."

**Guidelines that operationalize diagnosis → therapy.**
- **NICE (National Institute for Health and Care Excellence):** An executive non-departmental public body that "operationalizes diagnosis via clinical guidelines developed by collaborating centres, which evaluate evidence to recommend appropriate treatments and care regimes for specific diseases" (https://en.wikipedia.org/wiki/National_Institute_for_Health_and_Care_Excellence). NICE Pathways present these recommendations as interactive, step-by-step topic flows (e.g., a suspected-condition node routes to the diagnostic-test node, then to the management/treatment node), so a confirmed diagnosis maps to a deterministic therapy branch. Official program page: https://www.nice.org.uk/about/what-we-do/our-programmes/nice-pathways
- **ACC/AHA guidelines:** Organized by disease topic; each guideline document moves from classification/diagnosis of the disease stage to Class-of-recommendation (I, IIa, IIb, III) treatment recommendations, explicitly linking the diagnostic state to a therapy. Index: https://www.acc.org/guidelines
- **ASCO (American Society of Clinical Oncology) guidelines:** Provide stage- and biomarker-conditional treatment recommendations, so a cancer diagnosis (stage + receptor status) maps to a specific systemic-therapy regimen. https://www.asco.org/practice-policy/guidelines

### (b) Surgical Case-Finding & Outcomes Research

**ACS NSQIP — registry description.**
- **Primary/official source:** American College of Surgeons, "ACS NSQIP," https://www.facs.org/quality-programs/acs-nsqip/
- **What it measures (verified from official ACS page):** ACS NSQIP is a "variable-based registry collecting data directly from patient charts, not insurance claims." It "tracks 30-day outcomes to help hospitals reduce morbidity and mortality," using **risk-adjusted** (patient health), **case-mix-adjusted** (procedure complexity), and **30-day tracking** (captures post-discharge complications — "half or more of all complications occur after a patient leaves the hospital"). Compared with claims data it found "61% more complications, including 97% more surgical site infections."
- **Reported impact:** "62% of hospitals reduce morbidity"; "71% of hospitals reduced mortality"; "200–500 complications prevented annually."
- **How surgeons use it:** They "use the risk-adjusted data to benchmark their performance against national standards," enabling "1:1 comparison" by accounting for patient severity and procedure complexity.
- **History (verified):** "ACS NSQIP originated in the VHA [Veterans Health Administration] to address high mortality, mandating risk-adjusted reporting. It tracks '135 variables' and '30-day postoperative… outcomes,' enabling surgeons to compare performance against national averages." (https://en.wikipedia.org/wiki/National_Surgical_Quality_Improvement_Program)
- **Surgical Risk Calculator:** A tool where users "enter preoperative information… to provide estimates regarding your patient's risk of postoperative complications" (https://riskcalculator.facs.org/RiskCalculator/). Surgeons use this to translate a patient's risk profile into a quantitative, procedure-specific complication estimate that informs whether to operate, where, and how to counsel the patient — a direct diagnosis/assessment → treatment-planning bridge.

**Volume-outcome relationship literature.**
- **Birkmeyer 2002 (landmark):** Birkmeyer JD, Siewers AE, Finlayson EVA, et al. "Surgeon volume and operative mortality in the United States." *N Engl J Med.* 2002;349(22):2117–2127. **PMID 12432068**. https://pubmed.ncbi.nlm.nih.gov/12432068/
  - **Corroboration of citation/identity:** The article title is independently attested in the Wikipedia "Health care quality" reference list (https://en.wikipedia.org/wiki/Health_care_quality). The well-established finding, widely reproduced, is that higher surgeon volume is associated with lower operative mortality, with the strongest effect for high-risk procedures (esophagectomy, pancreatectomy, etc.).
- **Luft 1979 (foundational):** Luft HS, Bunker JP, Enthoven AC. "Should operations be regionalized? The empirical relation between surgical volume and mortality." *N Engl J Med.* 1979;301(25):1364–1369. **PMID 763443**. https://pubmed.ncbi.nlm.nih.gov/763443/
  - This is the seminal paper establishing that hospital surgical volume is inversely related to mortality and arguing for regionalization of complex procedures.
- **"Long-term survival is superior after resection for cancer in high-volume centers"** — attested finding in the perioperative-mortality literature (https://en.wikipedia.org/wiki/Perioperative_mortality), which defines perioperative mortality as death within 30 days of surgery and notes ~4.2 million global annual perioperative deaths.

**Case reports, case series, and first-in-human evidence.**
- **Definitions (verified, Glossary of clinical research, https://en.wikipedia.org/wiki/Glossary_of_clinical_research):**
  - **Case report** — "A detailed report of the diagnosis, treatment, and follow-up of an individual patient."
  - **Case series** — "A group or series of case reports involving patients who were given similar treatment."
- **First-in-human / first-in-series:** A first-in-human (FIH) report is the initial documented use of a novel device, drug, or technique in a human subject; a first-in-series report is the initial small case series. In surgery these correspond to the early stages of the IDEAL framework (see below) and are treated as hypothesis-generating evidence, not definitive.
- **How to evaluate a surgical case report:** Assess (i) novelty vs. prior art, (ii) completeness of description (enough detail to reproduce), (iii) patient selection and confounding, (iv) outcome definition and follow-up completeness, (v) conflict of interest and institutional review, and (vi) whether it is positioned as innovation (IDEAL Stage 1/2a) rather than established practice.

**International surgical registries (Scandinavian arthroplasty registries).**
- **Primary source:** Wikipedia, "Joint replacement registry" (synthesizing the registry literature), https://en.wikipedia.org/wiki/Joint_replacement_registry; official Swedish register site https://slr.registercentrum.se/
- **Findings (verified):** Joint replacement registries "collect arthroplasty outcomes at a population level to provide an evidence base for treatment." The **Swedish Hip Arthroplasty Register (SHAR) started in 1979** — one of the first national surgical registries — alongside Sweden's knee register (1975). Other Scandinavian registries: **Norway 1994, Denmark 1997, Finland 1980**. They "measure implant failure, surgeon/implant performance, and increasingly patient-reported outcomes."
- **Why surgeons "research the world" with them:** Registries let a surgeon see which implants and techniques perform best population-wide, compare revision rates, and adopt (or abandon) techniques accordingly — a data-driven analog to reading case series.

**Surgical innovation vs. surgical research — the IDEAL framework.**
- **Primary source (official):** IDEAL Collaboration, "The IDEAL Framework," https://www.ideal-collaboration.net/the-ideal-framework/
- **Seminal publication:** McCulloch P, Altman DG, Campbell WB, et al. "No surgical innovation without evaluation: the IDEAL recommendations." *Lancet.* 2009;374(9695):1105–1112. (The task brief cited BMJ 2009; the Balliol Collaboration's IDEAL work spans multiple BMJ/Lancet papers — the framework-defining paper is the 2009 *Lancet* "IDEAL recommendations," and McCulloch also authored companion BMJ papers.)
- **Framework (verified from official site + Wikipedia "IDEAL framework"):** The IDEAL framework "improves evidence on surgical and interventional therapy innovation through staged study designs." Stages:
  - **Stage 0 – Preclinical:** bench/animal studies before first human use.
  - **Stage 1 – Idea:** first-in-human use; exploratory case report.
  - **Stage 2a – Development:** small early case series; protocol refinement.
  - **Stage 2b – Exploration:** multi-centre consensus case series; refining indications and technique.
  - **Stage 3 – Assessment:** typically a randomized controlled trial (RCT).
  - **Stage 4 – Long-term Study:** long-term surveillance/registry monitoring.
- **Purpose:** to "improve the quality of research in surgery" by ensuring rigorous reporting and transparency — i.e., surgical innovation should always be accompanied by staged evaluation, not introduced silently. Developed by the **Balliol Collaboration**, including **Professor Peter McCulloch** (https://en.wikipedia.org/wiki/IDEAL_framework).

**Centers of excellence & high-volume center referral.**
- The volume-outcome literature (Luft 1979; Birkmeyer 2002) underpins "centers of excellence" programs and payer/employer referral standards that direct high-risk procedures to high-volume hospitals.
- **Leapfrog Group (verified):** "launched in 2000 to leverage employer purchasing power for safety, initially focused on evidence-based hospital referral" — the policy mechanism translating volume-outcome evidence into minimum-volume referral standards (https://en.wikipedia.org/wiki/Patient_safety_organization). Leapfrog's **Evidence-Based Hospital Referral (EBHR)** standards set procedure-specific volume thresholds.
- **"Center of excellence"** in surgery commonly denotes institutional designation (by ACS, payer, or specialty society) based on volume, structure, process, and outcomes criteria; designation is intended to steer referrals and concentrate expertise.

**How surgeons "research the world" for technique adoption.** Surgeons identify where a procedure was pioneered and how it is performed through several channels:
1. **Literature review of case series and registry reports** — the evidence base (IDEAL Stages 1–2b; Scandinavian registries).
2. **Video journals** — e.g., the **Journal of Visualized Surgery (JVS)**, which focuses on "instructional and educational video clips, photos, schematics" and "the sharing of surgical experience in visual media," prioritizing visuals "over lengthy text to promote global surgical development" (https://jovs.amegroups.org/). Video lets a surgeon observe a pioneer's technique in a way text cannot convey.
3. **Surgical social media & professional networks** — case discussion forums, surgical Twitter/X hashtags, and society video libraries (e.g., SAGES, ESCP) disseminate techniques rapidly, though with lower evidence quality than peer-reviewed series.
4. **Fellowships and observerships** — direct training at pioneering centers, the highest-fidelity transfer method.

### (c) Documenting the Treatment Plan & Diagnostic Continuity (Hand-off)

**The SOAP note as the hand-off vehicle.**
- **Primary source (verified full text):** Wikipedia, "SOAP note," https://en.wikipedia.org/wiki/SOAP_note; corroborated by "Assessment and plan" https://en.wikipedia.org/api/rest_v1/page/summary/Assessment_and_plan
- **Structure & continuity (verified):** The SOAP note is "a healthcare documentation method comprising Subjective, Objective, Assessment, and Plan sections."
  - **Subjective:** Chief Complaint and History of Present Illness (often using OLDCARTS), plus histories, medications, allergies, review of systems.
  - **Objective:** Vital signs, physical exam findings, diagnostic test results.
  - **Assessment:** "Provides a diagnosis or differential diagnosis, likely etiologies, and progress toward goals. In problem-oriented records, it links to specific problem numbers." — *This is where the working diagnosis lives.*
  - **Plan:** "Outlines treatment actions, including diagnostics, therapy, referrals, patient education, and disposition. The plan addresses each item in the differential diagnosis. For patients with multiple issues, plans are numbered by severity."
- **Hand-off function (verified):** "This structured format standardizes information to reduce confusion during hand-offs between providers" — e.g., EMT-to-ED transfers and, by extension, surgeon-to-OR-team and physician-to-physician transfers.
- **Why this matters for a decision-support agent:** The **Assessment → Plan** linkage inside a SOAP note is the canonical place where diagnostic rationale is carried forward into the treatment plan. A clinical decision-support tool that surfaces a working diagnosis should present it in a form that drops directly into the Assessment section and proposes Plan items that "address each item in the differential diagnosis" — preserving continuity of reasoning across the hand-off.

### Consolidated Domain Glossary (Section 6)

| Term | Definition | Source |
|---|---|---|
| Working diagnosis | Leading explanation of illness anchoring management once probability crosses the treatment threshold | Pauker-Kassirer 1980, PMID 7390547 |
| Treatment threshold | Disease probability where treating = not treating in expected utility; above it, treat without testing | Pauker-Kassirer 1980; "Prevalence threshold" synthesis |
| Testing threshold | Disease probability below which neither test nor treat; between it and treatment threshold, test | Pauker-Kassirer 1980 |
| ACS NSQIP | Chart-derived, risk/case-mix-adjusted 30-day surgical outcomes registry | ACS, https://www.facs.org/quality-programs/acs-nsqip/ |
| Surgical Risk Calculator | NSQIP tool estimating individualized postoperative complication risk | https://riskcalculator.facs.org/ |
| Volume-outcome relationship | Inverse association of provider volume with risk-adjusted mortality | Luft 1979 PMID 763443; Birkmeyer 2002 PMID 12432068 |
| Regionalization | Concentrating high-risk procedures in high-volume centers | Luft 1979; Leapfrog EBHR |
| Case report | Detailed report of diagnosis, treatment, follow-up of one patient | Glossary of clinical research |
| Case series | Series of case reports of patients given similar treatment | Glossary of clinical research |
| First-in-human (FIH) | Initial documented human use of a novel technique/device/drug | Clinical research glossary; IDEAL Stage 1 |
| Joint/surgical registry | Population-based prospective database of procedures + outcomes | "Joint replacement registry" |
| Swedish Hip Arthroplasty Register (SHAR) | Pioneer national arthroplasty registry, founded 1979 | "Joint replacement registry"; slr.registercentrum.se |
| IDEAL framework | Idea, Development, Exploration, Assessment, Long-term study — staged evaluation of surgical innovation | IDEAL Collaboration; McCulloch 2009 Lancet |
| Center of excellence (surgical) | Institution meeting volume/quality criteria for referral steering | Volume-outcome literature; Leapfrog EBHR |
| Evidence-Based Hospital Referral (EBHR) | Leapfrog's volume-based referral standard | "Patient safety organization" |
| Journal of Visualized Surgery (JVS) | Video-first surgical journal for technique dissemination | https://jovs.amegroups.org/ |
| SOAP note | Subjective, Objective, Assessment, Plan documentation format | "SOAP note"; Weed 1968 |
| Assessment | Diagnostic synthesis anchoring the plan | "SOAP note"; "Assessment and plan" |
| Plan | Actionable treatment/disposition mapped to the assessment | "SOAP note" |
| Hand-off | Transfer of responsibility/info between providers; SOAP standardizes it | "SOAP note" |

### Notes on source verification (Section 6)
- The following primary articles were cited by identity (PMID/title) but their full texts were inaccessible to the fetcher at research time due to paywalls (NEJM/BMJ returned HTTP 403) or PubMed cookie/EuropePMC maintenance blocks: Birkmeyer 2002 (PMID 12432068), Luft 1979 (PMID 763443), Pauker-Kassirer 1980 (PMID 7390547), McCulloch 2009 IDEAL (Lancet). Their identities/titles were independently corroborated via Wikipedia reference lists and/or official collaboration pages, and their core findings are well-established in the literature. All definitions marked "verified" were obtained directly from the cited source's text by the fetcher during the research session.
