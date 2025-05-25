// /src/app/legal/refund/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | YourApp',
};

export default function RefundPolicyPage() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6 bg-base-100 text-base-content">
      <h1 className="text-3xl font-bold text-primary">Refund Policy</h1>
      <p className="text-base-content/70">Last updated: May 25, 2025</p>

      <section className="space-y-4">
        <p>
          Thank you for shopping at YourApp. If you are not entirely satisfied with your purchase,
          we're here to help.
        </p>

        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong>Eligibility for Refunds</strong>
            <ul className="list-disc list-inside ml-6 space-y-1">
              <li>Item must be unused and in the same condition that you received it.</li>
              <li>Item must be in the original packaging.</li>
              <li>Item needs to have the receipt or proof of purchase.</li>
            </ul>
          </li>

          <li>
            <strong>Non-returnable Items</strong>
            <ul className="list-disc list-inside ml-6 space-y-1">
              <li>Downloadable software products.</li>
              <li>Some health and personal care items.</li>
            </ul>
          </li>

          <li>
            <strong>Refunds</strong>
            <p>
              Once we receive your item, we will inspect it and notify you on the status of your
              refund after inspecting the item.
            </p>
          </li>

          <li>
            <strong>Shipping</strong>
            <p>
              You will be responsible for paying for your own shipping costs for returning your
              item. Shipping costs are non­refundable.
            </p>
          </li>

          <li>
            <strong>Contact Us</strong>
            <p>
              If you have any questions on how to return your item to us, contact us at
              support@yourapp.com.
            </p>
          </li>
        </ol>
      </section>
    </main>
  );
}
