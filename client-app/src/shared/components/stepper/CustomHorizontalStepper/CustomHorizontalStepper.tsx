import { useState } from 'react'
import Box from '@mui/material/Box'
import Step from '@mui/material/Step'
import Button from '@mui/material/Button'
import Stepper from '@mui/material/Stepper'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import { CustomStep } from '../utils.ts'
import { Stack } from '@mui/material'

interface CustomHorizontalStepperProps {
  steps: Array<CustomStep>
  onFinish?: () => void
  disabledNext?: boolean
  onNextStep?: (step: number) => void
}

export default function CustomHorizontalStepper({
  steps,
  onFinish,
  disabledNext,
  onNextStep,
}: CustomHorizontalStepperProps) {
  const [activeStep, setActiveStep] = useState(0)

  const handleNext = () => {
    onNextStep?.(activeStep + 1)
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const isTheLastStep = activeStep === steps.length - 1

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Stepper activeStep={activeStep} sx={{ width: '80%' }}>
          {steps.map(({ label, subLabel }) => {
            const stepProps: { completed?: boolean } = {}
            const labelProps: {
              optional?: React.ReactNode
            } = {}
            if (subLabel) {
              labelProps.optional = <Typography variant="caption">{subLabel}</Typography>
            }
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            )
          })}
        </Stepper>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', alignItems: 'center', width: '20%' }}>
          <Button color="inherit" disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          <Button variant="contained" onClick={isTheLastStep ? onFinish : handleNext} disabled={disabledNext}>
            {isTheLastStep ? 'Finish' : 'Continue'}
          </Button>
        </Box>
      </Stack>

      {steps[activeStep].content}
    </>
  )
}
