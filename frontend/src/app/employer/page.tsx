// Employer dashboard placeholder — will be implemented in Sprint 2 (docs/13_TASKS.md)
export default function EmployerDashboard() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="inline-block w-12 h-12 rounded-full bg-[#E6FAF2] flex items-center justify-center mb-4 mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#00C16A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#111827] mb-2">Employer account ready!</h1>
        <p className="text-[#4B5563] text-sm">
          Your employer account is created. The employer dashboard is coming in Sprint 2.
        </p>
      </div>
    </main>
  );
}
