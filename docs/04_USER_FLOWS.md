# WorkNow - User Journeys & Safety Flows

Below are the mapped user flows representing the worker journey, employer journey, and platform safety operations.

---

## 1. Worker Journey

```mermaid
graph TD
    A[Register] --> B[Select Worker Role]
    B --> C[Complete Profile]
    C --> D[Verify Identity - Mock NIN]
    D --> E[Browse Jobs]
    E --> F[Apply to Job]
    F --> G[Application Accepted]
    G --> H[Clock In / Resumption]
    H --> I[Complete Job]
    I --> J[Receive Payment]
    J --> K[Rate Employer]
```

---

## 2. Employer Journey

```mermaid
graph TD
    A[Register] --> B[Select Employer Role]
    B --> C[Complete Profile]
    C --> D[Verify Identity]
    D --> E[Create Job]
    E --> F[Fund Escrow - Mock OPay]
    F --> G[Receive Applications]
    G --> H[Accept Worker]
    H --> I[Approve Completion]
    I --> J[Release Payment]
```

---

## 3. Safety & SOS Flow

```mermaid
graph TD
    A[Worker Accepts Job] --> B[Log Resumption Intent]
    B --> C[GPS Check-in - Mocked]
    C --> D[SOS Button Enabled]
    D --> E{Emergency Occurs?}
    E -- Yes --> F[Trigger SOS - Admin Notified]
    E -- No --> G[Job Completed Successfully]
    G --> H[Safety Check-out After Completion]
```
