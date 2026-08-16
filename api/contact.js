module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, reason, message } = req.body;
        const resendApiKey = process.env.RESEND_API_KEY;
        const toEmail = process.env.GMAIL_USER || 'kaushikkalesh@gmail.com';

        if (!resendApiKey) {
            return res.status(500).json({ error: 'RESEND_API_KEY missing on server.' });
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

        const response = await fetch("https://api.resend.com/emails", {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            return res.status(200).json({ success: true });
        } else {
            const errText = await response.text();
            throw new Error(`Resend API Error: ${errText}`);
        }
    } catch (e) {
        console.error('Error sending email:', e);
        return res.status(500).json({ error: e.message });
    }
};
