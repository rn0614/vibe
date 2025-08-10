import {
    type RouteObject,
  } from "react-router";
import { lazy } from 'react';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/HomePage/HomePage').then(module => ({ default: module.HomePage })));
const AboutPage = lazy(() => import('@/pages/AboutPage/AboutPage').then(module => ({ default: module.AboutPage })));
const TodoPage = lazy(() => import('@/pages/TodoPage/TodoPage').then(module => ({ default: module.TodoPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage/LoginPage').then(module => ({ default: module.LoginPage })));
const SignUpPage = lazy(() => import('@/pages/SignUpPage/SignUpPage').then(module => ({ default: module.SignUpPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/about',
    element: <AboutPage />
  },
  {
    path: '/todos',
    element: <TodoPage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/signup',
    element: <SignUpPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
];
