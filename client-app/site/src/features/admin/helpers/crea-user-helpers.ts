import { post } from 'aws-amplify/api'
import { z } from 'zod'
import { API_NAME, API_USER } from '../../../shared/api/paths.ts'

const formSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required.'),
  givenName: z.string().max(50, 'Given name is too long.'),
  familyName: z.string().max(50, 'Family name is too long.'),
  email: z.string().email('Invalid email address.'),
})

export async function handleFormAction(
  _: unknown,
  formData: FormData,
): Promise<{ errors: Record<string, string[]>; success: boolean | null }> {
  const data = {
    phoneNumber: formData.get('phone_number')?.toString(),
    givenName: formData.get('given_name')?.toString(),
    familyName: formData.get('family_name')?.toString(),
    email: formData.get('email')?.toString(),
  }

  const validation = formSchema.safeParse(data)

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      success: false,
    }
  }

  await post({
    apiName: API_NAME,
    path: API_USER,
    options: {
      // @ts-ignore
      body: { ...data },
    },
  }).response

  return { errors: {}, success: true }
}
