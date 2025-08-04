import { List, ListItem, ListItemText, Typography } from '@mui/material'

export default function DocumentCaptureGuide() {
  return (
    <>
      <Typography variant="body1">
        <strong>Description:</strong> In this step, you preview the selected document and decide how you want to handle
        it.
      </Typography>
      <List>
        <ListItem>
          <ListItemText
            primary="View the Document"
            secondary="If the file is an image, you see one page. If it's a PDF, you see multiple pages."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Select a Page (PDF only)"
            secondary="Scroll through the PDF pages and choose the one you want to process."
          />
        </ListItem>
        <ListItem>
          <ListItemText primary="Click the 'Continue' button" secondary="Move on to the next step." />
        </ListItem>
      </List>
      <Typography variant="body2" sx={{ mt: 2 }}>
        <strong>Tips & Best Practices:</strong> Pick the most relevant page for PDFs, and ensure the document is clear
        and legible for best extraction results.
      </Typography>
    </>
  )
}
