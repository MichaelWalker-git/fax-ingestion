import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ParagraphNode, TextNode } from 'lexical'

import './style/styles.css'

import ExampleTheme from './style/ExampleTheme.ts'
import ToolbarPlugin from './plugins/ToolbarPlugin.tsx'

import { constructImportMap, exportMap } from './utils.ts'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { $generateHtmlFromNodes } from '@lexical/html'

const editorConfig = {
  html: {
    export: exportMap,
    import: constructImportMap(),
  },
  namespace: 'Text editor',
  nodes: [ParagraphNode, TextNode],
  onError(error: Error) {
    throw error
  },
  theme: ExampleTheme,
}

interface TextEditorProps {
  placeholder: string
  onChange?: (html: string) => void
  inputStyle?: React.CSSProperties
  onAttach?: (files: FileList) => void
}

export function TextEditor({ placeholder, onChange, inputStyle, onAttach }: TextEditorProps) {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                style={inputStyle}
                aria-placeholder={placeholder}
                placeholder={<div className="editor-placeholder">{placeholder}</div>}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <AutoFocusPlugin />
          <OnChangePlugin
            onChange={(editorState, editor) => {
              if (!onChange) return
              editorState.read(() => {
                const html = $generateHtmlFromNodes(editor, null)
                onChange(html)
              })
            }}
          />
        </div>
        <ToolbarPlugin onAttach={onAttach} />
      </div>
    </LexicalComposer>
  )
}
