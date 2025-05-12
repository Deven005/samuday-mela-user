import Image from 'next/image';
import { getAppData } from '../utils/utils';

export default async function AboutPage() {
  const appData = await getAppData();

  // fallback icons (using emoji since we avoid lucide-react)
  const featureIcons = ['💡', '🤝', '📢', '🏆', '📅', '👤'];

  return (
    <div className="bg-gradient-to-br from-base-100 via-base-200 to-base-100 text-base-content px-6 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT SIDE */}
        <div className="space-y-6 lg:col-span-1">
          <div className="relative w-full aspect-[3/2] overflow-hidden rounded-lg transition duration-200 hover:scale-105">
            <Image
              src={appData?.bannerUrl || '/fallback.jpg'}
              alt={`${appData?.appName} Banner`}
              fill
              className="object-fill"
              draggable={false}
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold">{appData?.appName}</h1>
          <p className="text-xl md:text-2xl text-base-content/70">{appData?.tagline}</p>
          <p className="text-lg leading-relaxed">{appData?.description}</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-12 lg:col-span-2">
          {/* Features */}
          {appData?.features && (
            <section className="space-y-6">
              <h2 className="text-3xl font-bold text-center lg:text-left">Platform Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {appData.features.map((feature: any, index: number) => (
                  <div
                    key={index}
                    className="card bg-base-200 rounded-2xl p-5 shadow hover:shadow-lg transition hover:scale-105"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">{featureIcons[index % featureIcons.length]}</div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-base-content/70">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Mission */}
          <section className="card bg-base-200 rounded-2xl p-6 shadow space-y-3 hover:shadow-lg transition hover:scale-105">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-lg">
              We believe in empowering communities, amplifying voices, and creating opportunities
              for everyone to shine. With engaging content, interactive competitions, and a space
              for genuine connections, we’re building the ultimate hub for today’s generation.
            </p>
          </section>

          {/* Testimonials */}
          {/* <section className="space-y-6">
            <h2 className="text-3xl font-bold text-center lg:text-left">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  quote: 'This platform changed how I share ideas and connect with others.',
                  name: 'Priya Sharma',
                },
                {
                  quote: 'A refreshing community experience that values creativity.',
                  name: 'Ravi Patel',
                },
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="card bg-base-200 p-4 rounded-xl shadow hover:shadow-lg transition"
                >
                  <p className="italic text-base-content/80">“{testimonial.quote}”</p>
                  <p className="mt-2 font-semibold text-base-content">{testimonial.name}</p>
                </div>
              ))}
            </div>
          </section> */}

          {/* Social Proof */}
          {/* <section className="space-y-4">
            <h2 className="text-3xl font-bold text-center lg:text-left">Trusted By</h2>
            <div className="flex flex-wrap gap-6 items-center justify-center lg:justify-start">
              {['/logo1.svg', '/logo2.svg', '/logo3.svg'].map((logo, i) => (
                <Image
                  key={i}
                  src={logo}
                  alt={`Partner ${i + 1}`}
                  width={100}
                  height={40}
                  className="object-contain grayscale hover:grayscale-0 transition"
                />
              ))}
            </div>
          </section> */}

          {/* Call to Action */}
          <section className="space-y-3 text-center lg:text-left">
            <h2 className="text-3xl font-bold">Ready to Join?</h2>
            <p className="text-lg">
              Sign up today and be part of a growing community where your voice matters.
            </p>
            <a href="/signup" className="btn btn-primary btn-lg transition hover:scale-105">
              Get Started Now
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
