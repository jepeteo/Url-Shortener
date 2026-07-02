import Link from "next/link";
import { ArrowRight, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MTX_STUDIO_CONTACT_URL,
  MTX_STUDIO_EMAIL,
  MTX_STUDIO_URL,
} from "@/lib/mtxStudio";

export const metadata = {
  title: "Contact — mikrouli.link",
  description:
    "Get in touch about mikrouli.link. Support and enquiries are handled by MTX Studio.",
};

const contactMethods = [
  {
    icon: MessageSquare,
    title: "Contact form",
    description: "Send a message and the MTX Studio team will get back to you.",
    href: MTX_STUDIO_CONTACT_URL,
    cta: "Open contact form",
    external: true,
  },
  {
    icon: Mail,
    title: "Email",
    description: "Prefer email? Reach the team directly.",
    href: `mailto:${MTX_STUDIO_EMAIL}`,
    cta: MTX_STUDIO_EMAIL,
    external: false,
  },
];

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Contact</h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Questions about mikrouli.link, billing, or your account? We&apos;re here to
          help. Support is provided by{" "}
          <a
            href={MTX_STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            MTX Studio
          </a>
          , the team behind this service.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {contactMethods.map((method) => (
          <Card key={method.title}>
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <method.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-semibold">{method.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </div>
              </div>
              <Button asChild variant={method.external ? "default" : "outline"}>
                <a
                  href={method.href}
                  {...(method.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {method.cta}
                  {method.external && (
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  )}
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        For privacy or legal enquiries, see our{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
