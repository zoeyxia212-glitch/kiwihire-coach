import { Navigate, Outlet, useLocation } from "react-router";

type ProtectedRouteProps = {
  isAuthenticated: boolean;
};

export default function ProtectedRoute({
  isAuthenticated,
}: ProtectedRouteProps) {
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: "Log in to access your private workspace.",
        }}
      />
    );
  }

  return <Outlet />;
}
