import {
    type RouteObject,
  } from "react-router";
import { lazy } from 'react';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/HomePage').then(module => ({ default: module.HomePage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then(module => ({ default: module.AboutPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const SignUpPage = lazy(() => import('@/pages/SignUpPage').then(module => ({ default: module.SignUpPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

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
