
import { revalidatePath } from 'next/cache'
import { supabase } from '@/src/supabase/supabase-client'

export async function signup(formData: FormData) {
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  revalidatePath('/', 'layout')
  //redirect('/account')
}
