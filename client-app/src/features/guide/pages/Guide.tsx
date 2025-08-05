import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material'
import applicationDiagram from '../../../assets/architecture-diagram.png'
import componentDiagram from '../../../assets/component-diagram.png'
import ApplicationFlowDiagram from '../components/ApplicationFlowDiagram.tsx'
import BeforeYouBeginGuide from '../components/BeforeYouBeginGuide.tsx'
import DocumentCaptureGuide from '../components/DocumentCaptureGuide.tsx'
import DocumentExtractionGuide from '../components/DocumentExtractionGuide.tsx'
import SummaryGuide from '../components/SummaryGuide.tsx'

export default function Guide() {
  return (
    <Box display="flex" justifyContent="center">
      <Paper sx={{ p: 4, width: '60%' }}>
        <Typography variant="h4" gutterBottom>
          How to Use Intelligent Document Processing
        </Typography>
        <Typography variant="body1" sx={{ mb: '16px' }}>
          This page will guide you through the three-step process of capturing, extracting, and summarizing data from
          your uploaded documents.
        </Typography>
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Intelligent Document Processing Overview
            </Typography>
            <Typography variant="body2" sx={{ mb: '16px' }}>
              Intelligent Document Processing (IDP) helps you transform your uploaded documents into structured,
              meaningful data. In this application, you can:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Capture a document (PDF or image)." />
              </ListItem>
              <ListItem>
                <ListItemText primary="Extract specific information or text using flexible processing methods." />
              </ListItem>
              <ListItem>
                <ListItemText primary="Summarize and review the extracted results." />
              </ListItem>
            </List>
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle2">Supported Processing Types:</Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="FORM: Extract structured fields (for invoices, forms, etc.)"
                    secondary="Modes: QA (Question Answering) or FORM extraction"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="TEXT: Extract unstructured text (e.g., articles, free-form text)"
                    secondary="Modes: QA (Question Answering) or TEXT extraction"
                  />
                </ListItem>
              </List>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ mb: '16px' }}>
              <strong>Application Flow Diagram:</strong>
            </Typography>
            <ApplicationFlowDiagram />

            <Accordion sx={{ mt: 4 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="capture-content" id="capture-header">
                <Typography variant="h6">Application architecture diagram</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <img src={applicationDiagram} alt="Application flow diagram" />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="capture-content" id="capture-header">
                <Typography variant="h6">Document analysis component diagram</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <img
                  src={componentDiagram}
                  alt="Document analysis component diagram"
                  style={{ maxWidth: '-webkit-fill-available' }}
                />
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="before-begin-content"
            id="before-begin-header"
          >
            <Typography variant="h6">Before You Begin</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <BeforeYouBeginGuide />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="capture-content" id="capture-header">
            <Typography variant="h6">1. Document Capture</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DocumentCaptureGuide />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="extraction-content" id="extraction-header">
            <Typography variant="h6">2. Document Extraction</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DocumentExtractionGuide />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="summary-content" id="summary-header">
            <Typography variant="h6">3. Summary</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <SummaryGuide />
          </AccordionDetails>
        </Accordion>

        <Card variant="outlined" sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Putting It All Together
            </Typography>
            <Typography variant="body2">Follow these steps to quickly process your document:</Typography>
            <List>
              <ListItem>
                <ListItemText primary="Select a Document" secondary="Choose the file from your table (PDF or image)." />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Step 1 – Capture"
                  secondary="Preview the file, choose a PDF page if needed, and select FORM or TEXT."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Step 2 – Extraction"
                  secondary="Decide on QA vs. FORM (or QA vs. TEXT), then run the extraction."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Step 3 – Summary"
                  secondary="Review the JSON or text results, export if needed, or refine your inputs."
                />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2">Need more help? Check our FAQ or contact support.</Typography>
          </CardContent>
        </Card>
      </Paper>
    </Box>
  )
}
