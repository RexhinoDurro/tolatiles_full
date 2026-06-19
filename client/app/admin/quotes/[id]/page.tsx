'use client';

import { useParams } from 'next/navigation';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuoteDetailRedirectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/admin/crm/quotes/${params.id}`);
  }, [params.id, router]);

  return null;
}
