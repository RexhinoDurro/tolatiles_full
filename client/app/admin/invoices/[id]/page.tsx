'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InvoiceDetailRedirectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/admin/crm/invoices/${params.id}`);
  }, [params.id, router]);

  return null;
}
