export const metadata = {
  title: 'FAQ | Samuday Mela',
};

export default function FaqPage() {
  const faqItems = [
    {
      question: 'What is this platform about?',
      answer:
        'This platform is a community-driven space where you can share posts, connect with others, join competitions, and participate in events tailored to your interests.',
    },
    {
      question: 'How do I sign up?',
      answer:
        'Click on the "Sign Up" button on the top right corner and follow the steps to create your account. You can sign up using your email or social media accounts.',
    },
    {
      question: 'Is there a membership fee?',
      answer:
        'No, joining the platform is completely free! We believe in providing open access to everyone.',
    },
    {
      question: 'How can I participate in competitions?',
      answer:
        'Visit the "Competitions" section in your dashboard, browse active contests, and follow the participation guidelines provided.',
    },
    {
      question: 'Can I host my own event or competition?',
      answer:
        'Yes! Once you’ve created your profile, you can apply to host events or competitions through the "Host" section. Our team will review and assist you in setting it up.',
    },
  ];

  return (
    <div className="bg-base-200 text-base-content px-6 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT SIDE: Title + Intro */}
        <div className="space-y-6 lg:col-span-1">
          <h1 className="text-4xl md:text-5xl font-extrabold">Frequently Asked Questions</h1>
          <p className="text-lg text-base-content/70">
            Here are some of the most common questions we get. If you don’t see your question here,
            feel free to contact us anytime!
          </p>
        </div>

        {/* RIGHT SIDE: FAQ Accordion */}
        <div className="lg:col-span-2 space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="collapse collapse-arrow bg-base-200 rounded-xl shadow">
              <input type="checkbox" className="peer" />
              <div className="collapse-title text-xl font-semibold">{item.question}</div>
              <div className="collapse-content">
                <p className="text-base-content/70">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
