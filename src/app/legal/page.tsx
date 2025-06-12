// /src/app/legal/page.tsx
import Link from 'next/link';

export const metadata = {
  title: 'Legal | Samuday Mela',
};

export default function LegalIndexPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 bg-base-100 text-base-content">
      <h1 className="text-3xl font-bold text-primary mb-4">Legal Documents</h1>
      <p className="mb-6 text-base-content/70">Please review our legal documents below:</p>

      <ul className="space-y-4 list-disc list-inside">
        {[
          { href: '/legal/privacy', label: 'Privacy Policy' },
          { href: '/legal/terms', label: 'Terms & Conditions' },
          { href: '/legal/refund', label: 'Refund Policy' },
          { href: '/legal/cookies', label: 'Cookie Policy' },
          { href: '/legal/disclaimer', label: 'Disclaimer' },
          { href: '/legal/data-deletion', label: 'Data Deletion Instructions' },
        ].map((item) => (
          <li key={item.href}>
            <Link className="text-primary hover:underline" href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
