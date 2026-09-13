import { createFileRoute } from "@tanstack/react-router";
import { ensureCatalog, findByBarcode, recommendFor } from "@/lib/server/catalog";
import { lookupOpenFacts } from "@/lib/server/off";
import { upsertEvaluated } from "@/lib/server/catalog";
import { normalizeBarcode } from "@/lib/utils";

export const Route = createFileRoute("/api/products/$barcode")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        await ensureCatalog();
        const barcode = normalizeBarcode(params.barcode);
        let product = await findByBarcode(barcode);
        if (!product) {
          const remote = await lookupOpenFacts(barcode);
          if (remote) {
            await upsertEvaluated(remote);
            product = remote;
          }
        }
        if (!product) {
          return Response.json({ status: "not_found", barcode }, { status: 404 });
        }
        const alternatives = await recommendFor(product);
        return Response.json({ status: "found", product, alternatives });
      },
    },
  },
});
