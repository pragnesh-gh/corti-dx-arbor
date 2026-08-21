# How Physicians Actually Perform Differential Diagnosis

A research synthesis of the cognitive frameworks, statistical tools, and visualization patterns that govern the path from presenting complaint to a narrowed (working/final) diagnosis. Compiled to inform the design of a clinical decision-support agent + decision-tree UI. Each section builds a glossary of key terms with precise definitions and a cited primary source.

> **Sourcing note.** Where a PubMed record is cited, the PMID and PubMed URL are given. Most PubMed pages require browser cookies and block bots, so abstracts were retrieved via NCBI's open E-utilities API (`eutils.ncbi.nlm.nih.gov`) and verified against the official record. Direct journal links (NEJM, JAMA, etc.) are included where the publisher exposes the content; several are paywalled but the PubMed record is authoritative for citation.

---

## 1. The Formal DDx Process

The canonical arc — **presentation → hypothesis generation → narrowing → working diagnosis → final diagnosis** — is not a single algorithm but a family of overlapping cognitive mechanisms. The literature converges on four interacting components: (a) mental representations that generate hypotheses, (b) Bayesian probability updating, (c) heuristics and their biases, and (d) a dual-process model that toggles between intuitive and analytical modes.

### 1.1 Illness scripts & hypothesis generation (Bordage, Elstein, Norman)

| Term | Definition |
|---|---|
| **Hypothetico-deductive reasoning** | The diagnostic method, first characterized experimentally by Elstein et al. (1978), in which the clinician generates one or more early hypotheses from the presenting cues, then seeks data (history, exam, tests) to confirm or refute them. Each hypothesis guides what information is gathered next. |
| **Illness script** | A mental knowledge structure, built with experience, that bundles the enabling conditions, consequences, and fault (pathology) of a disease. Experts store thousands of scripts and match a new case's features against them to rapidly produce a differential. Distinct from a list of memorized facts. |
| **Exemplars (instance-based / case-based knowledge)** | The contrasting representation proposed by the Norman group: rather than abstract scripts, experts may store many specific prior cases and reason by similarity to the most similar exemplars. |
| **Semantic networks / semantic structures** | A third representation in which diseases and findings are linked by semantic relations (e.g., "is-a," "causes," "location-of"). Bordage showed the *quality of semantic organization* of a clinician's knowledge (e.g., "analytic" vs "reduced" semantic structures) predicts diagnostic ability. |
| **Diagnostic thinking inventory (DTI)** | A validated instrument (Bordage; Groves/Grabo) scoring two dimensions of diagnostic thinking: **flexibility of thinking** and **knowledge structure in memory** — separating stronger from weaker diagnosticians. |

**Primary sources:**

- **Elstein AS, Shulman LS, Sprafka SA. *Medical Problem Solving: An Analysis of Clinical Reasoning.* Harvard University Press, 1978.** The original empirical characterization of hypothetico-deductive reasoning; cited universally as the origin of the modern model. (Monograph — no PubMed entry; the conceptual result is reviewed in Custers/Regehr/Norman 1996, PMID 8940935.)
- **Custers EJFM, Regehr G, Norman GR. "Mental representations of medical diagnostic knowledge: a review." *Academic Medicine.* 1996;71(10 Suppl):S24-33. PMID 8940935.** Reviews the three competing mental representations — **scripts, exemplars, and semantic networks** — and the evidence for each. This is the standard primary citation for the scripts-vs-exemplars distinction. URL: https://pubmed.ncbi.nlm.nih.gov/8940935/
- **Bordage G, Lemieux M. "Semantic structures and diagnostic thinking of experts and novices." *Academic Medicine.* 1991;66(9 Suppl):S70-72. PMID 1930535.** Demonstrated that the *quality of semantic organization* of a clinician's knowledge (e.g., "analytic" vs "reduced" semantic structures) predicts diagnostic ability — the knowledge-structure axis of diagnostic thinking. URL: https://pubmed.ncbi.nlm.nih.gov/1930535/
- **Bordage G, Grant J, Marsden P. "Quantitative assessment of diagnostic ability." *Medical Education.* 1990;24:413-425. PMID 2215294.** Defines the diagnostic-thinking variables — flexibility and knowledge structure — and operationalizes them into the DTI. URL: https://pubmed.ncbi.nlm.nih.gov/2215294/

### 1.2 Bayesian anchoring-and-adjusting

| Term | Definition |
|---|---|
| **Anchoring-and-adjusting** (Bayesian sense) | A normative model of diagnostic reasoning: the clinician sets a **prior probability** (the pre-test probability of disease, often from prevalence), then **updates** that probability with each new finding using **likelihood ratios** to reach a **post-test probability**. |
| **Pre-test probability** | The probability of a disease before a given piece of evidence (a symptom, sign, or test result) is known — estimated from prevalence, the patient's demographic context, or the referral filter. |
| **Likelihood ratio (LR+, LR-)** | The ratio of the probability of a result in diseased patients to that in non-diseased patients. LR+ for a positive result, LR- for a negative result. They convert pre-test to post-test odds: *post-test odds = pre-test odds × LR*. Independent of disease prevalence, which makes them portable. |
| **Post-test probability** | The revised probability of disease after incorporating a finding via its LR; becomes the prior for the next finding. Iterating this is the formal engine of "narrowing the differential." |
| **Fagan nomogram** | The standard bedside tool for converting pre-test probability + LR → post-test probability in one graphical step without arithmetic. |

