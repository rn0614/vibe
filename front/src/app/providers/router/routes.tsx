import {
    type RouteObject,
  } from "react-router";
import { lazy } from 'react';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/HomePage').then(module => ({ default: module.HomePage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then(module => ({ default: module.AboutPage })));
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
    path: '*',
    element: <NotFoundPage />
  }
];
