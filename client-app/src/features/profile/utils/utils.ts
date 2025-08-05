import { updateUserAttributes } from 'aws-amplify/auth'
import { z } from 'zod'

const formSchema = z.object({
  phone_number: z.string().min(1, 'Phone number is required.'),
  given_name: z.string().max(50, 'Given name is too long.'),
  family_name: z.string().max(50, 'Family name is too long.'),
})

export async function handleFormAction(
  _: unknown,
  formData: FormData,
): Promise<{ errors: Record<string, string[]>; success: boolean | null }> {
  const data = {
    phone_number: formData.get('phone_number')?.toString(),
    given_name: formData.get('given_name')?.toString(),
    family_name: formData.get('family_name')?.toString(),
  }

  const validation = formSchema.safeParse(data)

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      success: false,
    }
  }

  await updateUserAttributes({
    userAttributes: data,
  })

  return { errors: {}, success: true }
}