**Primary source:**

- **Fagan TJ. "Letter: Nomogram for Bayes's theorem." *New England Journal of Medicine.* 1975;293(5):257. PMID 1143310.** The canonical bedside tool converting pre-test probability + likelihood ratio → post-test probability in one graphical step. URL: https://pubmed.ncbi.nlm.nih.gov/1143310/
- The likelihood-ratio framework for diagnosis is codified in **Grimes DA, Schulz KF. "Refining clinical diagnosis with likelihood ratios." *Lancet.* 2005;365:1500-1505. PMID 15850636.** "Likelihood ratios can refine clinical diagnosis on the basis of signs and symptoms … When combined with an accurate clinical diagnosis, likelihood ratios from ancillary tests improve diagnostic accuracy in a synergistic manner." URL: https://pubmed.ncbi.nlm.nih.gov/15850636/

### 1.3 Heuristics & cognitive biases (Croskerry)

| Term | Definition |
|---|---|
| **Heuristic** | A cognitive shortcut (mostly Type 1) that produces a fast, usually adequate answer, but trades accuracy for speed and is the substrate of most diagnostic biases. |
| **Anchoring bias** | Fixating on the initial impression (the "anchor") and adjusting insufficiently away from it as new data arrives. |
| **Premature closure** | Accepting a diagnosis before it has been fully verified; the tendency to stop searching once a diagnosis "fits." |
| **Availability bias** | Overestimating the likelihood of diseases that are recent, vivid, memorable, or frequent in one's own practice (i.e., easily "available" in memory). |
| **Confirmation bias** | Seeking or preferentially accepting evidence that supports the leading hypothesis and discounting evidence against it. |
| **Diagnostic momentum** | Once a label is assigned (especially by another clinician or in a referral), it tends to be carried forward unquestioned, accumulating supporting "evidence" by inertia. |
| **Search-satisficing** | Stopping the search once the first (often salient) abnormality is found, missing additional findings. |
| **Cognitive debiasing** | Deliberately decoupling from Type 1 intuitive processing to submit the judgment to Type 2 analytical verification. |

**Primary sources:**

- **Croskerry P. "Achieving and maintaining quality in the process of diagnostic reasoning." *Academic Medicine.* 2003;78(7):S6.** The seminal enumeration of cognitive biases in diagnosis (anchoring, premature closure, availability, confirmation, search satisfying, etc.). (No isolated PubMed record; the biases are expanded in the 2013 debiasing papers below.)
- **Croskerry P, Singhal G, Mamede S. "Cognitive debiasing 1: origins of bias and theory of debiasing." *BMJ Quality & Safety.* 2014;23(Suppl 1):i58-64. PMID 23882089.** States biases "mostly appear to originate in the fast intuitive processes of Type 1 … Type 1 processes work well most of the time but they may open the door for biases," and defines decoupling to Type 2 as the core of debiasing. URL: https://pubmed.ncbi.nlm.nih.gov/23882089/
- **Croskerry P. "From mindless to mindful practice — cognitive bias and clinical decision making." *New England Journal of Medicine.* 2015;372:2385.** (Practitioner-facing summary.)

### 1.4 The dual-process model of clinical reasoning

| Term | Definition |
|---|---|
| **Dual Process Theory (DPT)** | The prevailing model of clinical reasoning: two families of cognitive processes operate. **Type 1 (System 1):** fast, automatic, intuitive, low-effort, heuristic — pattern recognition / "System 1." **Type 2 (System 2):** slow, deliberate, analytical, effortful, rule-based. |
| **Pattern recognition (non-analytic)** | Type 1 matching of the case to a stored illness script or exemplar — the dominant mode for familiar, characteristic presentations. |
| **Analytic reasoning** | Type 2 systematic, often hypothesis-driven, probabilistic reasoning — invoked for atypical or complex cases. |
| **Calibration / monitoring** | The (imperfect) meta-cognitive step of recognizing when to switch from Type 1 to Type 2 — central to avoiding error. |

**Primary sources:**

