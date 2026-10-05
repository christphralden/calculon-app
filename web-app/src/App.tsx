import { createBrowserRouter, Navigate } from "react-router-dom";
import { Authenticated } from "@/components/middleware/authenticated";
import { AdminOnly } from "@/components/middleware/admin-only";
import { LandingPage } from "@/pages/landing";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { HomePageContainer } from "@/pages/home";
import { LevelSelectPage } from "@/pages/level-select";
import { GamePage } from "@/pages/game";
import { GamePlayPage } from "@/pages/game-play";
import { RoomPage } from "@/pages/room";
import { RoomHostPage } from "@/pages/room-host";
import { RoomLobbyPage } from "@/pages/room-lobby";
import { RoomFinishedPage } from "@/pages/room-finished";
import { RoomSetupPage } from "@/pages/room-setup";
import { RoomProvider } from "@/contexts/room.context";
import {
  ProfilePageContainer,
  ProfileTab,
  StatisticsTab,
} from "@/pages/profile";
import { LeaderboardPage } from "@/pages/leaderboard";
import { LogoutPage } from "@/pages/logout";
import { AdminLayout } from "@/pages/admin";
import { DashboardTab } from "@/feature/admin/tabs/dashboard";
import { PlayersTab } from "@/feature/admin/tabs/players";
import { SessionsTab } from "@/feature/admin/tabs/sessions";
import { LevelsTab } from "@/feature/admin/tabs/levels";
import { CreateLevelTab } from "@/feature/admin/tabs/create-level";
import { SystemTab } from "@/feature/admin/tabs/system";

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/logout", element: <LogoutPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  {
    element: <Authenticated redirectTo="/login" />,
    children: [
      { path: "/home", element: <HomePageContainer /> },

      {
        path: "/settings",
        element: <ProfilePageContainer />,
        children: [
          { index: true, element: <Navigate to="profile" replace /> },
          { path: "profile", element: <ProfileTab /> },
          { path: "statistics", element: <StatisticsTab /> },
        ],
      },

      { path: "/levels", element: <LevelSelectPage /> },
      { path: "/leaderboard", element: <LeaderboardPage /> },

      {
        path: "/game",
        children: [
          { index: true, element: <GamePage /> },
          { path: "play", element: <GamePlayPage /> },
          {
            path: "room",
            children: [
              { index: true, element: <RoomPage /> },
              { path: "host", element: <RoomHostPage /> },
              {
                path: ":id",
                element: <RoomProvider />,
                children: [
                  { index: true, element: <RoomLobbyPage /> },
                  { path: "setup", element: <RoomSetupPage /> },
                  { path: "play", element: <GamePlayPage /> },
                  { path: "finished", element: <RoomFinishedPage /> },
                ],
              },
            ],
          },
        ],
      },

      {
        element: <AdminOnly redirectTo="/home" />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <DashboardTab /> },
              { path: "players", element: <PlayersTab /> },
              { path: "sessions", element: <SessionsTab /> },
              { path: "levels", element: <LevelsTab /> },
              { path: "levels/create", element: <CreateLevelTab /> },
              { path: "system", element: <SystemTab /> },
            ],
          },
        ],
      },
    ],
  },
]);
