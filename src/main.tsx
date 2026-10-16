import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { RouterProvider } from 'react-router';
import { router } from './app/router.tsx';
import { LanguageProvider } from './content/i18n/useTranslation.ts';
import { ThemeProvider } from './os/theme/ThemeProvider.tsx';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <RouterProvider router={router} />
        </MotionConfig>
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>,
);
