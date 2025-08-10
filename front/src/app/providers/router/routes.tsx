import { type RouteObject, Outlet } from "react-router";
import { lazy } from "react";
import { AppLayout } from "@/widgets";

// Lazy load pages
const HomePage = lazy(() =>
  import("@/pages/HomePage/HomePage").then((module) => ({
    default: module.HomePage,
  }))
);
const AboutPage = lazy(() =>
  import("@/pages/AboutPage/AboutPage").then((module) => ({
    default: module.AboutPage,
  }))
);
const TodoPage = lazy(() =>
  import("@/pages/TodoPage/TodoPage").then((module) => ({
    default: module.TodoPage,
  }))
);
const LoginPage = lazy(() =>
  import("@/pages/LoginPage/LoginPage").then((module) => ({
    default: module.LoginPage,
  }))
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage/NotFoundPage").then((module) => ({
    default: module.NotFoundPage,
  }))
);

// Layout 컴포넌트
const RootLayout = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "todos",
        element: <TodoPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];
