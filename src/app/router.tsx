import { createBrowserRouter, redirect } from 'react-router';
import { DesktopEnvironment } from '../os/DesktopEnvironment.tsx';

export const router = createBrowserRouter([
  { path: '/about', loader: () => redirect('/folder/about') },
  { path: '/projects', loader: () => redirect('/folder/projects') },
  { path: '*', Component: DesktopEnvironment },
]);
