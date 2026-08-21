# Research Cluster B: The Clinical and Ethical Requirement for Diagnostic Transparency

## Why an Audit Trail Matters for Medical-Legal, Patient Safety, and Teaching

> **Scope note.** This supplements `ddx-process.md` Section 5 (retraceable reasoning / explainability) with the patient-safety, medical-legal, and teaching rationale for a diagnostic audit trail — the evidence base for Arbor's retraceable decision-tree design. Compiled by a background research subagent against primary sources (PubMed PMIDs verified via NCBI E-utilities).

---

## Mini-Glossary of Key Terms

**Diagnostic error** (NAM 2015 definition): "the failure to (a) establish an accurate and timely explanation of the patient's health problem(s) or (b) communicate that explanation to the patient." This definition is deliberately patient-centered — it encompasses both the failure to arrive at the correct diagnosis and the failure to communicate it.

**No-fault error** (Graber 2005): Diagnostic errors where the underlying disease was truly unknowable or unpredictable at the time — e.g., an atypical presentation of a rare disease, or a patient who deliberately misleads. In Graber's 100-case series, 7 cases reflected no-fault errors alone.

**System error** (Graber 2005): Diagnostic errors attributable to failures in the healthcare delivery system — problems with policies and procedures, inefficient processes, teamwork breakdowns, and communication failures. Contributed in 65% of cases.

**Cognitive error** (Graber 2005): Diagnostic errors stemming from flaws in the clinician's clinical reasoning — faulty synthesis, premature closure, faulty context generation, misjudging salience, faulty perception, and heuristic errors. Contributed in 74% of cases.

**Dual process theory** (Croskerry 2009): A model of clinical reasoning positing two systems of decision-making: **System 1** (heuristic, intuitive, fast, pattern-recognition-based) and **System 2** (systematic, analytical, slow, deliberate). Diagnostic errors can arise from over-reliance on System 1 or failures in System 2.

**Diagnostic delay**: A subset of diagnostic error where the correct diagnosis is eventually made but after a clinically meaningful delay, during which harm may accrue from delayed or absent treatment.

**Missed opportunity** (Singh et al.): A "missed opportunity to make a timely or correct diagnosis based on available evidence" — used as a practical, chart-review-confirmable definition of diagnostic error, particularly in outpatient settings.

**Problem representation (PR) / "one-liner"** (Clary 2026, PMID 42049678): a concise synthesis of clinical information that captures the core diagnostic problem in one statement; central to diagnostic reasoning, communication, and patient safety. The act of forming it activates illness scripts and supports hypothesis generation — exactly what Arbor's hypothesis-engine prompt instructs.

**Diagnostic adverse event (DAE)** (Zwaan 2010): Patient harm resulting from a diagnostic error, as identified through structured patient record review.

---

## 1. The IOM/NAM 2015 Report: "Improving Diagnosis in Health Care"

### Primary Source

- **Title:** *Improving Diagnosis in Health Care*
- **Committee:** Committee on Diagnostic Error in Health Care; Chair: John R. Ball, M.D., J.D. (21+ committee members, including Patrick Croskerry)
- **Publisher:** The National Academies Press (Washington, DC)
- **Year:** 2015
- **URL:** https://nap.nationalacademies.org/catalog/21794/improving-diagnosis-in-health-care

### Key Findings

#### Scale of Diagnostic Error

The report states a **conservative estimate that "5 percent of U.S. adults who seek outpatient care each year experience a diagnostic error."** This figure derives from Singh, Meyer, and Thomas 2014 (PMID 24742777), who synthesized three large observational studies and found a combined outpatient diagnostic error rate of **5.08%, or approximately 12 million U.S. adults every year**, estimating that about half could potentially be harmful.

The report's Preface states: **"Yet the best estimates indicate that all of us will likely experience a meaningful diagnostic error in our lifetime."**

Postmortem research cited in the report shows diagnostic errors contribute to **"approximately 10 percent of patient deaths."**

The report characterizes improving diagnosis as **"a moral, professional, and public health imperative."**

#### Definition of Diagnostic Error

The report's formal definition, from the patient's viewpoint: **"the failure to (a) establish an accurate and timely explanation of the patient's health problem(s) or (b) communicate that explanation to the patient."**

This definition is significant because it explicitly includes the **communication** dimension — a diagnosis that is reached but not communicated to the patient is still an error.

#### The Diagnostic Process and Documentation

