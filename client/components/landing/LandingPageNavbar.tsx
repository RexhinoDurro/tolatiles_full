import Image from 'next/image';
import { Phone } from 'lucide-react';
import { displayPhoneNumber } from '@/lib/phoneUtils';

interface LandingPageNavbarProps {
  phoneNumber: string;
}

export default function LandingPageNavbar({ phoneNumber }: LandingPageNavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Image
          src="/images/logoLong.webp"
          alt="Tola Tiles"
          width={180}
          height={40}
          className="h-8 sm:h-10 w-auto"
          priority
        />
        {phoneNumber && (
          <a
            href={`tel:${phoneNumber}`}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
          >
            <Phone className="w-5 h-5" />
            <span className="hidden sm:inline">{displayPhoneNumber(phoneNumber)}</span>
          </a>
        )}
      </div>
    </header>
  );
}
