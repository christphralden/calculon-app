import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "@/store/hooks";
import { selectCurrentPlayer } from "@/feature/auth/state/auth.slice";

interface AdminOnlyProps {
  redirectTo?: string;
}

export function AdminOnly({ redirectTo = "/home" }: AdminOnlyProps) {
  const currentPlayer = useSelector(selectCurrentPlayer);

  if (!currentPlayer || currentPlayer.role_name !== "admin") {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
