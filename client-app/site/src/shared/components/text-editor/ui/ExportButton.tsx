import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Button } from '@mui/material'
import { $generateHtmlFromNodes } from '@lexical/html'

export function ExportButton() {
  const [editor] = useLexicalComposerContext()

  const handleExport = () => {
    editor.getEditorState().read(() => {
      const html = $generateHtmlFromNodes(editor, null)
      console.log('Exported HTML:', html)
    })
  }

  return (
    <Button onClick={handleExport} className="toolbar-item">
      Export HTML
    </Button>
  )
}
