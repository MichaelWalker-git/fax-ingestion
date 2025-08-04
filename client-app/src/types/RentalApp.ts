export type RentalAppResult = {
  accuracy: number
  consistency_check: { [key: string]: string }
  explanation_of_accuracy_score: string
  notes: string
  potential_improvements: string[]
}
