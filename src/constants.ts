export const ROUTES = {
  LOGIN: '/login',
  MAIN: '/main',
  HOME: '/',
  AUTH_CALLBACK: '/auth/callback',
} as const

// Define the type for unprotected routes
type UnprotectedRoute = typeof ROUTES[keyof Pick<typeof ROUTES, 'LOGIN' | 'AUTH_CALLBACK'>]

// Create the array with the correct type
export const UNPROTECTED_ROUTES: UnprotectedRoute[] = [
  ROUTES.LOGIN,
  ROUTES.AUTH_CALLBACK,
]

// Update middleware to handle the pathname type
export function isUnprotectedRoute(pathname: string): boolean {
  return UNPROTECTED_ROUTES.includes(pathname as UnprotectedRoute)
}