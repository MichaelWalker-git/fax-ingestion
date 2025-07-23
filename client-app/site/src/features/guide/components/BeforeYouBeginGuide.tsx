import { List, ListItem, ListItemText, Typography } from '@mui/material'

export default function BeforeYouBeginGuide() {
  return (
    <>
      <Typography variant="body1">
        On the main page of this application, you’ll see a table listing all the documents you’ve uploaded so far.
      </Typography>
      <List>
        <ListItem>
          <ListItemText
            primary="Add Document"
            secondary="Click the 'Add Document' button to open the Upload File modal."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Upload File Modal"
            secondary="Select either a PDF or image file from your computer. You can also choose an initial Processing Type (FORM or TEXT)."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Document Appears in the Table"
            secondary="Once the upload is complete, your new document will be listed in the main table."
          />
        </ListItem>
      </List>
      <Typography variant="body2" sx={{ mt: 2 }}>
        After uploading, click on your document in the table to start the three-step processing flow detailed below.
      </Typography>
    </>
  )
}
