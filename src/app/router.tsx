import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage, OnboardingPage, ProtectedRoute } from "@/features/identity";
import { HomePage, ModulePage } from "@/features/home";
import { EditDossierPage, CreateDossierPage, DossierDetailPage, DossiersPage } from "@/features/dossiers";
import { AlertsPage } from "@/features/alerts";
import { AssistantPage } from "@/features/assistant";
import { ProfilePage } from "@/features/profile";
import { MyFilesPage } from "@/features/files";
import { NotFoundPage } from "@/features/shell";
import { SyncCenterPage } from "@/features/offline";

/**
 * Les visiteurs peuvent découvrir Heritis et consulter les explications publiques.
 * Les espaces de gestion et les données personnelles exigent une session.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/" element={<HomePage />} />
      <Route path="/index" element={<Navigate to="/" replace />} />
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="/modules/:moduleId" element={<ModulePage />} />
      <Route path="/dossiers" element={<ProtectedRoute><DossiersPage /></ProtectedRoute>} />
      <Route path="/dossiers/:id" element={<ProtectedRoute><DossierDetailPage /></ProtectedRoute>} />
      <Route path="/dossiers/:id/edit" element={<ProtectedRoute><EditDossierPage /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><CreateDossierPage /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/files" element={<MyFilesPage />} />
      <Route path="/sync" element={<ProtectedRoute><SyncCenterPage /></ProtectedRoute>} />
      <Route path="/assistant" element={<AssistantPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
