import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const POST = async ({ request }) => {
    try {
        const data = await request.json();
        const { name, email, reason, message } = data;

        const resendApiKey = env.RESEND_API_KEY;
        const toEmail = env.GMAIL_USER || 'kaushikkalesh@gmail.com';

        if (!resendApiKey) {
            return json({ error: 'RESEND_API_KEY missing on server.' }, { status: 500 });
        }

        const htmlBody = `
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
        `;

        const payload = {
            from: "K2M Services <crm@k2ms.in>",
            to: [toEmail],
            reply_to: email,
            subject: "New K2MS Contact Request",
            html: htmlBody
        };

        const res = await fetch("https://api.resend.com/emails", {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            return json({ success: true });
        } else {
            const errText = await res.text();
            throw new Error(`Resend API Error: ${errText}`);
        }
    } catch (e) {
        console.error('Error sending email:', e);
        return json({ error: e.message }, { status: 500 });
    }
};
