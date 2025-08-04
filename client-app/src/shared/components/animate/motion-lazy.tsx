import { LazyMotion, m } from 'framer-motion'
import loadFeatures from './features.ts'

type Props = {
  children: React.ReactNode
}

function MotionLazy({ children }: Props) {
  return (
    <LazyMotion strict features={loadFeatures}>
      <m.div style={{ height: '100%' }}> {children} </m.div>
    </LazyMotion>
  )
}

export default MotionLazy
