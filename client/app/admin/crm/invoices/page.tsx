'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InvoicesRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/crm/deals'); }, [router]);
  return null;
}
