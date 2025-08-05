import {
  $isTextNode,
  DOMConversionMap,
  DOMExportOutput,
  DOMExportOutputMap,
  isHTMLElement,
  Klass,
  LexicalEditor,
  LexicalNode,
  ParagraphNode,
  TextNode,
} from 'lexical'
import { parseAllowedColor, parseAllowedFontSize } from './style/styleConfig.ts'

export const removeStylesExportDOM = (editor: LexicalEditor, node: LexicalNode): DOMExportOutput => {
  const output = node.exportDOM(editor)
  if (output && isHTMLElement(output.element)) {
    for (const el of [output.element, ...output.element.querySelectorAll('[style],[class],[dir="ltr"]')]) {
      el.removeAttribute('class')
      if (el.getAttribute('dir') === 'ltr') {
        el.removeAttribute('dir')
      }
    }

    const dom = output.element

    // Preserve alignment as inline style
    const format = (node as ParagraphNode).getFormat?.()
    switch (format) {
      case 2:
        dom.style.textAlign = 'center'
        break
      case 3:
        dom.style.textAlign = 'right'
        break
      case 4:
        dom.style.textAlign = 'justify'
        break
      default:
        dom.style.textAlign = 'left'
        break
    }

    // Optionally strip other attributes
    dom.removeAttribute('class')
    dom.removeAttribute('dir')
  }

  return output
}

export const exportMap: DOMExportOutputMap = new Map<
  Klass<LexicalNode>,
  (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
  [ParagraphNode, removeStylesExportDOM],
  [TextNode, removeStylesExportDOM],
])

export const getExtraStyles = (element: HTMLElement): string => {
  // Parse styles from pasted input, but only if they match exactly the
  // sort of styles that would be produced by exportDOM
  let extraStyles = ''
  const fontSize = parseAllowedFontSize(element.style.fontSize)
  const backgroundColor = parseAllowedColor(element.style.backgroundColor)
  const color = parseAllowedColor(element.style.color)
  if (fontSize !== '' && fontSize !== '15px') {
    extraStyles += `font-size: ${fontSize};`
  }
  if (backgroundColor !== '' && backgroundColor !== 'rgb(255, 255, 255)') {
    extraStyles += `background-color: ${backgroundColor};`
  }
  if (color !== '' && color !== 'rgb(0, 0, 0)') {
    extraStyles += `color: ${color};`
  }
  return extraStyles
}

export const constructImportMap = (): DOMConversionMap => {
  const importMap: DOMConversionMap = {}

  // Wrap all TextNode importers with a function that also imports
  // the custom styles implemented by the playground
  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    importMap[tag] = (importNode) => {
      const importer = fn(importNode)
      if (!importer) {
        return null
      }
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element)
          if (output === null || output.forChild === undefined || output.after !== undefined || output.node !== null) {
            return output
          }
          const extraStyles = getExtraStyles(element)
          if (extraStyles) {
            const { forChild } = output
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent)
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles)
                }
                return textNode
              },
            }
          }
          return output
        },
      }
    }
  }

  return importMap
}
