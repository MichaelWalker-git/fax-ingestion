import { Box, Button, CircularProgress, Paper, Step, StepIconProps, StepLabel, Stepper } from '@mui/material'
import * as React from 'react'
import { useState } from 'react'
import StepGuide from '../../../../features/guide/components/StepGuide.tsx'
import { getStepIcon } from './utils.ts'

interface CustomStep {
  label: string
  content: string | React.ReactNode
}

interface Props {
  steps: Array<CustomStep>
  width?: string
  loading?: boolean
  onFinish?: () => void
  disabledNext?: boolean
  onNextStep?: (step: number) => void
}

export default function CustomVerticalStepper({ steps, width, disabledNext, onNextStep, loading, onFinish }: Props) {
  const [activeStep, setActiveStep] = useState(0)

  const handleNext = (step?: number) => {
    if (onNextStep) {
      onNextStep(step ?? activeStep + 1)
    }

    setActiveStep((prevActiveStep) => {
      const nextStep = step ?? prevActiveStep + 1
      const shouldSetNext = prevActiveStep !== nextStep && (!disabledNext || prevActiveStep > nextStep)

      return shouldSetNext ? nextStep : prevActiveStep
    })
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => {
      const nextStep = prevActiveStep - 1

      if (onNextStep) {
        onNextStep(nextStep)
      }

      return nextStep
    })
  }

  return (
    <Box
      display="flex"
      width={width}
      height="100%"
      sx={{
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
      px={4}
    >
      <Box maxWidth="22%" display="flex" flexDirection="column" justifyContent="start" pr={4} flex={1} gap={3}>
        <Paper sx={{ p: 2, height: 'fit-content' }}>
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
            sx={{
              '& .MuiStepConnector-root': {
                marginLeft: '1.3em',
                flex: 'none',
              },
            }}
          >
            {steps.map((step, index) => (
              <Step key={step.label} sx={{ display: 'flex' }}>
                <StepLabel
                  onClick={() => handleNext(index)}
                  sx={{ flex: 1, cursor: 'pointer !important' }}
                  StepIconComponent={getStepIcon(activeStep, index) as React.ElementType<StepIconProps>}
                  StepIconProps={{
                    color: 'primary',
                    sx: {
                      width: '1.8em',
                      height: '1.8em',
                    },
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
        <StepGuide step={activeStep} />
      </Box>
      <Box flex={4} width={'70%'}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" width="100%">
            <CircularProgress />
          </Box>
        ) : (
          <Box>{steps[activeStep]?.content}</Box>
        )}
        <Box sx={{ mb: 2, mt: 4 }} display="flex" gap={2} justifyContent="flex-end">
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }} variant="outlined">
              Back
            </Button>
          )}
          <Button
            disabled={disabledNext}
            variant="contained"
            onClick={() => {
              if (activeStep === steps.length - 1) {
                onFinish?.()
              } else {
                handleNext()
              }
            }}
            sx={{ mt: 1, mr: 1 }}
          >
            {activeStep === steps.length - 1 ? 'Finish' : 'Continue'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
