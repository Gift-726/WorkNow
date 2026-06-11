import { redirect } from 'next/navigation';

// Root redirects to login
// A landing page will be built in a future sprint (docs/13_TASKS.md)
export default function Home() {
  redirect('/auth/login');
}
