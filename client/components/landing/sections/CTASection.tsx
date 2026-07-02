import { Phone, ArrowDown } from 'lucide-react';
import { displayPhoneNumber } from '@/lib/phoneUtils';

interface CTAConfig {
  label?: string;
}

interface CTASectionProps {
  config: CTAConfig;
  phoneNumber: string;
}

export default function CTASection({ config, phoneNumber }: CTASectionProps) {
  const label = config.label || 'Ready to get started?';

  return (
    <section className="py-14 px-6 bg-blue-600 text-white text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8">{label}</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {phoneNumber && (
            <a
              href={`tel:${phoneNumber}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white text-xl sm:text-2xl font-bold px-8 py-5 rounded-2xl shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Phone className="w-7 h-7" />
              Call {displayPhoneNumber(phoneNumber)}
            </a>
          )}
          <a
            href="#lead-form"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-blue-700 text-lg font-semibold px-6 py-4 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <ArrowDown className="w-5 h-5" />
            Get a Free Estimate
          </a>
        </div>
      </div>
    </section>
  );
}
