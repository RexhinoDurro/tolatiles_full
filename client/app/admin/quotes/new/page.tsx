import { redirect } from 'next/navigation';

export default function NewQuotePage() {
  redirect('/admin/crm/quotes/new');
}
