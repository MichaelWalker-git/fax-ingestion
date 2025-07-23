import { List, ListItem, ListItemText, Typography } from '@mui/material'

export default function DocumentExtractionGuide() {
  return (
    <>
      <Typography variant="body1" sx={{ mb: '16px' }}>
        <strong>Description:</strong> Based on the processing type chosen in "Upload File Modal" (FORM or TEXT), you
        have different extraction modes.
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        FORM Processing:
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText
            primary="QA (Question Answering)"
            secondary="Enter a question (e.g., 'What is the invoice total?') and receive the relevant data."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="FORM Extraction"
            secondary="Extract structured form fields automatically (e.g., names, addresses, invoice #s)."
          />
        </ListItem>
      </List>
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
        TEXT Processing:
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText
            primary="QA (Question Answering)"
            secondary="Enter a question and receive a text snippet from the selected page."
          />
        </ListItem>
        <ListItem>
          <ListItemText primary="TEXT Extraction" secondary="Extract all readable text from the selected page." />
        </ListItem>
      </List>
      <Typography variant="body2" sx={{ mt: 2 }}>
        <strong>Processing Actions:</strong> Click “Continue” to start. QA mode works best with clear, specific
        questions. FORM extraction is ideal for consistent document layouts.
      </Typography>
    </>
  )
}
