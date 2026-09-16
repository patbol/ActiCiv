import { brandMarkSvg } from "@acticiv/shared";
export function GET() {
  return new Response(brandMarkSvg(), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
