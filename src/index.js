export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight handling
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method === "POST" && url.pathname === "/submit-form") {
      try {
        const formData = await request.formData();

        // Honeypot: bots often fill hidden fields
        const honeypot = formData.get("website");
        if (honeypot) {
          // pretend success but don't send email
          const headers = new Headers();
          headers.set("Location", new URL("/thanks.html", request.url).toString());
          headers.set("Access-Control-Allow-Origin", request.headers.get("Origin") || "*");
          return new Response(null, { status: 303, headers });
        }

        const name = formData.get("name")?.toString().trim();
        const email = formData.get("email")?.toString().trim();
        const phone = formData.get("phone")?.toString().trim();
        const subject = formData.get("subject")?.toString().trim();
        const message = formData.get("message")?.toString().trim();

        if (!name || !email || !subject || !message) {
          return new Response("Missing required fields.", { status: 400 });
        }

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return new Response("Invalid email address.", { status: 400 });
        }

        const RESEND_API_KEY = env.RESEND_API_KEY;
        if (!RESEND_API_KEY) {
          return new Response("Mail service not configured.", { status: 500 });
        }

        const TO_EMAIL = "syed@jeddahcrane.com";
        const FROM_EMAIL = env.FROM_EMAIL || "Jeddah Crane <no-reply@jeddahcrane.com>";

        const escapeHtml = (str = "") =>
          str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");

        const htmlBody = `
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone) || "N/A"}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
        `;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [TO_EMAIL],
            subject: `Contact Form Submission: ${subject}`,
            html: htmlBody,
            text: `${name} <${email}>\n\n${message}`,
          }),
        });

        if (emailResponse.ok) {
          const headers = new Headers();
          headers.set("Location", new URL("/thanks.html", request.url).toString());
          headers.set("Access-Control-Allow-Origin", request.headers.get("Origin") || "*");
          return new Response(null, { status: 303, headers });
        } else {
          const errText = await emailResponse.text();
          return new Response(`Failed to send email: ${errText}`, { status: 500 });
        }
      } catch (err) {
        return new Response(`Server error: ${err.message || err}`, { status: 500 });
      }
    }

    return new Response("Only POST requests allowed.", { status: 405 });
  },
};
