import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        <Card>
          <CardContent className="p-6">{children}</CardContent>
        </Card>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">{footerText} </span>
          <Link
            href={footerLinkHref}
            className="font-medium text-primary hover:underline"
          >
            {footerLinkText}
          </Link>
        </div>

        <div className="mt-2 text-center text-sm">
          <Link
            href="/"
            className="text-muted-foreground hover:text-primary hover:underline"
          >
            ← Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AuthSeparator() {
  return (
    <div className="relative my-4">
      <Separator />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-muted-foreground">
        atau
      </span>
    </div>
  );
}
