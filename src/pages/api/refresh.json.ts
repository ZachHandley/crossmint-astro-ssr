import type { APIRoute } from "astro";
import { createCrossmint, CrossmintAuth } from "@crossmint/server-sdk";
import {
  CROSSMINT_API_SERVER_KEY,
} from "astro:env/server";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check both cookies and request body for refresh token
    let jwt = cookies.get("crossmint-jwt")?.value;
    let refreshToken = cookies.get("crossmint-refresh-token")?.value;

    const crossmint = createCrossmint({
      apiKey: CROSSMINT_API_SERVER_KEY,
    });

    const crossmintAuth = CrossmintAuth.from(crossmint, {
      cookieOptions: {
        httpOnly: true,
      },
    });

    // If we have a refreshToken from the body, use it directly
    if (refreshToken && jwt) {
      const session = await crossmintAuth.getSession({
        jwt,
        refreshToken,
      });

      return new Response(JSON.stringify(session), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      // Otherwise use the built-in handler
      const response = await crossmintAuth.handleCustomRefresh(request);
      return response as Response;
    }
  } catch (error) {
    console.error("Error refreshing session:", error);
    return new Response(
      JSON.stringify({ error: "Failed to refresh session" }),
      {
        status: 200,
      }
    );
  }
};
