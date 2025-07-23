import { Divider, List, ListItem, ListItemText, Typography } from '@mui/material'

export default function DocumentCaptureStepGuide() {
  return (
    <>
      <Typography variant="body2">
        In this step, you can preview the selected document and decide how you want to handle it. For PDF files, select
        the page you want to process; for images, simply preview the single page.
      </Typography>

      <List dense>
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
          <ListItemText primary="Click the 'Continue" secondary="Move on to the next step." />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Tips &amp; Best Practices
      </Typography>
      <List dense sx={{ pl: 2 }}>
        <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
          <ListItemText primary="Pick the most relevant page if you’re processing a multi-page PDF." />
        </ListItem>
        <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
          <ListItemText primary="Ensure your document is clear and legible for the best extraction results." />
        </ListItem>
      </List>
    </>
  )
}
