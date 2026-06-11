# WorkNow - Safety & SOS System

Safety is a core pillar of WorkNow. The platform incorporates strict safety features, active logging, location monitoring, and timezone restrictions designed to protect casual workers and employers.

---

## 1. Safety Features

*   **Emergency Contact:** Users register a trusted emergency contact number. If an emergency occurs, this contact is alerted.
*   **Resumption Intent Logging:** Worker signals they are active and heading to the job site. This starts a session on `/worker/safety`.
*   **GPS Check In:** Worker clicks check-in upon arriving at the location. The app validates coordinates against the job's defined location (mocked).
*   **GPS Monitoring:** Logs coordinates periodically during the active job window to confirm safety.
*   **Emergency SOS Button:** A floating button (`#EF4444`) present during active jobs. Triggering it alerts the admin safety panel `/admin/safety` immediately.
*   **Post Job Safety Survey:** Mandated checkout questionnaire before payments can be released.

---

## 2. Safety Restrictions & Guardrails

To prevent hazardous situations, the platform enforces strict time limits:
*   **No Jobs Before 7:00 AM:** Jobs cannot start or clock-in before this time.
*   **No Jobs After 6:00 PM:** Jobs must conclude, and workers cannot clock-in or begin new tasks after this time. If a job is active near 6:00 PM, workers receive push warnings prompting them to complete or pause.

---

## 3. Post-Job Safety Survey Questions

When the worker marks the job as completed, they must submit answers to the following three safety questions:
1.  **Did you feel safe?** (Yes / No)
2.  **Would you work here again?** (Yes / No)
3.  **Any incidents?** (Yes / No - If Yes, prompts details uploader)

*If any negative answers are recorded or incidents flagged, the system automatically logs a warning flag in the Admin Safety alerts (`/admin/safety`), suspending new job creation for that employer until manual review.*
