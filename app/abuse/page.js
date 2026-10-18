import Link from "next/link";
import { AbuseReportForm } from "@/components/AbuseReportForm";
import { Card, CardContent } from "@/components/ui/card";
import { absoluteShortUrl, isReportableUrl } from "@/lib/abuseReport";
import { OPERATOR } from "@/lib/operator";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Report abuse — mikrouli.link",
  description:
    "Report a mikrouli.link short URL used for phishing, malware, spam, or illegal content.",
  path: "/abuse",
});

export default async function AbusePage({ searchParams }) {
  const params = await searchParams;
  const fromCode = absoluteShortUrl(typeof params?.code === "string" ? params.code : "");
  const fromUrl = typeof params?.url === "string" ? params.url.trim() : "";
  const initialUrl = isReportableUrl(fromUrl) ? fromUrl : fromCode || "";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Report abuse</h1>
        <p className="max-w-2xl text-muted-foreground">
          If a short link is being used for phishing, malware, spam, or anything
          illegal, send us the URL. We read reports at{" "}
          <a className="text-primary hover:underline" href={`mailto:${OPERATOR.abuseEmail}`}>
            {OPERATOR.abuseEmail}
          </a>{" "}
          and we may disable the link. You can also email that address directly.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <AbuseReportForm initialUrl={initialUrl} />
        </CardContent>
      </Card>

      <p className="mt-8 text-sm text-muted-foreground">
        For account or billing questions, use the{" "}
        <Link href="/contact" className="text-primary hover:underline">
          contact page
        </Link>
        . See also our{" "}
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
