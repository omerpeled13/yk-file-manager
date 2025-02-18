import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache'


export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  const supabase = createRouteHandlerClient({ cookies })

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    let errorMessage = "שגיאה לא ידועה"; // Default error message

    switch (error.code) {
      case 'invalid_credentials':
        errorMessage = "פרטי הכניסה אינם נכונים"; // Invalid credentials
        break;
      default:
        errorMessage = "שגיאה: " + error.message; // General error message
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user || !data.session) {
    return NextResponse.json({ error: "התחברות נכשלה" }, { status: 400 });
  }

  return NextResponse.json({ data: data }, { status: 200 });

}

