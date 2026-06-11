# WorkNow - Escrow & Payment System (Mock OPay Integration)

Since this is a pitch-ready MVP, real money transactions are replaced with a mock OPay integration. The prototype demonstrates a realistic funding and release flow.

---

## 1. Escrow Flow Lifecycle

```
[ Employer Creates Job ] 
           | (Status: Draft)
           v
[ Employer Deposits Funds ] --(Mock OPay Checkout)--> [ Job Becomes Active / Open ]
                                                               |
                                                               v
                                                      [ Worker Applies ]
                                                               |
                                                               v
                                                      [ Employer Accepts ] --(Status: Assigned)--> [ In Progress ]
                                                               |
                                                               v
                                                      [ Worker Completes Work ] --(Status: Pending Approval)
                                                               |
                                                               v
                                                      [ Employer Approves ]
                                                               |
                                                               v
                                                      [ Escrow Releases Funds ] --(Status: Completed)
```

1.  **Employer Creates Job:** Job status is initially set to `Draft`.
2.  **Employer Deposits Funds:** Employer deposits funds via mock OPay Checkout on the funding page at `/employer/payments`.
3.  **Job Becomes Active:** Once funded, the status changes to `Open` (Active) on the feed at `/worker/jobs`.
4.  **Worker Applies:** Worker submits their application.
5.  **Employer Accepts:** Employer accepts the worker from the applicants list (`/employer/applicants`). The job status moves to `Assigned` -> `In Progress`.
6.  **Worker Completes Work:** The worker clicks "Submit Task" on their dashboard. Status changes to `Pending Approval`.
7.  **Employer Approves:** Employer inspects and approves the job.
8.  **Escrow Releases Funds:** Funds are released from the platform escrow to the worker's balance (`/worker/wallet`). Status updates to `Completed`.

---

## 2. Job & Escrow Statuses

The following statuses track the active state of a job and its associated escrow balance:

*   **Draft:** Job details created but escrow funds not yet deposited.
*   **Funded:** Payment deposited, awaiting activation.
*   **Open:** Active job visible to workers on the job feed.
*   **Assigned:** A worker has been accepted for the task.
*   **In Progress:** The worker is currently executing the task.
*   **Pending Approval:** Worker marked work as complete; awaiting employer verification.
*   **Completed:** Employer approved work; escrow funds released to worker.
*   **Cancelled:** Job closed without matching, or terminated with refund before assignment.
*   **Disputed:** Escrow funds locked due to a disagreement, awaiting admin mediation at `/admin/disputes`.
