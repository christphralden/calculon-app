import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "@/store/hooks";
import {
  selectAuthStatus,
  selectIsAuthenticated,
} from "@/feature/auth/state/auth.slice";
import { handleGetMe } from "@/feature/auth/actions/auth.actions";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

interface AuthenticatedProps {
  redirectTo: string;
  ifAuthenticated?: boolean;
}

export function Authenticated({
  redirectTo,
  ifAuthenticated = false,
}: AuthenticatedProps) {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    dispatch(handleGetMe());
  }, [dispatch]);

  const isChecking = status === "idle" || status === "loading";

  if (!isChecking) {
    if (ifAuthenticated && isAuthenticated) {
      return <Navigate to={redirectTo} replace />;
    }
    if (!ifAuthenticated && !isAuthenticated) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return (
    <>
      {isChecking && <LoadingOverlay text="Waking hero up..." subtext="" />}
      <Outlet />
    </>
  );
}
