import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProjectWorkspaceLayout } from './components/layout/ProjectWorkspaceLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsListPage } from './pages/ProjectsListPage';
import { NewProjectPage } from './pages/NewProjectPage';
import { ProjectOverviewPage } from './pages/ProjectOverviewPage';
import { ProjectDiscoveryPage } from './pages/ProjectDiscoveryPage';
import { ProjectLibraryPage } from './pages/ProjectLibraryPage';
import { ProjectChatPage } from './pages/ProjectChatPage';
import { ProjectAnalysisPage } from './pages/ProjectAnalysisPage';
import { ProjectClaimsPage } from './pages/ProjectClaimsPage';
import { ProjectKnowledgePage } from './pages/ProjectKnowledgePage';
import { ProjectDiscoveriesPage } from './pages/ProjectDiscoveriesPage';
import { ProjectNotesPage } from './pages/ProjectNotesPage';
import { ProjectSettingsPage } from './pages/ProjectSettingsPage';
import { GlobalLibraryPage } from './pages/GlobalLibraryPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const getBasename = (): string => {
  if (typeof window !== 'undefined') {
    // If hosted on GitHub Pages (e.g. raju143321.github.io/ai-automation-/)
    if (window.location.hostname.endsWith('github.io') || window.location.pathname.startsWith('/ai-automation-')) {
      const match = window.location.pathname.match(/^\/([^/]+)/);
      if (match && match[1] && !['login', 'signup', 'app', 'forgot-password'].includes(match[1])) {
        return `/${match[1]}`;
      }
      return '/ai-automation-';
    }
  }
  return '/';
};

export const router = createBrowserRouter([
  // Public
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },

  // Authenticated App
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'projects', element: <ProjectsListPage /> },
      { path: 'projects/new', element: <NewProjectPage /> },
      {
        path: 'projects/:projectId',
        element: <ProjectWorkspaceLayout />,
        children: [
          { index: true, element: <ProjectOverviewPage /> },
          { path: 'discover', element: <ProjectDiscoveryPage /> },
          { path: 'library', element: <ProjectLibraryPage /> },
          { path: 'chat', element: <ProjectChatPage /> },
          { path: 'analysis', element: <ProjectAnalysisPage /> },
          { path: 'claims', element: <ProjectClaimsPage /> },
          { path: 'knowledge', element: <ProjectKnowledgePage /> },
          { path: 'discoveries', element: <ProjectDiscoveriesPage /> },
          { path: 'notes', element: <ProjectNotesPage /> },
          { path: 'settings', element: <ProjectSettingsPage /> }
        ]
      },
      { path: 'library', element: <GlobalLibraryPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings/profile', element: <SettingsPage /> },
      { path: 'settings', element: <Navigate to="/app/settings/profile" replace /> }
    ]
  },

  // 404 Catch-all
  { path: '*', element: <NotFoundPage /> }
], {
  basename: getBasename()
});