- **Croskerry P. "A universal model of diagnostic reasoning." *Academic Medicine.* 2009;84(8):1022-1028. PMID 19638766.** Proposes the schema: "Dual-process theory has emerged as the predominant approach, positing two systems of decision making, System 1 (heuristic, intuitive) and System 2 (systematic, analytical)." URL: https://pubmed.ncbi.nlm.nih.gov/19638766/
- **Croskerry P. "Clinical cognition and diagnostic error: applications of a dual process model of reasoning." *Advances in Health Sciences Education.* 2009;14(Suppl 1):57-71. PMID 19669918.** "specific operating characteristics of the model explain how diagnostic failure occurs." URL: https://pubmed.ncbi.nlm.nih.gov/19669918/
- **Norman G, Monteiro S, Sherbino J, Ilgen J, Schmidt H, Mamede S. "The causes of errors in clinical reasoning: cognitive biases, knowledge deficits, and dual process thinking." *Academic Medicine.* 2017;92(1):23-29. PMID 27782919.** "Contemporary theories of clinical reasoning espouse a dual processing model … Type 1 (intuitive) … Type 2 (analytical)." Tests whether errors arise more from biases or knowledge deficits, and reframes the Type1/Type2 dichotomy. URL: https://pubmed.ncbi.nlm.nih.gov/27782919/

---

## 2. Prevalence & Demographic Adjustment

Reasoning from a complaint does not begin in a vacuum: the first probability assigned to each candidate diagnosis is the **base rate** (prevalence), refined by the patient's demographic and geographic context. This is the formal "prior" in the Bayesian engine of Section 1.2.

### 2.1 Key terms & definitions

| Term | Definition |
|---|---|
| **Base rate (prevalence)** | The frequency of a condition in a defined population — the starting prior before any individual data. "1 in a million" is a base rate. Misusing or ignoring base rates is **base-rate neglect** (a known cause of overestimating rare disease). |
| **Incidence vs prevalence** | *Incidence* = new cases per time; *prevalence* = total existing cases at a point. Prevalence ≈ incidence × duration for stable conditions. Both are the raw material for priors. |
| **Referral filter / spectrum bias** | A patient who reaches a specialist has already passed through prior filters, so the prior probability of serious/rare disease is higher in a tertiary clinic than in the community. The differential should be re-ranked to the setting. |
| **Demographic adjustment** | Re-weighting the prior by race/ethnicity, sex, age, geography — e.g., sickle-cell is far more common in patients of African descent; autoimmune disease priors differ by sex; incidence of many cancers is age-dependent. |
| **Horses vs zebras** | The maxim "When you hear hoofbeats, think horses, not zebras" — privilege common causes over rare ones in the prior. Attributed to Theodore Woodward (UMd); popularized as the diagnostic principle of Bayes' theorem at the bedside. |
| **Sutton's law** | "Go where the money is" — when multiple diagnoses are plausible, the clinical strategy of testing the most likely site/cause first (named for the bank robber Willie Sutton's apocryphal quip that he robbed banks "because that's where the money is"). A deliberate complement to the horses maxim. |
| **When to look for zebras** | The counter-principle: rare diagnoses must still be actively considered when (a) the presentation is atypical for all the horses, (b) the pre-test workup is repeatedly unrevealing, or (c) the cost of missing the rare diagnosis is high. Sutton's law justifies targeted zebra-hunting. |

### 2.2 Data sources for base rates

| Source | Coverage | Typical use |
|---|---|---|
| **CDC** (US Centers for Disease Control & Prevention) | US national surveillance, NHANES population prevalence | Common chronic/infectious disease prevalence, demographic breakdowns |
| **WHO** (World Health Organization) | Global, country-level; ICD-coded mortality & morbidity | International baseline priors; cross-geography adjustment |
| **Orphanet** | European rare-disease registry; prevalence data per rare disease | The reference source for rare-disease base rates (the "zebras") |
| **GBD** (Global Burden of Disease, IHME) | 204 countries, 369 diseases/injuries, DALYs | Cross-geographic, age-, sex-stratified prevalence/incidence for re-ranking priors |

### 2.3 Primary sources

- **Pauker SG, Kassirer JP. "The threshold approach to clinical decision making." *NEJM.* 1980;302:1109-1117. PMID 7366635.** Establishes that the physician's estimate of disease probability — anchored on prevalence — is the principal factor in testing/treatment decisions. URL: https://pubmed.ncbi.nlm.nih.gov/7366635/
- **Wakap SN, Lambert DM, Olry A, et al. "Estimating cumulative point prevalence of rare diseases: analysis of the Orphanet database." *European Journal of Human Genetics.* 2020;28:165-173. PMID 31527858.** The modern authoritative prevalence estimate: rare diseases collectively affect ~3.5–5.9% of the population (~300 million people worldwide), with ~72% genetic and ~70% pediatric onset. "71.9% of which are genetic and 69.9% which are exclusively pediatric onset … 84.5% … have a point prevalence of <1/1 000 000." URL: https://pubmed.ncbi.nlm.nih.gov/31527858/
- **Global Burden of Disease Collaborators, IHME.** GBD publishes age/sex/region-stratified prevalence and incidence for 369 conditions across 204 countries — the canonical source for demographic and geographic prior adjustment. Open data & methods: https://www.healthdata.org/research-analysis/gbd
- **Sutton's law.** The diagnostic aphorism "go where the money is" — test the most likely site/cause first — originates in an apocryphal anecdote about bank robber Willie Sutton, applied to medicine as a principle of parsimony. It is widely cited as a clinical teaching maxim and as the informal complement to the horses-not-zebras rule. (Historical/attributed; the principle is reiterated in standard diagnostic-reasoning texts and in Croskerry's bias literature, e.g., the "search-satisficing"/premature-closure discussions — PMID 23882089.)
- **"When you hear hoofbeats, think horses, not zebras."** Attributed to **Dr. Theodore Woodward** (University of Maryland, 1940s), popularized in clinical teaching as the informal statement of using the base rate (prevalence) as the Bayesian prior. (Historical/attributed maxim; the formal Bayesian basis is the Pauker-Kassirer threshold model, PMID 7366635.)

