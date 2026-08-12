import { redirect } from '@sveltejs/kit';

export function load({ cookies }) {
    if (cookies.get('admin_auth_token') !== 'true') {
        throw redirect(303, '/admin');
    }
}
