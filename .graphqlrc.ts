import { ApiType, shopifyApiProject } from "@shopify/api-codegen-preset";

export default {
  schema: "https://shopify.dev/storefront-graphql-direct-proxy",
  documents: ["src/lib/shopify/**/*.ts", "!node_modules"],
  projects: {
    default: shopifyApiProject({
      apiType: ApiType.Storefront,
      apiVersion: "2026-01",
      outputDir: "./types",
      // String unions instead of TS enums: enums in a .d.ts have no runtime value to pass
      enumsAsConst: true,
    }),
  },
};
