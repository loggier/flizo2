
"use client";

import Link from 'next/link';
import { FlizoLogo } from '@/components/icons/flizo-logo';
import { Phone, Globe, Mail } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/social-icons';
import { FacebookIcon } from '@/components/icons/social-icons';
import { InstagramIcon } from '@/components/icons/social-icons';
import { TikTokIcon } from '@/components/icons/tiktok-icon';
import { useLanguage } from '@/hooks/use-language';


const ActionButton = ({ href, icon: Icon, label, ...props }: { href: string, icon: React.ElementType, label: string, [key: string]: any }) => {
  if (!href) return null;

  return (
    <Link href={href} {...props} className="flex flex-col items-center gap-2 text-center">
      <div className="flex items-center justify-center w-20 h-20 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-md">
        <Icon className="w-10 h-10" />
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </Link>
  );
};


export default function HelpPage() {
    const { t } = useLanguage();

    const whatsappSoporte = process.env.NEXT_PUBLIC_whatsappSoporte;
    const numContacto = process.env.NEXT_PUBLIC_numContacto;
    const mailContacto = process.env.NEXT_PUBLIC_mailContacto;
    const facebook = process.env.NEXT_PUBLIC_facebook;
    const instagram = process.env.NEXT_PUBLIC_instagram;
    const tiktok = process.env.NEXT_PUBLIC_tiktok;
    const website = process.env.NEXT_PUBLIC_web || 'https://flizo.com';


    const buttons = [
        {
            href: whatsappSoporte,
            icon: WhatsAppIcon,
            label: "WhatsApp",
            target: "_blank",
            rel: "noopener noreferrer"
        },
        {
            href: `tel:${numContacto}`,
            icon: Phone,
            label: "Llamar"
        },
        {
            href: `mailto:${mailContacto}`,
            icon: Mail,
            label: "Email"
        },
        {
            href: facebook,
            icon: FacebookIcon,
            label: "Facebook",
            target: "_blank",
            rel: "noopener noreferrer"
        },
        {
            href: instagram,
            icon: InstagramIcon,
            label: "Instagram",
            target: "_blank",
            rel: "noopener noreferrer"
        },
        {
            href: tiktok,
            icon: TikTokIcon,
            label: "TikTok",
            target: "_blank",
            rel: "noopener noreferrer"
        },
        {
            href: website,
            icon: Globe,
            label: "Sitio Web",
            target: "_blank",
            rel: "noopener noreferrer"
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

        {numContacto && (
          <a href={`tel:${numContacto}`} className="text-2xl font-bold text-primary hover:underline">
            {numContacto}
          </a>
        )}

        {mailContacto && (
            <div className="mt-1">
                <a href={`mailto:${mailContacto}`} className="text-lg font-medium text-primary hover:underline">
                    {mailContacto}
                </a>
            </div>
        )}

        <div className="grid grid-cols-3 gap-x-4 gap-y-8 mt-8">
            {buttons.map((btn, index) => (
                btn.href ? <ActionButton key={index} {...btn} /> : null
            ))}
        </div>
      </div>
    </div>
  );
}
