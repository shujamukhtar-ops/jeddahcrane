// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Use port from environment or default to 3000

// Middleware to parse URL-encoded data (form submissions) and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (your HTML, CSS, JS frontend files)
// Assuming your HTML files (index.html, contact.html, thanks.html etc.) are in a 'public' folder
app.use(express.static(path.join(__dirname, 'public')));


// --- Nodemailer Transporter Configuration ---

// Option 1: Ethereal Email (for testing - no real email sent, viewable in browser)
// This is great for development as it doesn't require real credentials.
async function createEtherealTestTransporter() {
    let testAccount = await nodemailer.createTestAccount();
    console.log("Ethereal test account created:");
    console.log("User: %s", testAccount.user);
    console.log("Pass: %s", testAccount.pass);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl({messageId: 'fake-id'})); // General preview link format

    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });
}

// Option 2: Real SMTP Service (e.g., Gmail - uncomment and configure .env if using)
/*
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"), // Default to 587 if not set
    secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // For Gmail, you might need to allow less secure apps or use an app password
    // and ensure your server's IP isn't flagged.
    // For other services like SendGrid/Mailgun, refer to their Nodemailer docs.
});
*/

// --- API Endpoint for Form Submission ---
app.post('/submit-form', async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
        return res.status(400).send('Error: Please fill all required fields.');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) { // Simple email format check
        return res.status(400).send('Error: Please enter a valid email address.');
    }

    const recipientEmail = process.env.FORM_RECIPIENT_EMAIL || 'parts@jeddahcraneservices.com';

    const mailOptions = {
        from: `"${name}" <${email}>`, // Sender address (appears in From field)
        to: recipientEmail, // Your receiving email address
        replyTo: email, // So you can reply directly to the user
        subject: `Website Contact: ${subject}`,
        text: `You have received a new message from your website contact form:\n\n` +
              `Name: ${name}\n` +
              `Email: ${email}\n` +
              (phone ? `Phone: ${phone}\n` : '') +
              `Subject: ${subject}\n` +
              `Message:\n${message}`,
        html: `<p>You have received a new message from your website contact form:</p>` +
              `<ul>` +
              `<li><strong>Name:</strong> ${name}</li>` +
              `<li><strong>Email:</strong> ${email}</li>` +
              (phone ? `<li><strong>Phone:</strong> ${phone}</li>` : '') +
              `<li><strong>Subject:</strong> ${subject}</li>` +
              `</ul>` +
              `<p><strong>Message:</strong></p>` +
              `<p>${message.replace(/\n/g, '<br>')}</p>`
    };

    try {
        // Select transporter (using Ethereal for this example)
        const currentTransporter = await createEtherealTestTransporter();
        // If using a real provider (Option 2), you'd use that transporter directly:
        // const currentTransporter = transporter;


        let info = await currentTransporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        // If using Ethereal, log the preview URL
        if (info.messageId && nodemailer.getTestMessageUrl(info)) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
        
        // Redirect to thanks.html on success
        res.redirect('/thanks.html');

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error: Could not send message. Please try again later.');
    }
});

// --- Serve HTML files directly for root and other pages ---
// This assumes your HTML files are in a 'public' directory.
// Example: GET /contact will serve public/contact.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});
app.get('/parts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'parts.html'));
});
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});
// thanks.html will be served by express.static or you can add a route for it too.

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Using Ethereal.email for testing. Check console for test account and preview URLs upon form submission.`);
    console.log(`Make sure your FORM_RECIPIENT_EMAIL in .env is set to shujamukhtar26@gmail.com if you switch to a real provider.`);
});