export interface IProcessingFlowErrorData {
  nodeId: string
}

export class ProcessingFlowError extends Error {
  data?: IProcessingFlowErrorData

  constructor(message: string, data?: IProcessingFlowErrorData) {
    super(message)
    this.name = 'ProcessingFlowError'
    this.data = data

    Object.setPrototypeOf(this, ProcessingFlowError.prototype)
  }
}
