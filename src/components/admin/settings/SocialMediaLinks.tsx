"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Instagram, Facebook, MessageCircle, Youtube } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  socialLinksConfigSchema,
  type SocialLinksFormValues,
} from "@/lib/validations/social";
import {
  DEFAULT_SOCIAL_LINKS,
  mergeSocialLinks,
  getPlatformLabel,
  getPlatformPlaceholder,
  type SocialPlatform,
} from "@/utils/social";

const PLATFORM_ORDER: SocialPlatform[] = [
  "instagram",
  "facebook",
  "youtube",
  "whatsapp",
];

function PlatformIcon({
  platform,
  active,
}: {
  platform: SocialPlatform;
  active: boolean;
}) {
  const iconClass = cn(
    "h-5 w-5 transition-colors duration-200",
    active ? "text-primary" : "text-white/40"
  );

  switch (platform) {
    case "instagram":
      return <Instagram className={iconClass} />;
    case "facebook":
      return <Facebook className={iconClass} />;
    case "youtube":
      return <Youtube className={iconClass} />;
    case "whatsapp":
      return <MessageCircle className={iconClass} />;
  }
}

export function SocialMediaLinks() {
  const [isHydrated, setIsHydrated] = useState(false);
  const links = useQuery(api.socialLinks.getAll);
  const saveAll = useMutation(api.socialLinks.saveAll);

  const form = useForm<SocialLinksFormValues>({
    resolver: zodResolver(socialLinksConfigSchema),
    defaultValues: { links: DEFAULT_SOCIAL_LINKS.links },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "links",
  });

  useEffect(() => {
    if (links === undefined) {
      return;
    }

    form.reset({ links: mergeSocialLinks(links) });
    setIsHydrated(true);
  }, [form, links]);

  const watchedLinks = form.watch("links");

  const handleToggle = (index: number, checked: boolean) => {
    form.setValue(`links.${index}.active`, checked, { shouldDirty: true });
  };

  const onSubmit = async (values: SocialLinksFormValues) => {
    await saveAll({ links: values.links });
    toast.success("Social media links saved successfully");
  };

  const onError = () => {
    toast.error("Please fix the errors before saving");
  };

  if (!isHydrated) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <h3 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-xl font-bold text-transparent">
        Social Media Links
      </h3>
      <p className="mt-1 text-xs text-white/50">
        Active links with valid URLs are displayed in the website footer.
      </p>

      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="mt-6 space-y-5"
      >
        {fields.map((field, index) => {
          const platform = PLATFORM_ORDER[index];
          const isActive = watchedLinks[index]?.active ?? false;
          const error = form.formState.errors.links?.[index]?.url;

          return (
            <div key={field.id} className="space-y-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                {/* Platform icon + label */}
                <div className="flex min-w-[130px] items-center gap-2.5">
                  <PlatformIcon platform={platform} active={isActive} />
                  <span className="text-sm font-semibold text-white">
                    {getPlatformLabel(platform)}
                  </span>
                </div>

                {/* URL input */}
                <div className="flex-1">
                  <input
                    {...form.register(`links.${index}.url`)}
                    type="url"
                    placeholder={getPlatformPlaceholder(platform)}
                    className={cn(
                      "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/25",
                      "focus:border-primary focus:ring-2 focus:ring-primary/40",
                      error && "border-red-400/60 focus:border-red-400 focus:ring-red-400/40"
                    )}
                  />
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">
                    {isActive ? "On" : "Off"}
                  </span>
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) => handleToggle(index, checked)}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>

              {/* Inline Zod error */}
              {error?.message && (
                <p className="pl-0 text-xs font-medium text-red-400 sm:pl-[142px]">
                  {error.message}
                </p>
              )}
            </div>
          );
        })}

        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)]"
          >
            Save Social Links
          </button>
        </div>
      </form>
    </div>
  );
}
