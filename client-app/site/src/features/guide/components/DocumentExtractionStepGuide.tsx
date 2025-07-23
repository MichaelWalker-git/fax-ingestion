import { Divider, List, ListItem, ListItemText, Typography } from '@mui/material'

export default function DocumentExtractionStepGuide() {
  return (
    <>
      <Typography variant="body2">
        In this step, you’ll decide how to extract data based on the processing type chosen in "Upload File Modal" (FORM
        or TEXT). You can perform structured extraction or use QA (Question Answering) to retrieve specific information.
      </Typography>

      <List dense>
        <ListItem>
          <ListItemText
            primary="Answer question"
            secondary="Enter a question (e.g., 'What is the invoice total?') to retrieve the relevant data. Click 'Save' to confirm your question."
          />
        </ListItem>

        <ListItem>
          <ListItemText
            primary="Form Extraction"
            secondary={
              <>
                <Typography variant="body2">
                  Extract structured fields automatically. You can also customize what fields to extract by clicking{' '}
                  <em>“Plus icon”</em>.
                </Typography>
                <ul style={{ marginTop: 4, marginBottom: 0, paddingLeft: 20 }}>
                  <li>
                    <strong>Field Name (required)</strong>: Give your field a descriptive name (e.g., “Customer Name”).
                  </li>
                  <li>
                    <strong>Number (optional)</strong>: If your form has a numbered format (e.g., Field #1, #2), enter
                    the number. Otherwise, leave it blank.
                  </li>
                </ul>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Don’t forget to click <em>“Save”</em> after adding or modifying fields.
                </Typography>
              </>
            }
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Text Extraction"
            secondary="Extract all readable text from the page for further analysis."
          />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Tips &amp; Best Practices
      </Typography>
      <List dense sx={{ pl: 2 }}>
        <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
          <ListItemText primary="Always click “Save” after making changes in QA or FORM extraction tabs." />
        </ListItem>
        <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
          <ListItemText primary="Then click “Continue” to run the process." />
        </ListItem>
        <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
          <ListItemText primary="For QA, ask clear, specific questions matching your document's wording." />
        </ListItem>
        <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
          <ListItemText
            primary="Use FORM extraction for consistent layouts—fill out “Field Name” (required) and
              “Number” only if needed."
          />
        </ListItem>
      </List>
    </>
  )
}
