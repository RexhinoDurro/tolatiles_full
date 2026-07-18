import Image from 'next/image';
import { Phone } from 'lucide-react';
import { displayPhoneNumber } from '@/lib/phoneUtils';

interface LandingPageNavbarProps {
  phoneNumber: string;
}

export default function LandingPageNavbar({ phoneNumber }: LandingPageNavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-brand-ink shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Image
          src="/images/whitelogo.svg"
          alt="Tola Tiles"
          width={694}
          height={250}
          className="h-9 sm:h-11 w-auto"
          priority
        />
        {phoneNumber && (
          <a
            href={`tel:${phoneNumber}`}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-white hover:bg-gray-100 text-brand-ink font-bold px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition-colors whitespace-nowrap text-sm sm:text-base shadow-sm"
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-[#00a8e8]" />
            <span>{displayPhoneNumber(phoneNumber)}</span>
          </a>
        )}
      </div>
    </header>
  );
}
