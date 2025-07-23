import { Box } from '@mui/material'
import { COMPANY_STATUSES_PRETTY } from '../../../shared/constants/company.ts'
import AttributeView from '../../profile/components/AttributeView.tsx'
import { Company } from '../../../types/Company.ts'
import AvatarDropzone from '../../../shared/components/AvatarDropzone.tsx'

interface CompanyFormProps {
  company: Company
}

export default function CompanyView({ company }: CompanyFormProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="start" justifyContent="start" width="100%" gap={3}>
      {company && (
        <>
          {company.avatarPresinedUrl && (
            <Box width="100%" display="flex" justifyContent="center" alignItems="center">
              <AvatarDropzone key={company.avatarPresinedUrl} avatarUrl={company.avatarPresinedUrl} disabled />
            </Box>
          )}
          <AttributeView label="Name" value={company.name || ''} />
          <AttributeView label="Email" value={company.email || ''} />
          <AttributeView label="Description" value={company.description || ''} />
          <AttributeView label="Status" value={company.status ? COMPANY_STATUSES_PRETTY[company.status] : ''} />
        </>
      )}
    </Box>
  )
}
