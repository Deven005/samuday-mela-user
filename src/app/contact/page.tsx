import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="bg-gradient-to-br from-base-100 via-base-200 to-base-100 text-base-content px-6 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT SIDE: Contact Info */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center aspect-[2/1] text-white text-6xl font-bold">
            ✉️
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold">Get in Touch</h1>
          <p className="text-lg text-base-content/70">
            We'd love to hear from you! Reach out for any questions, suggestions, or just to say
            hello.
          </p>
          <div className="space-y-2">
            <p>
              📍 <span className="font-semibold">Our Office:</span> 123 A Street, Bharat
            </p>
            <p>
              ✉️ <span className="font-semibold">Email:</span>{' '}
              <Link href="mailto:hello@yourapp.com" className="link link-primary">
                hello@yourapp.com
              </Link>
            </p>
            <p>
              📞 <span className="font-semibold">Phone:</span>{' '}
              <Link href="tel:+1234567890" className="link link-primary">
                +1 (234) 567-890
              </Link>
            </p>
            <div className="flex space-x-4 mt-4">
              <Link href="#" className="btn btn-sm btn-outline">
                🌐 Website
              </Link>
              <Link href="#" className="btn btn-sm btn-outline">
                🐦 Twitter
              </Link>
              <Link href="#" className="btn btn-sm btn-outline">
                📘 Facebook
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Contact Form */}
        <div className="lg:col-span-2">
          <div className="card bg-base-200 p-6 rounded-2xl shadow-lg">
            <form className="space-y-6">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Message</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Write your message here..."
                  rows={5}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full hover:scale-105 transition">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
