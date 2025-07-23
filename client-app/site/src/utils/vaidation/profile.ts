import { z } from 'zod'

// Define a proper Zod schema object.
export const profileFormSchema = z.object({
  email: z.string().email('Invalid email address.'),
  phoneNumber: z.string().min(1, 'Phone number is required.'),
  givenName: z.string().max(50, 'Given name is too long.'),
  familyName: z.string().max(50, 'Family name is too long.'),
})

// Now infer the type from the schema.
export type ProfileFormData = z.infer<typeof profileFormSchema> & { tenantId?: string }
