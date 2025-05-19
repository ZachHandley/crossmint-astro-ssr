import type { APIRoute } from "astro";

export interface LogoutResponse {
  success: boolean;
}

export const POST: APIRoute = async ({ cookies, session }) => {
  cookies.delete("crossmint-jwt", { path: "/" });
  cookies.delete("crossmint-refresh-token", { path: "/" });

  // Clear Astro session if available
  if (session) {
    // Get user ID from session if exists (for logging purposes)
    const user = await session.get("userData");
    if (user) {
      console.log(`Logging out user: ${user.$id}`);
    }
    session.delete("userData");

    // Clear all session data
    session.destroy();
  }

  try {
    return new Response(JSON.stringify({ success: true } as LogoutResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Logout error:", error);

    // Even if there's an error, we've cleared cookies and session
    const response: LogoutResponse = {
      success: true,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
