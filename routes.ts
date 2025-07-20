/**
 * An array of routes that are accessible to public
 */
export const publicRoutes = ["/", "/auth/new-verification"];
/**
 * An array of routes that are private
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/reset",
  "/auth/new-password",
];

/**
 * The prefix for API authentuication routes
 * Routes that starty with this prefix ae used for API
 */
export const apiAuthPrefix = "/api/auth";
