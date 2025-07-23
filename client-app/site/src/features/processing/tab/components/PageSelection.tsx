import Paper from '@mui/material/Paper'
import { alpha } from '@mui/material/styles'
import { use, useCallback, useEffect, useRef, useState } from 'react'
import { ProcessingContext } from '../context/ProcessingContext.tsx'
import { IDocumentType } from '../../../../types/DocumentType.ts'
import { getInputPresignGet } from '../../../../shared/api/actions/presign.ts'
import useChildDocuments from '../../../../shared/hooks/useChildDocuments.ts'
import { Box, Card, CircularProgress, FormControlLabel, Stack, Typography } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import pLimit from 'p-limit'
import PageInput from '../../../../shared/components/page-input/PageInput.tsx'

export default function PageSelection() {
  const {
    parentDocument,
    setChildDocumentsPreviewUrls,
    childDocumentsPreviewUrls,
    selectedPages,
    setSelectedPages,
    setDisabledNextStep,
    selectAll,
    setSelectAll,
  } = use(ProcessingContext)
  const [selectedPreview, setSelectedPreview] = useState<string | undefined>(undefined)

  const pageRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [pageInput, setPageInput] = useState('')

  const { childDocuments, loading } = useChildDocuments(parentDocument)

  useEffect(() => {
    if (childDocuments && childDocuments.length > 0 && !selectedPreview) {
      setSelectedPreview(childDocuments[0].sortKey)
    }
  }, [childDocuments, selectedPreview])

  useEffect(() => {
    setDisabledNextStep(selectedPages.length === 0)
  }, [selectedPages, setDisabledNextStep])

  const getPreviewUrl = useCallback(
    async (childDocument: IDocumentType) => {
      setChildDocumentsPreviewUrls?.((prevState) => ({ ...prevState, [childDocument.sortKey]: { loading: true } }))
      try {
        const presigned = await getInputPresignGet(
          childDocument?.filename!,
          childDocument?.s3Path!,
          childDocument?.sortKey!,
        )

        setChildDocumentsPreviewUrls?.((prevState) => ({
          ...prevState,
          [childDocument.sortKey]: { url: presigned?.getUrl!, loading: false },
        }))
      } catch (e) {
        console.error(e)
        setChildDocumentsPreviewUrls?.((prevState) => ({
          ...prevState,
          [childDocument.sortKey]: { error: true, loading: false },
        }))
      }
    },
    [setChildDocumentsPreviewUrls],
  )

  useEffect(() => {
    if (childDocuments.length > 0 && Object.values(childDocumentsPreviewUrls || {}).length === 0) {
      const limit = pLimit(3)

      const loadPreviews = async () => {
        await Promise.all(childDocuments.map((document) => limit(() => getPreviewUrl(document))))
      }

      loadPreviews()
    }
  }, [childDocuments, childDocumentsPreviewUrls, getPreviewUrl])

  const handleSelectAll = () => {
    if (!selectAll) {
      setSelectedPages(childDocuments.map((document) => document.sortKey))
    } else {
      setSelectedPages([])
    }
    setSelectAll((prevState) => !prevState)
  }

  const handleSelect = (sortKey: string) => {
    if (selectedPages.includes(sortKey)) {
      if (selectAll) {
        setSelectAll(false)
        const filteredChildDocumentsKeys = childDocuments
          .filter((document) => document.sortKey !== sortKey)
          .map((document) => document.sortKey)
        setSelectedPages(filteredChildDocumentsKeys)
      } else {
        setSelectedPages((prevState) => prevState.filter((page: string) => page !== sortKey))
      }
    } else {
      if (selectedPages.length + 1 === childDocuments.length) {
        setSelectAll(true)
      }
      setSelectedPages((prevState) => [...prevState, sortKey])
    }
  }

  if (loading) {
    return (
      <Paper sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    )
  }

  const previewUrl = selectedPreview && childDocumentsPreviewUrls[selectedPreview]?.url

  return (
    <Paper
      sx={{
        p: 1,
        my: 3,
        minHeight: 120,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
        width: '80%',
      }}
    >
      <Stack direction="row" gap={1}>
        <Card sx={{ width: '30%', maxHeight: '1200px', overflow: 'auto', p: 2 }}>
          <Typography variant="subtitle2">Pages</Typography>
          <Typography variant="caption" color="textDisabled">
            Choose specific pages or process the entire document
          </Typography>
          <Stack direction="row" justifyContent="space-between">
            <FormControlLabel
              control={<Checkbox checked={selectAll} onClick={handleSelectAll} />}
              label="Select all"
              slotProps={{ typography: { variant: 'subtitle2' } }}
              sx={{
                '& .MuiFormControlLabel-label': {
                  typography: 'subtitle2',
                },
              }}
            />
            <PageInput
              value={pageInput}
              onChange={(value) => setPageInput(value)}
              onEnter={(e) => {
                if (e.key === 'Enter') {
                  const pageNum = Number.parseInt(pageInput, 10)
                  if (!Number.isNaN(pageNum) && pageNum >= 1 && pageNum <= childDocuments.length) {
                    const sortKey = childDocuments[pageNum - 1].sortKey
                    pageRefs.current[sortKey]?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    })
                    setSelectedPreview(sortKey)
                  }
                }
              }}
              length={childDocuments.length}
            />
          </Stack>
          <Stack gap={3}>
            {childDocuments.map((childDocument, index) => (
              <Box key={childDocument.sortKey}>
                {childDocumentsPreviewUrls[childDocument.sortKey]?.loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box>
                    <Stack direction="row" justifyContent="flex-end" p={1}>
                      <Typography>{index + 1}</Typography>
                    </Stack>

                    <Box
                      ref={(el) => {
                        pageRefs.current[childDocument.sortKey] = el as HTMLDivElement | null
                      }}
                      sx={{
                        border:
                          selectedPreview === childDocument.sortKey ||
                          selectAll ||
                          selectedPages.includes(childDocument.sortKey)
                            ? '2px solid'
                            : 'none',
                        borderColor:
                          selectAll || selectedPages.includes(childDocument.sortKey) ? 'primary.main' : 'text.primary',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedPreview(childDocument.sortKey)}
                    >
                      <Checkbox
                        checked={selectAll || selectedPages.includes(childDocument.sortKey)}
                        onClick={(event) => {
                          event.stopPropagation()
                          handleSelect(childDocument.sortKey)
                        }}
                        sx={{ position: 'absolute' }}
                      />
                      <img
                        src={childDocumentsPreviewUrls[childDocument.sortKey]?.url}
                        alt="document preview"
                        style={{
                          minHeight: '400px',
                          borderRadius: '8px',
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        </Card>
        <Card sx={{ width: '70%' }}>
          {previewUrl ? (
            <img src={previewUrl} alt="document preview" style={{ borderRadius: '8px', minHeight: '400px' }} />
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                borderRadius: '8px',
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Card>
      </Stack>
    </Paper>
  )
}
