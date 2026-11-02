import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { getSiteUrl } from "@/lib/site";

export async function OrganizationJsonLd() {
  const settings = await getSettings();
  return (
    <JsonLd
      data={organizationJsonLd({
        base: getSiteUrl(),
        instagram: settings.social_instagram,
        telegram: settings.social_telegram,
      })}
    />
  );
}
