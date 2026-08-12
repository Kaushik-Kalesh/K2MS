import { redirect } from '@sveltejs/kit';

export async function POST({ cookies }) {
    cookies.delete('admin_auth_token', { path: '/' });
    throw redirect(303, '/admin');
}
