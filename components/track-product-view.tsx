"use client";

import { useEffect } from "react";
import { useBrowsingHistory } from "@/lib/browsing-history";

export function TrackProductView({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const { trackView, endView } = useBrowsingHistory();

  useEffect(() => {
    trackView(slug, name);

    const interval = setInterval(() => {
      endView(slug);
      trackView(slug, name);
    }, 3000);

    return () => {
      clearInterval(interval);
      endView(slug);
    };
  }, [slug, name, trackView, endView]);

  return null;
}
