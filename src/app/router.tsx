import { Route, Routes } from "react-router-dom";
import { AuthPage, OnboardingPage, ProtectedRoute } from "@/features/identity";
import { HomePage } from "@/features/home";
import { CreateDossierPage, DossierDetailPage, DossiersPage } from "@/features/dossiers";
import { AlertsPage } from "@/features/alerts";
import { AssistantPage } from "@/features/assistant";
import { ProfilePage } from "@/features/profile";
import { MyFilesPage } from "@/features/files";
import { BienDetailPage, BiensPage, CreateBienPage } from "@/features/biens";
import { NotFoundPage } from "@/features/shell";

/**
 * Mode visiteur : toutes les pages sont consultables sans compte.
 * Seul l'onboarding (lié à un profil réel) exige un compte.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/" element={<HomePage />} />
      <Route path="/dossiers" element={<DossiersPage />} />
      <Route path="/dossiers/:id" element={<DossierDetailPage />} />
      <Route path="/create" element={<CreateDossierPage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/files" element={<MyFilesPage />} />
      <Route path="/biens" element={<BiensPage />} />
      <Route path="/biens/new" element={<ProtectedRoute><CreateBienPage /></ProtectedRoute>} />
      <Route path="/biens/:id" element={<ProtectedRoute><BienDetailPage /></ProtectedRoute>} />
      <Route path="/assistant" element={<AssistantPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
