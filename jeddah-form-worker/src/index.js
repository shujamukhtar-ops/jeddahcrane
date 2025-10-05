export default {
    async fetch(request, env) {
      if (request.method === "POST") {
        const formData = await request.formData();
        const name = formData.get("name");
        const email = formData.get("email");
        const subject = formData.get("subject");
        const message = formData.get("message");
  
        const RESEND_API_KEY = env.RESEND_API_KEY;
        const TO_EMAIL = "syed@jeddahcrane.com";
  
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Jeddah Crane <no-reply@yourdomain.com>",
            to: [TO_EMAIL],
            subject: `Contact Form: ${subject}`,
            html: `
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong><br>${message}</p>
            `,
          }),
        });
  
        if (response.ok) {
          return Response.redirect("https://jeddahcrane.com/thanks.html", 303);
        } else {
          return new Response("Failed to send message.", { status: 500 });
        }
      }
      return new Response("Only POST requests allowed.", { status: 405 });
    },
  };
  

  //