The report describes diagnosis as **"a complex, collaborative activity that involves clinical reasoning and information gathering"** and emphasizes that improving this process demands **"widespread commitment and teamwork among various stakeholders."**

#### Dual Process Theory

The report includes **"Figure 2-2: The dual process model of diagnostic decision making"** in Chapter 2. In the technology chapter (Chapter 5), the report notes that experienced clinicians may need support to avoid pitfalls from **"system 1 processes"** (intuitive, heuristic), while novices may need information to support **"system 2 processes"** (analytical, deliberate).

The underlying theoretical framework draws from Croskerry's work (PMID 19669918, PMID 19638766), which describes two systems of decision-making: **System 1 (heuristic, intuitive)** and **System 2 (systematic, analytical)**.

#### Recommendations

- **Recommendation 1:** "In recognition that the diagnostic process is a dynamic team-based activity, health care organizations should ensure that health care professionals have the appropriate knowledge, skills, resources, and support to engage in teamwork in the diagnostic process."
- **Recommendation 4:** "health care professionals and organizations should partner with patients and their families as diagnostic team members and facilitate patient and family engagement in the diagnostic process, aligned with their needs, values, and preferences."
- **Recommendation 7:** "health care professionals and organizations should ensure patient access to EHRs, including clinical notes and diagnostic testing results, to facilitate patient engagement in the diagnostic process and patient review of health records for accuracy."
- The report recommends that **"health care organizations should adopt policies and practices that promote a nonpunitive culture that values open discussion and feedback on diagnostic performance."**

---

## 2. Graber et al. 2005: "Diagnostic Error in Internal Medicine"

### Primary Source

- **Title:** "Diagnostic error in internal medicine"
- **Authors:** Graber ML, Franklin N, Gordon R
- **Journal:** Archives of Internal Medicine (now JAMA Internal Medicine)
- **Year:** 2005; 165(13):1493-1499
- **DOI:** 10.1001/archinte.165.13.1493
- **PMID:** 16009864

### Key Findings

This study analyzed **100 cases of diagnostic error** involving internists, identified through autopsy discrepancies, quality assurance activities, and voluntary reports.

**Three-category taxonomy of diagnostic error:**
> "The underlying contributions to error fell into 3 natural categories: 'no fault,' system-related, and cognitive."

- **No-fault errors alone:** 7 cases
- **System-related factors:** contributed in **65% of cases** — most commonly problems with policies and procedures, inefficient processes, teamwork, and communication
- **Cognitive factors:** contributed in **74% of cases** — most commonly faulty synthesis

**Premature closure** — "the failure to continue considering reasonable alternatives after an initial diagnosis was reached" — was the **single most common cause** of cognitive error.

Other common cognitive causes included: faulty context generation, misjudging the salience of findings, faulty perception, and errors arising from the use of heuristics. Faulty or inadequate knowledge was uncommon.

**Severity:** 90 cases involved injury, including 33 deaths.

**Conclusion:** "Diagnostic error is commonly multifactorial in origin, typically involving both system-related and cognitive factors."

> **Note on the "Going Beyond No-Fault or Blame" paper.** A Graber 2005 editorial "Diagnostic error: going beyond the 'no-fault' or 'blame' approach" in *Virtual Mentor* (now AMA Journal of Ethics) is not indexed on PubMed. The Archives of Internal Medicine paper (PMID 16009864) contains the same three-category taxonomy and is the primary cited source.

---

## 3. Zwaan et al.: Diagnostic Error Prevalence and Causes

### Primary Source A: Zwaan et al. 2010 (Arch Intern Med)

- **Title:** "Patient record review of the incidence, consequences, and causes of diagnostic adverse events"
- **Authors:** Zwaan L, de Bruijne M, Wagner C, Thijs A, Smits M, van der Wal G, Timmermans DR
- **Journal:** Archives of Internal Medicine
- **Year:** 2010; 170(12):1015-1021
- **DOI:** 10.1001/archinternmed.2010.146
- **PMID:** 20585065

**Key findings:**
- **Diagnostic AEs occurred in 0.4% of hospital admissions** and represented **6.4% of all AEs**
- **83.3% were judged to be preventable**
- **Human failure was identified as the main cause (96.3%)**
- **Consequences were more severe** than for other AE types: mortality rate **29.1% vs. 7.4%** for other AEs
- Prevention strategies should focus on "training physicians and on the organization of knowledge and information transfer"

### Primary Source B: Zwaan, Schiff, Singh 2013 (BMJ Qual Saf)