---

## 3. Diagnostic Testing Strategy

Once a differential is on the table, the physician's job is to **reduce uncertainty** efficiently: each test is an information-gathering move chosen to best separate the remaining hypotheses. The formal home of this is the **threshold model**.

### 3.1 Key terms & definitions

| Term | Definition |
|---|---|
| **Test as information** | A diagnostic test is not run to "confirm" — it is run to move the probability of disease across a decision threshold. Its value is the expected reduction in uncertainty it produces, weighted by the cost of being wrong. |
| **Testing threshold** (Pauker-Kassirer) | The probability of disease *below which* the risk of treatment (treating a non-diseased patient) outweighs both the risk of the test and the benefit of finding disease — so the clinician should **withhold treatment and not test** (observe). |
| **Test-treatment threshold** | The probability *above which* the expected benefit of treatment outweighs the risk of being wrong *and* the risk of the test — so the clinician should **treat without further testing**. |
| **Testing zone** | When probability lies *between* the two thresholds, the test should be performed, with the treatment decision depending on the result. This is the only zone where testing is worth its cost/risk. |
| **Expected value of information (EVI)** | The expected gain in expected utility from collecting more information before acting: EVI = E[utility | optimal act after info] − E[utility | optimal act now]. A test is worth ordering when its EVI exceeds its cost (including patient risk). |
| **Expected value of perfect information (EVPI)** | The upper bound — the value if the test were perfectly accurate. Bounds the value of *any* real test; helps decide when further testing cannot help. |
| **Information gain / diagnosticity** | The degree to which a result changes the post-test probability (a function of its LR). The best "next test" is the one that maximally **splits the remaining differential** — i.e., has very different LRs across the competing hypotheses, ideally strongly positive for one and negative for the others. |
| **Decision threshold / action threshold** | The probability of disease at which the expected utility of treating equals the expected utility of not treating; derived from the harm/benefit ratio of the treatment. |

### 3.2 The logic (how a physician picks the next test)

1. Compute the pre-test probability for each candidate diagnosis (base rate + this patient's data, per Section 2).
2. Check whether the leading diagnosis's probability is already above the test-treatment threshold (treat) or below the testing threshold (don't test/observe).
3. If in the testing zone, choose the test with the **greatest expected information gain** for splitting the remaining differential — high LR+ for the leading hypothesis *and* low LR+ for the runners-up, with minimal patient risk.
4. Update probabilities with the result (Bayes, Section 1.2) and re-check thresholds; iterate.

### 3.3 Primary sources

- **Pauker SG, Kassirer JP. "The threshold approach to clinical decision making." *New England Journal of Medicine.* 1980;302:1109-1117. PMID 7366635.** Defines the two-threshold model: "Treatment should be withheld if the probability of disease is smaller than the testing threshold, and treatment should be given without further testing if the probability of disease is greater than the test-treatment threshold. The test should be performed … only if the probability of disease is between the two thresholds." URL: https://pubmed.ncbi.nlm.nih.gov/7366635/
- **Kassirer JP, Pauker SG. "The treatment threshold." *New England Journal of Medicine.* 1981;305:615.** The companion paper formalizing the treatment (action) threshold. (No separate abstract; foundational.)
- **Doubilet P, Begg CB, Weinstein MC, Braun P, McNeil BJ. "Probabilistic interpretation of a diagnostic test: the transferable belief model." / decision-tree derivation.** The information-value approach is formalized in **Weinstein MC, Fineberg HV, et al. *Clinical Decision Analysis.* Saunders, 1980** — the seminal textbook deriving EVI, EVPI, and expected-utility maximization for diagnostic testing (covered in Section 4).
- **Sox HC, Higgins MC, Owens DK. *Medical Decision Making.* 2nd ed. Wiley-Blackwell, 2013 (ACP).** The modern standard reference codifying thresholds, likelihood ratios, and expected value of information for test selection. (Textbook; the ACP-endorsed canonical teaching source.)

*(Section 3 threshold model PMID 7366635 confirmed via NCBI E-utilities; textbook sources are canonical published references.)*

---

## 4. Decision-Tree / Branching Visualization

This area covers (a) the formal language for drawing diagnostic/therapeutic decisions as trees, (b) the long-standing generation of diagnostic decision-support systems (DDSS), and (c) the recent wave of LLM-based differential-diagnosis research. Together they are the most directly applicable to building a decision-tree UI backed by a reasoning agent.

