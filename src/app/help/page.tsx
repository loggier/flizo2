
"use client";

import Link from 'next/link';
import { FlizoLogo } from '@/components/icons/flizo-logo';
import { Phone, Globe } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/social-icons';
import { FacebookIcon } from '@/components/icons/social-icons';
import { InstagramIcon } from '@/components/icons/social-icons';
import { TikTokIcon } from '@/components/icons/tiktok-icon';
import { useLanguage } from '@/hooks/use-language';


const supportLinks = {
  whatsappSoporte: 'https://wa.me/528118627025',
  numContacto: '528118627025',
  facebook: 'http://facebook.com/flizo.app',
  instagram: 'http://instagram.com/flizo.app',
  tiktok: 'https://www.tiktok.com/@flizo.app?_t=ZS-8xpuHGrStIj&_r=1',
  website: 'https://flizo.com'
};

const ActionButton = ({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) => {
  if (!href) return null;

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-center">
      <div className="flex items-center justify-center w-20 h-20 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-md">
        <Icon className="w-10 h-10" />
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </Link>
  );
};


export default function HelpPage() {
    const { t } = useLanguage();

    const buttons = [
        {
            href: supportLinks.whatsappSoporte,
            icon: WhatsAppIcon,
            label: "WhatsApp"
        },
        {
            href: `tel:${supportLinks.numContacto}`,
            icon: Phone,
            label: "Llamar"
        },
        {
            href: supportLinks.facebook,
            icon: FacebookIcon,
            label: "Facebook"
        },
        {
            href: supportLinks.instagram,
            icon: InstagramIcon,
            label: "Instagram"
        },
        {
            href: supportLinks.tiktok,
            icon: TikTokIcon,
            label: "TikTok"
        },
        {
            href: supportLinks.website,
            icon: Globe,
            label: "Sitio Web"
        }
    ];

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 text-center bg-background">
      <div className="w-full max-w-md">
        
        <div className="mb-4 mt-4">
            <FlizoLogo className="mx-auto" />
        </div>

        <p className="text-lg font-semibold text-foreground mb-2">
            Contacta con Soporte
        </p>

        {supportLinks.numContacto && (
          <a href={`tel:${supportLinks.numContacto}`} className="text-2xl font-bold text-primary hover:underline">
            {supportLinks.numContacto}
          </a>
        )}

        <div className="grid grid-cols-3 gap-x-4 gap-y-8 mt-8">
            {buttons.map((btn, index) => (
                btn.href ? <ActionButton key={index} href={btn.href} icon={btn.icon} label={btn.label} /> : null
            ))}
        </div>
      </div>
    </div>
  );
}
