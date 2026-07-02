interface HeadlineConfig {
  text?: string;
  subtext?: string;
}

interface HeadlineSectionProps {
  config: HeadlineConfig;
}

export default function HeadlineSection({ config }: HeadlineSectionProps) {
  const { text, subtext } = config;
  if (!text && !subtext) return null;

  return (
    <section className="py-14 px-6 text-center bg-white">
      <div className="max-w-3xl mx-auto">
        {text && <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{text}</h2>}
        {subtext && <p className="text-lg sm:text-xl text-gray-600">{subtext}</p>}
      </div>
    </section>
  );
}
