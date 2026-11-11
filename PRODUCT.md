# Product.md

## 1. Who Loses the Most When a Question is Broken?
**The honest, hardworking aspirant scoring in the 90th–98th percentile.**

A student scoring 40% will likely shrug off a broken question as their own lack of preparation. A genius scoring 99.8% can recognize a flawed question and move on with confidence. 

The student who suffers catastrophic harm is the dedicated aspirant who has mastered the concept, solves the question correctly, finds their answer rejected by a corrupted key, and spends 45 minutes doubting their preparation, losing momentum and confidence weeks before JEE/NEET. 

### How Our Design Reflects That:
- **Fast, Empathetic Student Responses:** Every student report receives a constructive, academically verified 1–3 sentence reply. If they were right, we validate their intuition immediately. If they fell for a trap (e.g., significant figures in R033 or vector vs scalar addition in R003), we explain the exact physics principle with empathy rather than an impersonal automated dismissal.
- **Surgical Question Updates:** When an answer key or option is repaired, the active question record is updated without corrupting original MathML, formatting, or diagrams, ensuring all future students receive a flawless testing experience.

---

## 2. What We Would NEVER Let the AI Auto-Apply, and Why
1. **Answer Key Changes (`answer_key`):**
   *Why:* In competitive exams, a changed answer key retroactively flips rank distributions across thousands of mock test takers. If an AI hallucinates a wrong answer on a subtle quantum physics question, it inflicts platform-wide damage. Answer key corrections require mandatory faculty signoff with independent mathematical proof.
2. **Authoring New Distractors (`identical_options`):**
   *Why:* When two options repeat, replacing the duplicate requires authoring a plausible, curriculum-aligned distractor that tests specific common misconceptions without creating two correct answers. Distractor authoring is pedagogical content creation, not data cleaning.
3. **Ambiguous or Unsound Problems (`unsound`, `wrong_question`):**
   *Why:* If a question statement and solution belong to different questions or lack sufficient boundary conditions, an AI must never improvise or guess academic facts. Human faculty must retire or rewrite the question.

---

## 3. The One Metric to Watch in Week 1
**Faculty Escalation Rejection Rate (FERR):**
$$\text{FERR} = \frac{\text{Faculty Rejections of AI-Escalated Cases}}{\text{Total Cases Sent to Faculty Review}}$$

- **Why it matters:** In week 1, faculty bandwidth is the ultimate bottleneck. A high FERR means the AI is escalating "garbage" or false alarms to already overworked faculty members at 10 PM. 
- **Target:** FERR $< 5\%$. We want at least 95% of cases escalated to faculty to be high-conviction, actionable defects with clean pre-computed diffs, allowing faculty to review and approve cases in under 15 seconds.

---

## 4. One Idea Beyond This Brief: "Live Exam Anomaly Pulse"
**Pre-Emptive Defect Detection via Real-Time Cohort Telemetry.**

Instead of waiting for students to manually click "Report error" and type a comment, we can detect broken questions in real time using aggregated live telemetry:
1. **Bimodal Time-to-Solve Spike:** If top-quartile students spend $3\times$ their typical time on a question and abandon it, or if option selection distribution shows an unexpected bimodal split, the system flags the question within 20 minutes of test release.
2. **Reverse Solver Trigger:** An automated anomaly agent pulls questions with sudden drops in discrimination index ($r_{pbi}$) and runs an instant multi-model verification before students even complete their exam session.
3. **Automated Provisional Credit:** If a defective answer key is confirmed during an active nationwide mock test, the platform dynamically awards provisional marks to affected cohorts before scorecards are generated, completely eliminating student anxiety.
