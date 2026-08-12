import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export function load({ cookies }) {
  if (cookies.get('admin_auth_token') === 'true') {
    throw redirect(303, '/admin/dashboard');
  }
}

export const actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const pin = data.get('pin');
    
    if (pin === (env.ADMIN_PIN || '2714')) {
      cookies.set('admin_auth_token', 'true', {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      throw redirect(303, '/admin/dashboard');
    }
    
    return fail(400, { error: 'Incorrect PIN' });
  }
};
