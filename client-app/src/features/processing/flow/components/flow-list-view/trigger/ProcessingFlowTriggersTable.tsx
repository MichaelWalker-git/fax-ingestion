import { Alert, Table, TableBody, TableCell, TableContainer } from '@mui/material'
import Scrollbar from '../../../../../../shared/components/scrollbar'
import { TableHeadCustom, useTable } from '../../../../../../shared/components/table'
import { TRIGGERS_TABLE_HEAD } from './utils.ts'
import ProcessingFlowTriggerTableRow from './ProcessingFlowTriggerTableRow.tsx'
import { useMutation, useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { CREATE_PROCESSING_FLOW_PATH } from '../../../../../../shared/constants/routes.ts'
import ProcessingFlowTriggersTableSkeleton from './ProcessingFlowTriggersTableSkeleton.tsx'
import { useSnackbar } from '../../../../../../context/SnackbarContext.tsx'
import TableRow from '@mui/material/TableRow'
import { deleteTrigger, getTriggers, updateTrigger } from '../../../../../../shared/api/actions/triggers.ts'
import { EmailTrigger } from '../../../../../../types/EmailTrigger.ts'
import { TEMPLATE_TYPES } from '../../../hooks/useFlowRunnerPolling.ts'
import { useEffect } from 'react'

export default function ProcessingFlowTriggersTable() {
  const navigate = useNavigate()
  const { setSnackbar } = useSnackbar()

  const {
    data: emailTriggers,
    isLoading,
    error,
    refetch,
  } = useQuery('/getTriggers', getTriggers, {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })

  useEffect(() => {
    refetch()
  }, [refetch])

  const { mutate: mutateUpdateTrigger } = useMutation(
    (params: { sortKey: string; trigger: Partial<EmailTrigger> }) => updateTrigger(params.sortKey, params.trigger),
    {
      onSuccess: () => {
        refetch()
        setSnackbar({ text: 'Trigger updated successfully', severity: 'success' })
      },
      onError: (error) => {
        console.error('Error updating template:', error)
        setSnackbar({ text: 'Error updating template', severity: 'error' })
      },
    },
  )

  const { mutate: deleteTriggerMutate } = useMutation(deleteTrigger, {
    onSuccess: () => {
      refetch()
      setSnackbar({ text: 'Trigger deleted successfully', severity: 'success' })
    },
    onError: (error) => {
      console.error('Error deleting template:', error)
      setSnackbar({ text: 'Error deleting template:', severity: 'error' })
    },
  })

  const table = useTable()

  return (
    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
      <Scrollbar>
        <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
          <TableHeadCustom
            order={table.order}
            orderBy={table.orderBy}
            headLabel={TRIGGERS_TABLE_HEAD}
            rowCount={0}
            numSelected={table.selected.length}
            // onSort={table.onSort}
          />
          <TableBody>
            {emailTriggers
              ?.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
              .map((row) => (
                <ProcessingFlowTriggerTableRow
                  key={row.templateId}
                  row={row}
                  onOpenRow={() => {
                    navigate(`${CREATE_PROCESSING_FLOW_PATH}/${row.templateId}/${TEMPLATE_TYPES.SES_TEMPLATE}`)
                  }}
                  onDeleteRow={() => {
                    deleteTriggerMutate(row.sortKey!)
                  }}
                  onChangeStatus={() => {
                    mutateUpdateTrigger({
                      sortKey: row.sortKey!,
                      trigger: {
                        templateId: row.templateId,
                        active: !row?.active,
                        name: row.name,
                        from: row.from,
                        processBody: row.processBody,
                        processAttachments: row.processAttachments,
                        attachmentContentTypes: row.attachmentContentTypes,
                      },
                    })
                  }}
                />
              ))}
            {isLoading && <ProcessingFlowTriggersTableSkeleton />}
            {error ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Alert sx={{ width: '100%', display: 'flex', justifyContent: 'center' }} severity="error">
                    {(error as Error).message ? (error as Error).message : 'Something went wrong'}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  )
}
