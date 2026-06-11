# WorkNow - Identity & Verification System (Mocked)

For the pitch-ready MVP prototype, identity checking is modeled to demonstrate high-trust onboarding flows without running live connections to Government databases.

---

## 1. Onboarding Verification Flow (Worker Profile)
To unlock jobs, workers submit identity details in the profile dashboard:

```
[ Input 11-digit NIN ] -> [ Upload Mock NIN Slip Photo ] -> [ Status: PENDING ]
                                                                   |
                                                                   v
                                                        [ Admin Queue Review ]
                                                                   |
                                                      +------------+------------+
                                                      |                         |
                                                      v                         v
                                                 [ APPROVED ]             [ REJECTED ]
                                              (Verif. Badge Added)     (Notification sent)
```

1.  **Form Input:** Worker enters an 11-digit National Identification Number (NIN) in the profile setup page at `/worker/profile`.
2.  **Upload Card:** User uploads a mock card image representing the slip.
3.  **State Locked:** Profile verification state changes from `UNVERIFIED` to `PENDING`.
4.  **Admin Queue:** The request appears in the Admin Portal queue for validation at `/admin/verification`.

---

## 2. Verification Pages & Route Mapping
Identity verification flows are split across key user and admin routing zones:

*   **`/auth/register` & `/auth/role-selection`:** Users establish their identity framework and select their worker/employer persona.
*   **`/worker/profile`:** Under the worker profile view, workers input their 11-digit NIN and upload mock document cards.
*   **`/admin/verification`:** The manual verification queue where administrators inspect submitted NIN numbers and mock cards to approve or reject verification requests.

---

## 3. UI Trust Indicators
*   **Green Check Badge (`#00C16A`):** Appended to verified worker names on job application lists (`/employer/applicants`), signaling high trust to employers.
*   **Unverified Notice:** Unverified users see warning cards prompting them to submit verification to start applying.
*   **Verification Status Enum:** Tracks database state: `UNVERIFIED`, `PENDING`, `VERIFIED`, `REJECTED`.
