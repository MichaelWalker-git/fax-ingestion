import React, { createContext, useContext } from 'react'

const CustomNodeContext = createContext<{ nodeId: string }>({ nodeId: '' })

export const CustomNodeProvider = ({ children, nodeId }: { children: React.ReactNode; nodeId: string }) => {
  return <CustomNodeContext.Provider value={{ nodeId }}>{children}</CustomNodeContext.Provider>
}

export default CustomNodeContext

export const useCustomNode = () => {
  return useContext(CustomNodeContext)
}
