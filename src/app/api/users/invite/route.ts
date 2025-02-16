import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import supabaseAdmin from '@/src/lib/supabaseAdmin'
import { SITE_URL } from '@/src/environment'
import {  requireAdmin } from '@/src/lib/auth-helper'

export async function POST(req: Request) {
  try {

    await requireAdmin()
    
    const { email, name } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }


    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Create user with invitation
    const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${SITE_URL}/auth/callback`,
    })

    if (inviteError) {
      console.error('Invite error:', inviteError)
      throw inviteError
    }

    if (!data?.user?.id) {
      throw new Error('Failed to create user')
    }

    // Create profile after successful invitation
    const { error: createProfileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: data.user.id,
        email: email,
        name: name,
        role: 'client',
        confirmed: false,
        created_at: new Date().toISOString()
      })

    if (createProfileError) {
      console.error('Profile creation error:', createProfileError)
      // Try to clean up the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(data.user.id)
      throw createProfileError
    }

    return NextResponse.json({
      success: true,
      userId: data.user.id
    })
  } catch (error) {
    console.error('Full invitation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send invitation' },
      { status: 500 }
    )
  }
} 