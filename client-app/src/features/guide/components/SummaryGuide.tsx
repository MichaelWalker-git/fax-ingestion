import { List, ListItem, ListItemText, Typography } from '@mui/material'

export default function SummaryGuide() {
  return (
    <>
      <Typography variant="body1">
        <strong>Description:</strong> Review and verify the results of your extraction. Depending on your mode:
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText
            primary="FORM Extraction Results"
            secondary="Displayed as structured JSON. Use the built-in formatter to view the data."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="QA Results"
            secondary="Displayed as plain text, showing the best answer found in the document."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="TEXT Extraction Results"
            secondary="Displays all extracted text from the selected page."
          />
        </ListItem>
      </List>
      <Typography variant="body2" sx={{ mb: '16px' }}>
        <strong>Final Actions:</strong> You can export/download the results, or go back and refine if something looks
        incorrect. Double-check the extracted data for accuracy.
      </Typography>
    </>
  )
}