- **Title:** "Advancing the research agenda for diagnostic error reduction"
- **Authors:** Zwaan L, Schiff GD, Singh H
- **Journal:** BMJ Quality & Safety
- **Year:** 2013; 22(suppl 2):ii2-ii4
- **DOI:** 10.1136/bmjqs-2012-001624
- **PMID:** 23942182

**Key findings:**
> "Diagnostic errors remain an underemphasised and understudied area of patient safety research."
- Calls for more precise estimates in different care settings
- Recommends newer conceptual models for analyzing systems and cognitive causes
- Identifies promising intervention areas: enhanced patient involvement, electronic tools, and identification of specific diagnostic process "pitfalls"

---

## 4. The Diagnostic Error Literature Broadly

### Singh & Sittig 2015: The Safer Dx Framework

- **Title:** "Advancing the science of measurement of diagnostic errors in healthcare: the Safer Dx framework"
- **Authors:** Singh H, Sittig DF
- **Journal:** BMJ Quality & Safety
- **Year:** 2015; 24(2):103-110
- **DOI:** 10.1136/bmjqs-2014-003675
- **PMID:** 25749026

**Key findings:**
- Diagnostic errors estimated to affect **about 12 million Americans each year** in ambulatory care settings alone
- Health care organizations lack tools and strategies to measure diagnostic safety
- The **Safer Dx framework** serves as a conceptual foundation for system-wide safety measurement, monitoring, and improvement
- Accounts for the **complex adaptive sociotechnical system** (structure), the **distributed process dimensions** (process), and the **outcomes** of a correct and timely "safe diagnosis"

### Singh, Meyer, Thomas 2014: The 5% Estimate

- **Title:** "The frequency of diagnostic errors in outpatient care: estimations from three large observational studies involving US adult populations"
- **Authors:** Singh H, Meyer AN, Thomas EJ
- **Journal:** BMJ Quality & Safety
- **Year:** 2014; 23(9):727-731
- **DOI:** 10.1136/bmjqs-2013-002627
- **PMID:** 24742777

**Key findings:**
- Combined estimates from three studies yielded a rate of outpatient diagnostic errors of **5.08%, or approximately 12 million U.S. adults every year**
- About **half of these errors could potentially be harmful**
- **"Diagnostic errors affect at least 1 in 20 U.S. adults"**
- This paper is the source of the "5%" statistic cited in the NAM 2015 report

### Newman-Toker & Pronovost 2009: "The Next Frontier"

- **Title:** "Diagnostic errors—the next frontier for patient safety"
- **Authors:** Newman-Toker DE, Pronovost PJ
- **Journal:** JAMA
- **Year:** 2009; 301(10):1060-1062
- **DOI:** 10.1001/jama.2009.249
- **PMID:** 19278949

A JAMA editorial/commentary that framed diagnostic errors as the next major patient safety challenge after the successes of the patient safety movement in reducing surgical and medication errors.

---

## 5. Medical-Legal and Patient-Safety Rationale for Diagnostic Documentation/Transparency

### Saber Tehrani et al. 2013: 25-Year US Malpractice Claims Summary (NPDB)

- **Title:** "25-Year summary of US malpractice claims for diagnostic errors 1986-2010: an analysis from the National Practitioner Data Bank"
- **Authors:** Saber Tehrani AS, Lee H, Mathews SC, Shore A, Makary MA, Pronovost PJ, Newman-Toker DE
- **Journal:** BMJ Quality & Safety
- **Year:** 2013; 22(8):672-680
- **DOI:** 10.1136/bmjqs-2012-001550
- **PMID:** 23610443

**Key findings:**
- Analyzed **350,706 paid claims** (1986–2010); **diagnostic errors (n=100,249) were the leading type (28.6%)** and accounted for the **highest proportion of total payments (35.2%)**
- Diagnostic errors more often resulted in death than other allegation groups (**40.9% vs 23.9%**, p<0.001) and were the **leading cause of claims-associated death and disability**
- Inflation-adjusted 25-year sum of diagnosis-related payments: **US$38.8 billion** (mean per-claim US$386,849; median US$213,250)
- Conclusion: "Among malpractice claims, diagnostic errors appear to be the most common, most costly and most dangerous of medical mistakes."

### Schaffer et al. 2017: Diagnostic Error as Most Common Malpractice Allegation

