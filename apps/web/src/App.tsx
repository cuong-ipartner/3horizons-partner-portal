import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { PortalShell } from '@/components/PortalShell'
import { AdminShell } from '@/components/admin/AdminShell'
import { OverviewPage } from '@/pages/OverviewPage'
import { ProblemsIndexPage, ProblemDetailPage } from '@/pages/ProblemsPage'
import { LayersIndexPage, LayerDetailPage } from '@/pages/LayersPage'
import { ServicesIndexPage, ServiceDetailPage } from '@/pages/ServicesPage'
import { PartnersDirectoryPage, PartnerProfilePage } from '@/pages/PartnersPage'
import { MatchRequestPage, MatchConfirmationPage } from '@/pages/MatchPage'
import {
  MyRequestsPage,
  RequestDetailPage,
  MyCollaborationsPage,
  CollaborationDetailPage,
} from '@/pages/WorkspacePages'
import { InsightsIndexPage, InsightDetailPage } from '@/pages/InsightsPage'
import { PartnerOnboardingPage } from '@/pages/PartnerOnboardingPage'
import { AdminLoginPage, LoginPage } from '@/pages/LoginPage'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { DashboardHome } from '@/pages/portal/DashboardHome'
import { ProjectDetailPage } from '@/pages/portal/ProjectDetailPage'
import {
  DocumentsPage,
  TrainingPage,
  ProjectsPage,
  PortalNetworkPage,
  AccountPage,
  SecurityPage,
  BillingPage,
  ActivityPage,
  HelpPage,
} from '@/pages/portal/PortalPages'
import { SimpleAdminPage } from '@/pages/admin/SimpleAdminPage'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminUsers } from '@/pages/admin/AdminUsers'
import { AdminPartners } from '@/pages/admin/AdminPartners'
import { AdminProjects } from '@/pages/admin/AdminProjects'
import { AdminContent } from '@/pages/admin/AdminContent'
import { AdminLibrary } from '@/pages/admin/AdminLibrary'
import { AdminRoles } from '@/pages/admin/AdminRoles'
import { AdminAudit } from '@/pages/admin/AdminAudit'
import { AdminSettings } from '@/pages/admin/AdminSettings'
import { AdminReferrals, AdminReferralDetail } from '@/pages/admin/AdminReferrals'
import {
  PartnerReferralsListPage,
  PartnerReferralNewPage,
  PartnerReferralDetailPage,
} from '@/pages/portal/ReferralPages'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<LoginPage audience="partner" />} />
        <Route path="admin/login" element={<AdminLoginPage />} />

        <Route
          path="admin"
          element={
            <RequireAuth role="staff">
              <AdminShell />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="partners" element={<AdminPartners />} />
          <Route path="referrals" element={<AdminReferrals />} />
          <Route path="referrals/:referralId" element={<AdminReferralDetail />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="content/homepage" element={<SimpleAdminPage />} />
          <Route path="library" element={<AdminLibrary />} />
          <Route path="roles" element={<AdminRoles />} />
          <Route path="audit" element={<AdminAudit />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route
          path="portal"
          element={
            <RequireAuth role="partner">
              <PortalShell />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="referrals" element={<PartnerReferralsListPage />} />
          <Route path="referrals/new" element={<PartnerReferralNewPage />} />
          <Route path="referrals/:referralId" element={<PartnerReferralDetailPage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="network" element={<PortalNetworkPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="account/security" element={<SecurityPage />} />
          <Route path="account/billing" element={<BillingPage />} />
          <Route path="account/activity" element={<ActivityPage />} />
          <Route path="account/help" element={<HelpPage />} />
          <Route path="admin" element={<Navigate to="/admin" replace />} />
          <Route path="admin/*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route element={<Layout />}>
          <Route index element={<OverviewPage />} />
          <Route path="problems" element={<ProblemsIndexPage />} />
          <Route path="problems/:problemSlug" element={<ProblemDetailPage />} />
          <Route path="layers" element={<LayersIndexPage />} />
          <Route path="layers/:layerSlug" element={<LayerDetailPage />} />
          <Route path="services" element={<ServicesIndexPage />} />
          <Route path="services/:serviceSlug" element={<ServiceDetailPage />} />
          <Route path="partners" element={<PartnersDirectoryPage />} />
          <Route path="partners/:partnerSlug" element={<PartnerProfilePage />} />
          <Route path="match" element={<MatchRequestPage />} />
          <Route path="match/confirmation" element={<MatchConfirmationPage />} />
          <Route path="me/requests" element={<MyRequestsPage />} />
          <Route path="me/requests/:requestId" element={<RequestDetailPage />} />
          <Route path="me/collaborations" element={<MyCollaborationsPage />} />
          <Route path="me/collaborations/:collabId" element={<CollaborationDetailPage />} />
          <Route path="insights" element={<InsightsIndexPage />} />
          <Route path="insights/:insightSlug" element={<InsightDetailPage />} />
          <Route path="join" element={<PartnerOnboardingPage />} />
          <Route path="onboarding" element={<PartnerOnboardingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
export { App }