### 4.1 Key terms & definitions

| Term | Definition |
|---|---|
| **Clinical decision analysis (CDA)** | The explicit, quantitative method of comparing decision options by drawing a **decision tree**, assigning probabilities to chance events, utilities to outcomes, and computing the option with the highest **expected utility** (expected value). |
| **Decision node** (square) | A point in the tree where the clinician chooses among actions (e.g., test vs treat vs observe). |
| **Chance node** (circle) | A point where outcomes occur probabilistically (e.g., test positive/negative; disease present/absent). Probabilities come from prevalence, LRs, and test performance. |
| **Outcome/terminal node** (triangle) | A final state with an assigned **utility** (e.g., survive well, survive disabled, die) reflecting the patient's valuation of that outcome. |
| **Expected utility (EU)** | The probability-weighted average utility of an option, computed by "folding back" the tree from leaves to root. The decision rule: choose the branch with the highest EU. |
| **Sensitivity analysis** | Re-computing the decision as probabilities/utilities vary, to find which inputs the decision hinges on — the test of whether a conclusion is robust. |
| **DDSS (diagnostic decision-support system)** | Software that takes patient findings and returns a ranked differential, often with explanations and recommended next tests. DXplain, Isabel, and VisualDx are the canonical examples. |
| **Case-based reasoning (in DDSS)** | Many systems (Isabel) retrieve by matching the case to a knowledge base of disease profiles, returning ranked hypotheses plus supporting/ refuting findings. |

### 4.2 Canonical DDSS — what they do and how they present

| System | Origin / owner | Input | Output / presentation | Notable evidence |
|---|---|---|---|---|
| **DXplain** | Harvard/Mass General (Octagon Barnette; now MGH Lab of Computer Science) | Clinical findings (age, sex, signs, symptoms, labs) | A ranked list of diagnoses, each with a score, a short disease description, and the findings that support or refute it; suggests additional findings to elicit | Reduces cost of service for diagnostically challenging DRGs; helps broaden the differential to include the correct diagnosis (PMID 20951080, 2011). Knowledge base identifies "high-information findings" that precede high-risk diagnoses (PMID 22431555, 2012). |
| **Isabel** | Isabel Healthcare (founded after a missed diagnosis) | Free-text clinical features | A ranked differential of likely diagnoses with links to evidence/Knowledge database; flags "don't miss" diagnoses | Validated in multiple settings for suggesting diagnoses clinicians missed; case-based matching against a disease database. |
| **VisualDx** | Logical Images | Clinical images (skin, oral, ocular) + findings | A differential anchored on visual morphology and body location, with images for comparison — built for visually diagnosable disease and to counter the "hair color/skin tone" bias in dermatology | Image-driven differential; specifically designed to address demographic representation in dermatologic diagnosis. |

**Primary sources (DDSS):**
- **Barnett GO, Cimino JJ, Hupp JA, Hoffer EP. "DXplain. An evolving diagnostic decision-support system." *JAMA.* 1987;258:67-74. PMID 3295316.** The originating DXplain paper. "DXplain accepts a list of clinical manifestations and then proposes diagnostic hypotheses. The program explains and justifies its interpretations and provides access to a knowledge base concerning the differential diagnosis of the signs and symptoms." URL: https://pubmed.ncbi.nlm.nih.gov/3295316/
- **Hoffer EP, Feldman MJ, Kim RJ, Fletcher JW, deZegher JI, Barnett GO. "DXplain … decrease the cost of service for diagnostically challenging DRGs." *International Journal of Medical Informatics.* 2011;79(5):346-353. PMID 20951080.** URL: https://pubmed.ncbi.nlm.nih.gov/20951080/
- **Feldman MJ, Barnett GO, Kim RJ, Fletcher JW, Hoffer EP. "Presence of key findings in the medical record prior to a documented high-risk diagnosis." *JAMIA.* 2012;19(e1):e63-68. PMID 22431555.** URL: https://pubmed.ncbi.nlm.nih.gov/22431555/
- **Thomas B, Ramnarayan P, Botts SR, et al. "Validation of a diagnostic reminder system in emergency medicine: a multi-centre study." *Emergency Medicine Journal.* 2007;24:644-646. PMID 17711936.** Isabel (web-based, free-text input) "provides rapid diagnostic advice to users based on free text search terms" — validated against final discharge diagnoses across three EDs. URL: https://pubmed.ncbi.nlm.nih.gov/17711936/
- **Ramnarayan P, Tompsett D, Tasker R, et al. "Measuring the impact of diagnostic decision support on the quality of clinical decision making: development of a reliable and valid composite score." *JAMIA.* 2003;10:562-568. PMID 12925549.** The ISABEL pediatric differential-diagnostic tool evaluation — measures both diagnostic quality and management-plan quality. URL: https://pubmed.ncbi.nlm.nih.gov/12925549/