- **Title:** "Rates and Characteristics of Paid Malpractice Claims Among US Physicians by Specialty, 1992-2014"
- **Authors:** Schaffer AC, Jena AB, Seabury SA, Singh H, Chalasani V, Kachalia A
- **Journal:** JAMA Internal Medicine
- **Year:** 2017; 177(5):710-718
- **DOI:** 10.1001/jamainternmed.2017.0311
- **PMID:** 28346582

**Key findings:**
- Analyzed **280,368 paid malpractice claims** from the National Practitioner Data Bank (1992-2014)
- **"Diagnostic error was the most common type of allegation, present in 31.8% of paid claims"**
- Range: **3.5% in anesthesiology to 87.0% in pathology**
- Mean compensation payment: **$329,565**
- 32.1% of paid claims involved patient death

### Newman-Toker et al. 2019: The "Big Three" in Malpractice Claims

- **Title:** "Serious misdiagnosis-related harms in malpractice claims: The 'Big Three'—vascular events, infections, and cancers"
- **Authors:** Newman-Toker DE, Schaffer AC, Yu-Moe CW, Nassery N, Saber Tehrani AS, Clemens GD, Wang Z, Zhu Y, Fanai M, Siegal D
- **Journal:** Diagnosis (Berlin)
- **Year:** 2019; 6(3):227-240
- **DOI:** 10.1515/dx-2019-0019
- **PMID:** 31535832

**Key findings:**
- Analyzed **11,592 diagnostic error cases** from the CRICO Comparative Benchmarking System (CBS) database (2006-2015), representing 28.7% of all US malpractice claims
- 7,379 cases had high-severity harms (53.0% death)
- **The "Big Three" diseases (vascular events, infections, cancers) accounted for 74.1% of high-severity cases**
  - Vascular events: 22.8%, Infections: 13.5%, Cancers: 37.8%
- Most frequent disease in each category: **stroke, sepsis, and lung cancer**
- Causes were **disproportionately clinical judgment factors (85.7%)**

### Why an Audit Trail Matters for Medical-Legal Protection

The literature consistently shows that:
1. **Diagnostic error is the #1 allegation in malpractice claims** (31.8% of all paid claims — Schaffer 2017)
2. **Clinical judgment factors dominate** (85.7% — Newman-Toker 2019), meaning the reasoning process itself is the primary target of litigation
3. **Multiple contributing factors on the diagnostic pathway** increase malpractice risk (Grenon 2023) — documentation of each step is critical for defense
4. The NAM report recommends patient access to **"clinical notes and diagnostic testing results"** (Recommendation 7) — both require documentation

---

## 6. Teaching Rationale: Diagnostic Reasoning Documentation and Clinical Education

### Kaplan 2010: Problem Lists and Clinical Reasoning

- **Title:** "Perspective: Whither the problem list? Organ-based documentation and deficient synthesis by medical trainees"
- **Author:** Kaplan DM
- **Journal:** Academic Medicine
- **Year:** 2010; 85(11):1687-1688
- **DOI:** 10.1097/ACM.0b013e3181f06c67
- **PMID:** 20881678

**Key findings:**
- **"Documentation style and clinical reasoning are closely connected"**
- Organ-based documentation may **predispose trainees to several varieties of cognitive diagnostic error and deficient synthesis**
- These include **framing error, premature or absent closure, failure to integrate related findings**, and failure to recognize the level of diagnostic resolution attained
- Research links **more sophisticated problem representation with diagnostic success**

### Clary et al. 2026: Coaching Problem Representation (the "one-liner")

- **Title:** "How to Coach Problem Representation to Strengthen Diagnostic Reasoning in Trainees"
- **Authors:** Clary C, Cohen A, Thammasitboon S
- **Journal:** The Clinical Teacher
- **Year:** 2026; 23(3):e70426
- **DOI:** 10.1111/tct.70426
- **PMID:** 42049678

**Key findings:**
- **Problem representation (PR)** is "a concise synthesis of clinical information that captures the core diagnostic problem in a single statement, often referred to as a 'one-liner'." Central to diagnostic reasoning, but frequently underdeveloped in training.
- The **Assessment of Reasoning Tool-Reconstructed (ART-R)** gives educators a coaching rubric to refine PR along three elements: (1) clarity of the synthesized clinical problem; (2) emphasis on diagnostically relevant positive and negative findings; (3) use of precise medical terminology.
- "Through repeated practice, trainees develop increasingly abstracted representations that activate illness scripts and support diagnostic hypothesis generation."

### Braun et al. 2017: Representation Scaffolds Improve Diagnostic Efficiency

