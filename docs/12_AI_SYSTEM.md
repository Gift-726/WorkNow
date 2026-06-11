# WorkNow - Gemini AI Systems

To demonstrate trust and security at scale, WorkNow designs its intelligence layer using mocked Gemini AI integrations to moderate behavior, resolve disputes, and block fraud.

---

## 1. Fraud Detection
The system automatically audits incoming job descriptions and user profiles for security violations:
*   **Fake Jobs:** Filters listings that advertise non-existent tasks, false addresses, or generic spam.
*   **Scam Wording:** Detects suspicious recruiting text, high budget baiting, and recruitment scams.
*   **Suspicious Payment Requests:** Flags attempts to bypass OPay escrow (e.g. asking for offline cash deposits, wire transfers, or external bank codes).

---

## 2. Dispute Analysis
When a dispute is filed on a completed job, the AI acts as a digital mediator to speed up resolution:
*   **Analyze Worker Complaint:** Parses the worker's description of work completed and review logs.
*   **Analyze Employer Complaint:** Parses the employer's reasons for rejecting work.
*   **Recommend Outcome:** Generates a structured recommendation for the Admin (e.g., "Recommend 100% release to worker" or "Recommend 50/50 split based on partial task completion evidence").

---

## 3. Review Fraud Detection
Protects the reputation scores of workers and employers on the platform:
*   **Detect Fake Ratings:** Analyzes review patterns (e.g. repeated perfect scores from the same device or IP range).
*   **Detect Review Rings:** Flags networks of users cooperating to write fake reviews to artificially inflate each other's ratings.

---

## 4. Behaviour Monitoring
Tracks account metrics over time to identify bad actors:
*   **Excessive Cancellations:** Flags workers or employers who repeatedly cancel accepted contracts before clock-in.
*   **High Dispute Rates:** Flags accounts involved in frequent mediation requests.
*   **Repeated Complaints:** Flags users receiving multiple safety notices or safety questionnaire complaints.
