import { Route, Routes } from "react-router-dom";
import { AuthPage, OnboardingPage, ProtectedRoute } from "@/features/identity";
import { HomePage } from "@/features/home";
import { CreateDossierPage, DossierDetailPage, DossiersPage } from "@/features/dossiers";
import { AlertsPage } from "@/features/alerts";
import { AssistantPage } from "@/features/assistant";
import { ProfilePage } from "@/features/profile";
import { NotFoundPage } from "@/features/shell";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/dossiers" element={<ProtectedRoute><DossiersPage /></ProtectedRoute>} />
      <Route path="/dossiers/:id" element={<ProtectedRoute><DossierDetailPage /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><CreateDossierPage /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/assistant" element={<ProtectedRoute><AssistantPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
