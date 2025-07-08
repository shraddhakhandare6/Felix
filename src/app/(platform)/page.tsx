
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page redirects to the main dashboard.
export default function RootRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);

    return null;
}
