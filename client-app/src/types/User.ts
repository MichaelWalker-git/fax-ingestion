export interface UserAttributes {
  email?: string
  phone_number?: string
  given_name?: string
  family_name?: string
}

export interface User {
  createdAt: string
  email: string
  familyName: string
  givenName: string
  status: string
  username: string
  userId: string
  enabled: boolean
}
