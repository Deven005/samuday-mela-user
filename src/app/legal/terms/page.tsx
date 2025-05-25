// /src/app/legal/terms/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | YourApp',
};

export default function TermsPage() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6 bg-base-100 text-base-content">
      <h1 className="text-3xl font-bold text-primary">Terms & Conditions</h1>
      <p className="text-base-content/70">Last updated: May 25, 2025</p>

      <section className="space-y-4">
        <p>
          Welcome to YourApp. These terms and conditions outline the rules and regulations for the
          use of YourApp's Website and Services.
        </p>

        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong>Acceptance of Terms</strong>
            <p>
              By accessing this website, we assume you accept these terms and conditions. Do not
              continue to use YourApp if you do not agree to all of the terms and conditions stated
              on this page.
            </p>
          </li>

          <li>
            <strong>License</strong>
            <p>
              Unless otherwise stated, YourApp and/or its licensors own the intellectual property
              rights for all material on YourApp. All intellectual property rights are reserved.
            </p>
          </li>

          <li>
            <strong>User Accounts</strong>
            <ul className="list-disc list-inside ml-6 space-y-1">
              <li>Users must provide accurate and complete information.</li>
              <li>
                Users are responsible for maintaining the confidentiality of their account
                information.
              </li>
              <li>Users must notify us immediately of any unauthorized use of their account.</li>
            </ul>
          </li>

          <li>
            <strong>Prohibited Activities</strong>
            <ul className="list-disc list-inside ml-6 space-y-1">
              <li>Using the service for any unlawful purpose.</li>
              <li>Attempting to interfere with the service's security features.</li>
              <li>Engaging in any activity that disrupts or interferes with the service.</li>
            </ul>
          </li>

          <li>
            <strong>Termination</strong>
            <p>
              We may terminate or suspend access to our service immediately, without prior notice or
              liability, for any reason whatsoever, including without limitation if you breach the
              Terms.
            </p>
          </li>

          <li>
            <strong>Limitation of Liability</strong>
            <p>
              In no event shall YourApp, nor its directors, employees, partners, agents, suppliers,
              or affiliates, be liable for any indirect, incidental, special, consequential or
              punitive damages.
            </p>
          </li>

          <li>
            <strong>Indemnification</strong>
            <p>
              You agree to defend, indemnify and hold harmless YourApp and its licensee and
              licensors, and their employees, contractors, agents, officers and directors.
            </p>
          </li>

          <li>
            <strong>Governing Law</strong>
            <p>
              These terms shall be governed and construed in accordance with the laws of [Your
              Country], without regard to its conflict of law provisions.
            </p>
          </li>

          <li>
            <strong>Changes to Terms</strong>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any
              time.
            </p>
          </li>

          <li>
            <strong>Contact Us</strong>
            <p>
              If you have any questions about these Terms, please contact us at support@yourapp.com.
            </p>
          </li>
        </ol>
      </section>
    </main>
  );
}