- **Title:** "Representation scaffolds improve diagnostic efficiency in medical students"
- **Authors:** Braun LT, Zottmann JM, Adolf C, Lottspeich C, Then C, Wirth S, Fischer MR, Schmidmaier R
- **Journal:** Medical Education
- **Year:** 2017; 51(7):712-722
- **DOI:** 10.1111/medu.13249
- **PMID:** 28585351

**Key findings:** Randomized controlled study — writing case-representation summaries **significantly improved diagnostic efficiency**; the intervention group screened information faster while maintaining accuracy.

### Olson et al. 2019: 12 Interprofessional Diagnostic Competencies

- **Title:** "Competencies for improving diagnosis: an interprofessional framework for education and training in health care"
- **Authors:** Olson A, Rencic J, Cosby K, Rusz D, Papa F, Croskerry P, Zierler B, Harkless G, Giuliano MA, Schoenbaum S, Colford C, Cahill M, Graber ML
- **Journal:** Diagnosis (Berlin)
- **Year:** 2019; 6(4):225-236
- **DOI:** 10.1515/dx-2018-0105
- **PMID:** 31271549

**Key findings:** Given the "unacceptably high incidence of diagnostic errors," identified **twelve competencies** for health-professions education, spanning individual, teamwork, and system aspects of diagnosis.

### Smith et al. 2025: Diagnostic Reasoning Competencies

- **Title:** "Diagnostic Reasoning Foundations: Theoretical and Scientific Background With Suggested Competencies for Nurse Practitioner Education"
- **Authors:** Smith S, Benbenek MM, Petersen LA
- **Journal:** AACN Advanced Critical Care
- **Year:** 2025; 36(1):14-26
- **DOI:** 10.4037/aacnacc2025354
- **PMID:** 40445788

**Key findings:**
- Comprehensive review of diagnostic reasoning theory over 30+ years
- Identifies key competency areas including: **illness scripts and script activation, problem representation and differential diagnosis, and metacognition and documentation**
- The competency framework explicitly includes **"metacognition and documentation"** as a core diagnostic reasoning skill

### Why an Audit Trail Matters for Teaching

1. **Documentation style and clinical reasoning are closely connected** (Kaplan 2010) — how trainees document reflects and shapes how they reason
2. **Problem representation** and **clinical reasoning assessment** are teachable, assessable documentation tasks
3. **Metacognition and documentation** are now recognized as core diagnostic reasoning competencies (Smith 2025)
4. The NAM report recommends environments for **"open discussion and feedback on diagnostic errors and near misses"** — this requires visible, reviewable reasoning

---

## Summary: The Triple Rationale for Diagnostic Transparency

| Domain | Key Evidence | Why an Audit Trail Matters |
|--------|-------------|--------------------------|
| **Patient Safety** | 5% of adults experience diagnostic error (Singh 2014, PMID 24742777); 83.3% of diagnostic AEs are preventable (Zwaan 2010, PMID 20585065); cognitive factors in 74% of errors (Graber 2005, PMID 16009864) | An audit trail makes reasoning visible, enabling identification of where the diagnostic process broke down — whether at the system, cognitive, or communication level |
| **Medical-Legal** | Diagnostic error is the #1 malpractice allegation at 31.8% of paid claims (Schaffer 2017, PMID 28346582); 85.7% involve clinical judgment factors (Newman-Toker 2019, PMID 31535832) | Documentation of reasoning demonstrates that judgment was appropriately exercised and provides a defensible record; absence of documentation is itself a liability |
| **Teaching** | Documentation and clinical reasoning are "closely connected" (Kaplan 2010, PMID 20881678); "metacognition and documentation" is a core competency (Smith 2025, PMID 40445788) | Visible reasoning enables feedback, assessment, and learning; problem representation and differential diagnosis are teachable through structured documentation |

The NAM 2015 report ties all three together by recommending a **nonpunitive reporting culture** that values **"open discussion and feedback on diagnostic performance"** — a culture that can only function when diagnostic reasoning is documented and reviewable.

---

## Implication for Arbor

Arbor's retraceable decision-tree is, in effect, a **diagnostic audit artifact**: every hypothesis generated, every branch taken and pruned (with the reason), every test ordered and what it ruled in/out, and the final working diagnosis with its confidence and reasoning trail. This maps directly onto the patient-safety, medical-legal, and teaching rationales above — and is the concrete realization of the NAM report's call for reviewable diagnostic reasoning. The "keep pruned branches visible" design choice is not just a UX nicety; it is the feature that turns a differential into an auditable record.
