/**
 * main.jsx — Application entry point
 *
 * Learning notes
 * ──────────────
 * This file bootstraps the React application.  It is the equivalent of
 * Django's manage.py — it starts everything running.
 *
 * createRoot()       → finds the <div id="root"> in index.html and takes
 *                      control of it, replacing its content with our React tree.
 *
 * <StrictMode>       → a development helper that highlights potential issues
 *                      (like missing cleanup in useEffect).  It causes effects
 *                      to run twice in development — this is intentional and
 *                      goes away in production builds.
 *
 * You normally do not need to edit this file.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
