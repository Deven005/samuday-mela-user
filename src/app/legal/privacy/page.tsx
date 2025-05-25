// src/app/legal/privacy/page.tsx
const PrivacyPolicy = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 text-base-content">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4 text-base-content/70">Effective Date: May 25, 2025</p>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
        <p>
          Welcome to YourCommunity. We value your privacy and are committed to protecting your
          personal information. This Privacy Policy outlines how we collect, use, and share your
          data when you use our platform.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">2. Information We Collect</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Personal identification information (Name, email address, phone number, etc.)</li>
          <li>Usage data and analytics</li>
          <li>Cookies and tracking technologies</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">3. How We Use Your Information</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>To provide and maintain our services</li>
          <li>To improve user experience</li>
          <li>To communicate with you, including sending updates and promotional materials</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">4. Sharing Your Information</h2>
        <p>
          We may share your information with third-party service providers, such as Firebase and
          analytics tools, to facilitate our services. These providers are obligated to protect your
          data and use it only for the purposes we specify.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">5. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your data. However, no method of
          transmission over the internet is entirely secure, and we cannot guarantee absolute
          security.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">6. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal information. To exercise
          these rights, please contact us at privacy@yourcommunity.com.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by
          posting the new policy on this page.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">8. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at
          privacy@yourcommunity.com.
        </p>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
