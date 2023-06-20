import Analytics from "analytics";
// @ts-ignore
import segmentPlugin from "@analytics/segment";

export const analytics = Analytics({
  app: "lightrail-ai",
  plugins: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY
    ? [
        segmentPlugin({
          writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY,
        }),
      ]
    : [],
});
