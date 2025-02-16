import { NextResponse } from 'next/server'
import supabaseAdmin from '@/src/lib/supabaseAdmin'
import { requireAdmin } from '@/src/lib/auth-helper'

export async function DELETE(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        await requireAdmin()

        const { userId } = params

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (deleteError) throw deleteError

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete user error:', error)
        const message = error instanceof Error ? error.message : 'Failed to delete user'
        const status = message.includes('required') ? 401 : 500

        return NextResponse.json({ error: message }, { status })
    }
} 