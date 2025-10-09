export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/submit-form") {
      try {
        const formData = await request.formData();
        const name = formData.get("name");
        const email = formData.get("email");
        const phone = formData.get("phone");
        const subject = formData.get("subject");
        const message = formData.get("message");

        // Basic validation
        if (!name || !email || !subject || !message) {
          return new Response("Missing required fields.", { status: 400 });
        }

        const RESEND_API_KEY = env.RESEND_API_KEY;
        const TO_EMAIL = "syed@jeddahcrane.com";
        const FROM_EMAIL = "Jeddah Crane <no-reply@jeddahcrane.com>"; // Replace with verified sender

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
            html: `
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || "N/A"}</p>
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, "<br>")}</p>
            `,
          }),
        });

        if (emailResponse.ok) {
          return Response.redirect("https://jeddahcrane.com/thanks.html", 303);
        } else {
          const errText = await emailResponse.text();
          return new Response(`Failed to send email: ${errText}`, { status: 500 });
        }
      } catch (err) {
        return new Response(`Server error: ${err.message || err}`, { status: 500 });
      }
    }

    //return new Response("Only POST requests allowed.", { status: 405 });
  },
};
