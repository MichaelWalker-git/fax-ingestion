import { css, Global } from '@emotion/react'
import { useTheme } from '@mui/material/styles'

export default function ProcessingFlowStyles() {
  const theme = useTheme()
  return (
    <Global
      styles={css`
          .react-flow__connection-path {
            stroke: ${theme.palette.primary.main} !important;
            stroke-dasharray: 5,5;
            stroke-width: 2;
          }
          .react-flow__handle {
            width: 14px;
            height: 14px;
            background-color: ${theme.palette.primary.main} !important;
            border-radius: 50%;
            border: 2px solid white;
          }
        `}
    />
  )
}
