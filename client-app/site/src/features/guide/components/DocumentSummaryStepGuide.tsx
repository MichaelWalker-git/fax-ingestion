import { Divider, List, ListItem, ListItemText, Typography } from '@mui/material'

export default function DocumentSummaryStepGuide() {
  return (
    <>
      <Typography variant="body2">
        In this step, you can review and verify all the extracted information. Depending on the mode used (FORM, QA, or
        TEXT), you’ll see results displayed in either JSON or plain text format.
      </Typography>

      <List dense>
        <ListItem>
          <ListItemText
            primary="FORM Extraction Results"
            secondary="Displayed as structured JSON. You can view key-value pairs or table-like data."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="QA Results"
            secondary="Displayed as plain text. Shows the best answer or snippet found in the document."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="TEXT Extraction Results"
            secondary="Displays all readable text from the selected page."
          />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Tips &amp; Best Practices
      </Typography>
      <List dense sx={{ pl: 2 }}>
        <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
          <ListItemText primary="Double-check extracted data against the original document before finalizing." />
        </ListItem>
        <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
          <ListItemText primary="If something looks incorrect, go back and adjust your extraction mode, QA question, or form fields." />
        </ListItem>
        <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
          <ListItemText primary="You can download/export the results if needed, or move on to other documents." />
        </ListItem>
      </List>
    </>
  )
}
