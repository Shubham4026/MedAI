import React from "react";

// Example user photos (replace with actual images or URLs as needed)
const userPhotos = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/65.jpg",
  "https://randomuser.me/api/portraits/men/43.jpg",
  "https://randomuser.me/api/portraits/women/25.jpg",
  "https://randomuser.me/api/portraits/men/55.jpg",
];

const testimonials = [
  {
    text: `"MediAI has completely transformed how I manage my health. The personalized insights have helped me make better lifestyle choices."`,
    name: "Sarah Johnson",
    role: "Fitness Enthusiast",
    photo: userPhotos[0],
  },
  {
    text: `"As someone with chronic health issues, MediAI has been invaluable in helping me track my symptoms and medications."`,
    name: "Michael Chen",
    role: "Healthcare Professional",
    photo: userPhotos[1],
  },
  {
    text: `"The mental wellness features have been a game-changer for me. I'm more aware of my stress levels and have tools to manage them."`,
    name: "Emily Rodriguez",
    role: "Teacher",
    photo: userPhotos[2],
  },
  {
    text: `"Easy to use and packed with features. MediAI motivates me to stay on top of my health every day!"`,
    name: "David Lee",
    role: "Entrepreneur",
    photo: userPhotos[3],
  },
  {
    text: `"I love the reminders for medication and appointments. Highly recommend for anyone managing a busy life."`,
    name: "Priya Patel",
    role: "Parent",
    photo: userPhotos[4],
  },
  {
    text: `"MediAI's AI-powered insights are spot on. It's like having a personal health coach in my pocket!"`,
    name: "Alex Kim",
    role: "Student",
    photo: userPhotos[5],
  },
];

export default function TestimonialSection() {
  // Duplicate testimonials for seamless marquee
  const marqueeTestimonials = [...testimonials, ...testimonials];
  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
      <div className="px-4 md:px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="flex flex-col items-center">
              <span className="inline-flex items-center gap-2 text-teal-700 font-extrabold text-2xl md:text-3xl">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-teal-400"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17a4 4 0 01-4-4V7a4 4 0 014-4h3a4 4 0 014 4v6a4 4 0 01-4 4H7zm10 0a4 4 0 01-4-4V7a4 4 0 014-4h3a4 4 0 014 4v6a4 4 0 01-4 4h-3z"/></svg>
                Testimonials
              </span>
              <span className="block w-16 h-1 mt-2 rounded-full bg-gradient-to-r from-teal-400 via-teal-600 to-teal-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-3 mb-1 text-gray-900">What our users say</h2>
            <p className="max-w-[700px] text-gray-500 md:text-xl mb-2">
              Thousands of people have improved their health with MediAI.
            </p>
          </div>
        </div>
        <div className="mt-8 relative w-full overflow-hidden">
          <div
            className="flex gap-6 marquee-track"
            style={{
              width: `calc(${marqueeTestimonials.length} * 320px)`,
              animation: `marquee 32s linear infinite`,
            }}
          >
            {marqueeTestimonials.map((t, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-lg border p-6 shadow-sm min-w-[300px] max-w-[320px] min-h-[220px] bg-white flex-shrink-0"
              >
                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-3xl text-teal-200 mb-2 leading-none">“</span>
                  <p className="text-base md:text-lg italic text-gray-700 font-medium mb-2">{t.text}</p>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="h-14 w-14 rounded-full object-cover border border-teal-200"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Marquee CSS */}
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track {
              will-change: transform;
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}
