import { get, post, put } from 'aws-amplify/api'
import { Company } from '../../../types/Company.ts'
import { User } from '../../../types/User.ts'
import { CompanyFormData } from '../../../utils/vaidation/company.ts'
import { ProfileFormData } from '../../../utils/vaidation/profile.ts'
import { API_COMPANY, API_NAME, API_PRESIGNER_INPUTS, API_USER } from '../paths.ts'

export const fetchUsers = (userRole: string, tenantId?: string) => async () => {
  const restOperation = get({
    apiName: API_NAME,
    path: tenantId ? `${API_USER}?userRole=${userRole}&tenantId=${tenantId}` : `${API_USER}?userRole=${userRole}`,
  })
  const response = await restOperation.response
  return (await response.body.json()) as unknown as { users: User[] }
}

export const fetchDocumentPreview = (filename: string, s3Path: string) => async () => {
  const restOperation = post({
    apiName: API_NAME,
    path: API_PRESIGNER_INPUTS,
    options: {
      // @ts-ignore
      body: { filename, method: 'GET', s3Path },
    },
  })
  const response = await restOperation.response
  const responseBody = (await response.body.json()) as { uploadUrl?: string }
  return responseBody?.uploadUrl
}

export const createUser = (userRole: string, tenantId?: string) => async (data: ProfileFormData) => {
  const bodyPayload: ProfileFormData & { userRole: string; tenantId?: string } = { ...data, userRole }

  if (tenantId) {
    bodyPayload.tenantId = tenantId
  }

  await post({
    apiName: API_NAME,
    path: API_USER,
    options: {
      body: bodyPayload,
    },
  }).response
}

export const createCompany = async (data: CompanyFormData) => {
  const response = await post({
    apiName: API_NAME,
    path: API_COMPANY,
    options: {
      body: data,
    },
  }).response

  return await response.body.json()
}

export const fetchCompanies = () => async () => {
  const restOperation = get({
    apiName: API_NAME,
    path: API_COMPANY,
  })
  const response = await restOperation.response
  return (await response.body.json()) as unknown as { companies: Company[] }
}

export const getCompany = (companyId: string) => async () => {
  const restOperation = get({
    apiName: API_NAME,
    path: `${API_COMPANY}/${companyId}`,
  })
  const response = await restOperation.response
  return (await response.body.json()) as unknown as { company: Company }
}

export const updateCompany = async (companyId: string, data: CompanyFormData) => {
  const response = await put({
    apiName: API_NAME,
    path: `${API_COMPANY}/${companyId}`,
    options: {
      body: data,
    },
  }).response

  return await response.body.json()
}
