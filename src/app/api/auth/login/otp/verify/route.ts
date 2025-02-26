import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';


export const dynamic = 'force-dynamic'

export async function POST(request: Request) {

    const formData = await request.formData()
    const email = String(formData.get('email'))
    const token = String(formData.get('token'))

    const supabase = createRouteHandlerClient({ cookies })

    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
    
      if (error) {
        console.error("Invalid OTP:", error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    
      return NextResponse.json({ data: "logged in" }, { status: 200 });
    }