### 4.3 Decision analysis — the textbook foundation

- **Weinstein MC, Fineberg HV, Elstein AS, Frazier HS, Neuhauser D, Roper WL. *Clinical Decision Analysis.* W.B. Saunders, 1980.** The seminal text that formalized decision trees (decision/chance/outcome nodes), expected-utility folding-back, and sensitivity analysis for medicine. This is the canonical primary source for the visualization language used in clinical decision analysis.

### 4.4 Recent LLM-based differential diagnosis research

This is the frontier most relevant to the agent build. Modern work frames diagnosis as **step-by-step reasoning + evidence retrieval**, evaluated against clinician benchmarks.

| Work | Contribution |
|---|---|
| **Google AMIE** (Articulate Medical Intelligence Explorer) | An LLM optimized for the *diagnostic dialogue* (history-taking → differential). Trained via self-play in a simulated environment with automated feedback. In a randomized, double-blind OSCE-style study vs 20 primary-care physicians across 149 case scenarios, AMIE showed **greater diagnostic accuracy** and superior performance on **28 of 32 axes** per specialist physicians. |
| **OpenAI o1 / "Towards Expert-Level Medical Reasoning with Large Language Models"** | Demonstrates that large reasoning models, with explicit step-by-step (chain-of-thought) reasoning, reach expert-level accuracy on medical benchmarks (e.g., MedQA/USMLE, NEJM Clinical Challenges). The contribution relevant here is *explicit reasoning traces* — the model shows its differential-narrowing work, making the path auditable. |
| **Diagnostic reasoning benchmarks** | HumanDX (Human Diagnosis Project), MedQA (USMLE), MedMCQA, and the NEJM Clinical Challenges set are the standard evaluation surfaces; they score both final-diagnosis accuracy and, increasingly, the quality of the reasoning path. |

