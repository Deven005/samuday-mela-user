// /src/app/legal/data-deletion/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Deletion Instructions | YourApp',
};

export default function DataDeletionPage() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6 bg-base-100 text-base-content">
      <h1 className="text-3xl font-bold text-primary">Data Deletion Instructions | Coming later!</h1>
      <p className="text-base-content/70">Last updated: May 25, 2025</p>

      <section className="space-y-4">
        <p>If you wish to delete your data from YourApp, please follow the instructions below:</p>

        <ol className="list-decimal list-inside space-y-2">
          <li>Log into your account on YourApp.</li>
          <li>Navigate to your account settings.</li>
          <li>Click on "Delete Account" and follow the on-screen instructions.</li>
          <li>
            Confirm the deletion via the confirmation email sent to your registered email address.
          </li>
        </ol>

        <p>
          Alternatively, if you have used Facebook to log in to YourApp, you can remove YourApp from
          your Facebook account:
        </p>

        <ol className="list-decimal list-inside space-y-2">
          <li>Go to your Facebook Account's Settings & Privacy.</li>
          <li>Click on "Settings".</li>
          <li>Navigate to "Apps and Websites".</li>
          <li>Find "YourApp" and click "Remove".</li>
        </ol>

        <p>
          If you have any questions or need assistance, please contact us at support@yourapp.com.
        </p>
      </section>
    </main>
  );
}
