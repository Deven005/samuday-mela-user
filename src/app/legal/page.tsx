
import Link from 'next/link';

export default function LegalIndexPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 text-base-content">
      <h1 className="text-3xl font-bold mb-6">Legal & Policies 📜</h1>
      <p className="mb-4 text-base-content/70">Explore our legal policies for transparency and trust:</p>
      <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><Link href="/legal/privacy">Privacy Policy</Link></li>
        <li><Link href="/legal/terms">Terms & Conditions</Link></li>
        <li><Link href="/legal/refund">Refund & Cancellation</Link></li>
        <li><Link href="/legal/community">Community Guidelines</Link></li>
        <li><Link href="/legal/cookies">Cookie Policy</Link></li>
      </ul>
    </main>
  );
}
