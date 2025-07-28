
import { cn } from "@/lib/utils";

export function WhatsAppIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn(className)} {...props}>
        <path d="M16.75 13.96c.25.5.12 1.08-.29 1.48l-1.14.94c-.49.4-.95.84-1.52 1.03-.57.19-1.16.1-1.7-.22-.54-.32-1.29-.8-2.16-1.5-.87-.7-1.74-1.63-2.4-2.7-.66-1.07-1.1-2.25-1.05-3.41.05-.1.09-.19.14-.28.46-1.03 1.1-1.93 1.88-2.65.25-.23.57-.4.9-.53.33-.13.68-.2.98-.2h.1c.33 0 .66.07.96.22.3.15.56.36.78.62l.16.2c.22.25.4.52.56.81.16.29.3.6.4.92.1.32.16.65.18.98l.02.19c0 .33-.07.66-.21.96-.14.3-.34.58-.58.8-.24.22-.5.4-.75.56-.25.16-.49.28-.73.37-.24.09-.47.14-.69.14h-.05c-.2 0-.4-.03-.59-.09s-.38-.15-.55-.27l-.14-.1c-.16-.12-.3-.26-.43-.41-.13-.15-.24-.31-.33-.48-.09-.17-.16-.34-.2-.51-.04-.17-.06-.34-.06-.51s.03-.34.08-.51c.05-.17.13-.33.22-.49.09-.16.2-.31.32-.45l.43-.48c.18-.2.38-.38.6-.53.22-.15.46-.28.7-.38.24-.1.49-.17.74-.2.25-.03.5-.02.75.03.25.05.5.13.73.25.23.12.45.28.64.48.19.2.36.42.5.67l.02.03zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path>
    </svg>
  );
}

export function FacebookIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cn(className)} {...props}>
        <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"></path>
      </svg>
    );
  }
  
  export function InstagramIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...props}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    );
  }
