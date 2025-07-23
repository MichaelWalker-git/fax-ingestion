import { z } from 'zod'
import { COMPANY_STATUSES } from '../../shared/constants/company.ts'

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200, 'Company name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  status: z.enum(
    [COMPANY_STATUSES.ACTIVE, COMPANY_STATUSES.DISABLED, COMPANY_STATUSES.INACTIVE, COMPANY_STATUSES.PENDING],
    {
      errorMap: () => ({ message: 'Status is required and must be valid' }),
    },
  ),
  avatar: z.any().optional(),
  email: z.string().email('Invalid email address').optional(),
})

export type CompanyFormData = z.infer<typeof companySchema>
