import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import {
  ADMIN_PANEL_PATH,
  CREATE_COMPANY_PATH,
  CREATE_PROCESSING_FLOW_PATH,
  CREATE_USER_PATH,
  DOCUMENT_DETAILS_PATH,
  GUIDE_PATH,
  OPEN_PROCESSING_FLOW_PATH,
  PROCESSING_FLOW_PATH,
  PROCESSING_PATH,
  PROFILE_PATH,
  ROOT_PATH,
  VIEW_COMPANY_PATH,
} from '../../constants/routes.ts'

import { DocumentsPage } from '../../../features/documents/pages/DocumentsPage.tsx'

const Guide = lazy(() => import('../../../features/guide/pages/Guide.tsx'))
const ProfilePage = lazy(() => import('../../../features/profile/pages/ProfilePage.tsx'))
const Processing = lazy(() => import('../../../features/processing/tab/pages/ProcessingPage.tsx'))
const DocumentDetails = lazy(() => import('../../../features/documents/pages/DocumentDetails.tsx'))
const AdminPanel = lazy(() => import('../../../features/admin/pages/AdminPanel.tsx'))
const ProtectedAdminRoute = lazy(() => import('../../../features/admin/pages/ProtectedAdminRoute.tsx'))
const CreateUser = lazy(() => import('../../../features/admin/pages/CreateUser.tsx'))
const CreateCompany = lazy(() => import('../../../features/admin/pages/CreateCompany.tsx'))
const CompanyViewPage = lazy(() => import('../../../features/admin/pages/CompanyViewPage.tsx'))
const ProcessingFlow = lazy(() => import('../../../features/processing/flow/pages/ProcessingFlowPage.tsx'))
const CreateProcessingFlowPage = lazy(() => import('../../../features/processing/flow/pages/CreateProcessingFlowPage.tsx'))

export default function RouterContainer() {
  return (
    <Routes>
      <Route path={ROOT_PATH} element={<DocumentsPage />} />
      <Route path={ADMIN_PANEL_PATH} element={<ProtectedAdminRoute />}>
        <Route path={ADMIN_PANEL_PATH} element={<AdminPanel />} />
        <Route path={CREATE_USER_PATH} element={<CreateUser />} />
        <Route path={CREATE_COMPANY_PATH} element={<CreateCompany />} />
        <Route path={VIEW_COMPANY_PATH} element={<CompanyViewPage />} />
      </Route>
      <Route path={GUIDE_PATH} element={<Guide />} />
      <Route path={PROCESSING_FLOW_PATH} element={<ProcessingFlow />} />
      <Route path={CREATE_PROCESSING_FLOW_PATH} element={<CreateProcessingFlowPage />} />
      <Route path={OPEN_PROCESSING_FLOW_PATH} element={<CreateProcessingFlowPage />} />
      <Route path={PROFILE_PATH} element={<ProfilePage />} />
      <Route path={PROCESSING_PATH} element={<Processing />} />
      <Route path={DOCUMENT_DETAILS_PATH} element={<DocumentDetails />} />
    </Routes>
  )
}