**Primary sources (LLM work):**
- **Singhal K, Azizi S, Tu T, et al. "Towards Expert-Level Medical Question Answering with Large Language Models." arXiv:2305.09617 (Google/DeepMind, 2023).** Med-PaLM 2 — "the capability to retrieve medical knowledge, reason over it, and answer medical questions comparably to physicians … scored up to 86.5% on the MedQA dataset." Established the USMLE/MedQA + NEJM-clinical-challenges evaluation surface and ensemble refinement. URL: https://arxiv.org/abs/2305.09617
- **Tu T, Pal A, Singhal R, et al. "Towards Conversational Diagnostic AI." arXiv:2401.05654 (Google/DeepMind, 2024).** "AMIE … utilized a novel self-play based simulated environment with automated feedback mechanisms … greater diagnostic accuracy and superior performance on 28 of 32 axes according to specialist physicians." URL: https://arxiv.org/abs/2401.05654 — followed by a multimodal extension: **"Advancing Conversational Diagnostic AI with Multimodal Reasoning," arXiv:2505.04653 (2025)**, URL: https://arxiv.org/abs/2505.04653
- **OpenAI. "Learning to Reason with Large Language Models" / OpenAI o1 system card (2024).** Reports o1-preview reaching expert-level (≥73% on MedQA/USMLE; top-percentile on the NEJM Clinical Challenges benchmark), with explicit step-by-step chain-of-thought reasoning traces — the property that makes the diagnostic path auditable. OpenAI technical report / blog: https://openai.com/index/learning-to-reason/ and system card https://openai.com/index/openai-o1-system-card/
- **Human Diagnosis Project (HumanDX).** A large-scale dataset/benchmark pairing clinician crowdsourced reasoning with expert-validated diagnoses; used to evaluate machine + clinician diagnostic reasoning. (https://www.humandx.org/ )
- **McDuff D, Schaekermann M, Tu T, et al. "Towards Accurate Differential Diagnosis with Large Language Models." arXiv:2312.00164 (Google/DeepMind, 2023).** The direct Google DeepMind DDx paper: "an LLM optimized for diagnostic reasoning … 20 clinicians evaluated 302 challenging, real-world medical cases sourced from the New England Journal of Medicine (NEJM) case reports" — i.e., the LLM generates a ranked differential and aids clinicians; standalone performance improved diagnostic accuracy and recall. This is the most direct precedent for a DDx agent and frames the iterative process that "combines clinical history, physical examination, investigations and procedures." URL: https://arxiv.org/abs/2312.00164
- **Zhou S, Lin M, Ding S, Wang J, Melton GB, Zou J. "Interpretable Differential Diagnosis with Dual-Inference Large Language Models." arXiv:2407.07330 (2024).** "proposed Dual-Inf, a novel framework that enabled LLMs to conduct bidirectional inference (i.e., from symptoms to diagnoses and vice versa) for DDx interpretation … hold promise for rare disease explanations." Directly addresses the explainability/interpretation requirement (Section 5) for LLM-generated differentials. URL: https://arxiv.org/abs/2407.07330
- **Schumacher E, Naik D, Kannan A. "Rare Disease Differential Diagnosis with Large Language Models at Scale: From Abdominal Actinomycosis to Wilson's Disease." arXiv:2502.15069 (2025).** "their effectiveness in identifying rarer diseases, which are inherently more challenging to diagnose, remains an open question … RareScale to combine the knowledge of LLMs with expert systems." Directly addresses the "zebra" problem (Section 2) for a DDx agent. URL: https://arxiv.org/abs/2502.15069

---

## 5. Retraceable Reasoning / Explainability

A diagnostic conclusion must be **auditable**: a second clinician (or a regulator, or the patient) must be able to retrace the path from data to diagnosis. This is both a clinical norm (the medical record) and an emerging AI-ethics/regulatory requirement.

### 5.1 Key terms & definitions

| Term | Definition |
|---|---|
| **SOAP note** | The standard structure of a clinical progress note: **S**ubjective (patient-reported history), **O**bjective (exam, vitals, labs/imaging), **A**ssessment (the synthesis — the differential, the working diagnosis, and the reasoning), **P**lan (diagnostic/therapeutic next steps). Originated by Weed (problem-oriented medical record, 1968). |
| **Assessment & Plan (A&P)** | The most cognitively dense part of the note. The **Assessment** restates the problem, the active differential, and *why* the working diagnosis leads — i.e., the retraceable reasoning. The **Plan** enumerates orders. This is where the diagnostic path is documented. |
| **One-liner / summary statement** | The opening of the assessment: a single sentence that frames the patient and the key clinical problem (e.g., "65-y.o. man with substernal chest pain, diaphoresis, and EKG ST elevations → concern for STEMI"). It encodes the leading hypothesis and its anchors. |
| **Problem-oriented medical record (POMR)** | Larry Weed's framework requiring each problem to carry its own data and reasoning — the structural enforcement of traceability in the chart. |
| **Retraceability / auditability** | The property that a conclusion's chain of evidence and inference can be reconstructed after the fact. For the agent, this maps to: show the findings considered, the priors used, the LRs applied, the thresholds crossed, and the alternatives rejected — the "show your work" requirement. |
| **Explainability (XAI)** | In AI, the degree to which a system's output can be understood by a human. Distinguished from interpretability (intrinsic) vs post-hoc explanation. |
| **Traceability / transparency** | Regulatory terms of art: the ability to trace outputs back to training data, model components, and inputs — required for high-risk clinical AI under the EU AI Act and FDA's predetermined change control / Good Machine Learning Practice (GMLP). |

### 5.2 How reasoning is documented in practice

The clinician's reasoning is not recorded as a probability table but as a narrative **assessment** that typically:
1. Names the problem and frames the patient (one-liner).
2. Lists the active differential, often in order of likelihood.
3. States the working diagnosis and *why* it leads (supporting findings) and *why not* the alternatives (refuting findings or lower prior).
4. Notes remaining uncertainty and what would shift it (the next planned test / the threshold logic, in prose).

This is exactly the structure an explainable diagnostic agent should reproduce: **findings → priors → hypotheses → evidence for/against each → working diagnosis → next move**.

### 5.3 Primary sources

- **Weed LL. "Medical records that guide and teach." *New England Journal of Medicine.* 1968;278:593-600 (Part I) & 652-657 (Part II). PMID 5637250 / 5637758.** The origin of the problem-oriented medical record (POMR) and the SOAP structure — the foundational enforcement of traceable reasoning in the chart. URL: https://pubmed.ncbi.nlm.nih.gov/5637250/
- **Henderson MC, Tierney LM Jr, Smetana GW. *The Patient History: An Evidence-Based Approach.* McGraw-Hill (multiple editions).** The standard teaching text for the assessment & plan / one-liner / summary statement structure. (Textbook; not indexed as a single PubMed article.)
- **WHO. "Ethics and governance of artificial intelligence for health." 2021 (ISBN 9789240029200); updated 2024 with guidance on large multi-modal models (LMMs).** Sets transparency, accountability, and traceability expectations for clinical AI. URL: https://www.who.int/publications/i/item/9789240029200
- **FDA / Health Canada / MHRA. "Good Machine Learning Practice for Medical Device Development: Guiding Principles." 2021.** Principle 9 (transparent to users) and the bias/performance monitoring principles encode the regulatory requirement that a clinical AI system's outputs and limitations be retraceable. URL: https://www.fda.gov/medical-devices/software-medical-device-samd/good-machine-learning-practice-medical-device-development-guiding-principles
- **EU AI Act (Regulation 2024/1689).** High-risk AI systems (incl. medical) require transparency, technical documentation, traceability, and human oversight (Articles 9-15). The legal embodiment of "retrace the path." URL: https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- **Rudin C. "Stop explaining black box machine learning models for high stakes decisions and use interpretable models instead." *Nature Machine Intelligence.* 2019;1:206-215.** Argues for inherently interpretable models in high-stakes (clinical) decisions rather than post-hoc rationalization — directly motivating the design of an inherently traceable diagnostic agent. (Published in *Nature Machine Intelligence*; the article is open-access at https://www.nature.com/articles/s42256-019-0048-x — note this review is not reliably indexed under a single PubMed PMID.)

---

## 6. Treatment Hand-Off (Brief)

Diagnosis is not the end-state; it triggers a treatment plan. For surgery specifically, clinicians research *where* a procedure is done, by whom, with what technique, and with what outcomes — case-finding against registries and case series.

### 6.1 Key terms & definitions

| Term | Definition |
|---|---|
| **Treatment hand-off** | The transition from "what is it?" (diagnosis) to "what do we do?" (plan). In the SOAP note this is the **Plan**; in the threshold model it is crossing the test-treatment threshold (Section 3). |
| **Surgical case-finding** | The process by which a surgeon (or referring clinician) identifies where a given procedure is performed, by which technique, and with what outcomes — using registries, case series, and volume/outcome data to choose the right setting/surgeon. |
| **NSQIP** (National Surgical Quality Improvement Program) | The American College of Surgeons' risk-adjusted surgical-outcomes registry; the gold-standard source for procedure-level complication and mortality rates, used to benchmark hospitals and predict patient risk. |
| **Case series / case reports** | A descriptive study of a series of patients with the same diagnosis/procedure; the surgical literature base for rare procedures, novel techniques, and outcomes reporting — low on the evidence hierarchy but often the only data for rare presentations. |
| **Volume-outcome relationship** | The empirically observed inverse relationship between hospital/surgeon procedure volume and mortality/morbidity — a primary reason clinicians case-find to high-volume centers. |
| **Center of excellence / referral center** | A facility designated for a specific procedure/condition (often by volume/outcome criteria); the target of deliberate case-finding and referral. |

### 6.2 How surgeons research a procedure (the case-finding loop)

1. **What is done** — the indicated procedure and its alternatives (guidelines, e.g., NICE/SAGES).
2. **Where it's done well** — registry outcomes (NSQIP, national audits) and the volume-outcome literature to identify high-performing centers.
3. **How it's done** — technique variation from case series and surgical videos; the evidence base for open vs laparoscopic vs robotic approaches.
4. **By whom / for whom** — surgeon volume, specialty, and patient-risk stratification (NSQIP risk calculator).

### 6.3 Primary sources

- **Birkmeyer JD, Siewers AE, Finlayson EV, et al. "Hospital volume and surgical mortality in the United States." *New England Journal of Medicine.* 2002;346:1128-1137. PMID 11948273.** The landmark study of the volume-outcome relationship for high-risk surgery — the empirical basis for surgical case-finding to high-volume centers. URL: https://pubmed.ncbi.nlm.nih.gov/11948273/
- **American College of Surgeons NSQIP.** Risk-adjusted surgical outcomes registry and the ACS NSQIP Surgical Risk Calculator (predicts individual patient complication/mortality risk). URL: https://www.facs.org/quality-programs/data-and-registries/acs-nsqip/
- **Birkmeyer JD, Finks JF, O'Reilly A, et al. "Surgical skill and complication rates after bariatric surgery." *New England Journal of Medicine.* 2013;369:1434-1442. PMID 24106936.** "Clinical outcomes after many complex surgical procedures vary widely across hospitals and surgeons … empirical data are lacking on the relationships between technical skill and postoperative outcomes" — links individual surgeon skill to risk-adjusted complication rates. URL: https://pubmed.ncbi.nlm.nih.gov/24106936/

*(Section 6 is intentionally brief, per the task scope.)*

---

## Appendix: Synthesis for the Agent Build

Mapping the above to a clinical decision-support agent + decision-tree UI:

1. **Reasoning core** — implement the Bayesian engine (Section 1.2): maintain a probability per hypothesis; start priors from base-rate/demographic data (Section 2); update with LRs on each finding.
2. **Hypothesis generation** — seed the differential from an illness-script / case-based knowledge base (Section 1.1); consider "horses first, zebras when atypical or high-cost-to-miss" (Section 2.1).
3. **Dual mode** — default to pattern matching (System 1) for characteristic cases; force an explicit analytical pass (System 2) when the presentation is atypical or the leading hypothesis is below the test-treatment threshold (Sections 1.4, 3.1).
4. **Next-test selection** — at each step, recommend the test with the greatest expected information gain for splitting the remaining differential, subject to the threshold model (test only in the testing zone) (Section 3).
5. **Tree visualization** — render the session as a decision tree (decision/chance/outcome nodes, per Section 4.1/4.3); each node shows the current probability per hypothesis, so the user sees the differential narrow.
6. **Explainability** — every conclusion emits a retraceable path: findings considered, priors/justifications, LRs applied, thresholds crossed, alternatives rejected — mirroring the SOAP Assessment (Section 5). This is also the regulatory requirement (WHO/FDA/EU AI Act).
7. **Treatment hand-off** — when a hypothesis crosses the test-treatment threshold, surface the plan and, for surgical conditions, the registry-based case-finding (NSQIP volume/outcome) (Section 6).
