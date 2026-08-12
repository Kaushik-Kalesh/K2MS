import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const POST = async ({ request }) => {
    try {
        const data = await request.json();
        const { email, reason, remarks } = data;

        const resendApiKey = env.RESEND_API_KEY;
        const toEmail = env.GMAIL_USER || 'kaushikkalesh@gmail.com';

        if (!resendApiKey) {
            return json({ error: 'RESEND_API_KEY missing on server.' }, { status: 500 });
        }

        const htmlBody = `
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Remarks:</strong></p>
        <p style="white-space: pre-wrap;">${remarks}</p>
        `;

        const payload = {
            from: "K2MS CRM <onboarding@resend.dev>",
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
