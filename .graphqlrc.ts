import { ApiType, shopifyApiProject } from "@shopify/api-codegen-preset";

export default {
  schema: "https://shopify.dev/storefront-graphql-direct-proxy",
  documents: ["src/lib/shopify/**/*.ts", "!node_modules"],
  projects: {
    default: shopifyApiProject({
      apiType: ApiType.Storefront,
      apiVersion: "2026-01",
      outputDir: "./types",
    }),
  },
};
