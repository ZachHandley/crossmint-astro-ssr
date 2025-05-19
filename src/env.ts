import { envField } from "astro/config";

export const env = {
    schema: {
      CROSSMINT_API_KEY: envField.string({
        context: "client",
        access: "public",
        default: "", // PUT YOUR API KEY HERE
      }),
      CROSSMINT_API_SERVER_KEY: envField.string({
        context: "server",
        access: "public",
        default: "", // PUT YOUR API KEY HERE
      }),
      CROSSMINT_API_URL: envField.string({
        context: "client",
        access: "public",
        default: "https://staging.crossmint.com/api/2022-06-09/",
      }),
      CROSSMINT_PROJECT_ID: envField.string({
        context: "client",
        access: "public",
        default: "my-project-id",
      }),
      CHAIN_ID: envField.string({
        context: "client",
        access: "public",
        default: "optimism-sepolia",
      }),
    },
};