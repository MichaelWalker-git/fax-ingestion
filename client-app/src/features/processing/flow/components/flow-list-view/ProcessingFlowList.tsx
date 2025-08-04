import { Container, Stack, Tab, Tabs, Typography } from '@mui/material'
import BigAddButton from '../../../../../shared/components/big-add-button/BigAddButton.tsx'
import { useNavigate } from 'react-router-dom'
import { CREATE_PROCESSING_FLOW_PATH } from '../../../../../shared/constants/routes.ts'
import ProcessingFlowTriggersTable from './trigger/ProcessingFlowTriggersTable.tsx'
import { alpha, useTheme } from '@mui/material/styles'
import { StyledIcon } from '../../../../../shared/components/Layout/navigation/nav-section/vertical/styles.ts'
import SvgColor from '../../../../../shared/components/svg-color'
import { PROCESSING_TABLE_TABS } from './trigger/utils.ts'

export default function ProcessingFlowList() {
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <Container maxWidth={false}>
      <Stack gap={5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Flow Builder</Typography>
          <BigAddButton
            icon="ic:baseline-account-tree"
            text="Start Flow"
            onClick={() => navigate(CREATE_PROCESSING_FLOW_PATH)}
          />
        </Stack>
        <Tabs
          value={'triggers'}
          onChange={() => {}}
          sx={{
            boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          {PROCESSING_TABLE_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              iconPosition="start"
              icon={
                <StyledIcon>
                  <SvgColor src={`/assets/icons/processing-flow/${tab.icon}.svg`} sx={{ width: 24, height: 24 }} />
                </StyledIcon>
              }
            />
          ))}
        </Tabs>
        <ProcessingFlowTriggersTable />
      </Stack>
    </Container>
  )
}
