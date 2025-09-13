export default {
	async fetch(request, env) {
	  const url = new URL(request.url);
  
	  if (request.method === 'POST' && url.pathname === '/submit-form') {
		const formData = await request.formData();
  
		const name = formData.get('name') || "Anonymous";
		const email = formData.get('email') || "no-reply@example.com";
		const phone = formData.get('phone') || "";
		const subject = formData.get('subject') || "No Subject";
		const message = formData.get('message') || "";
  
		const mailBody = {
		  personalizations: [
			{
			  to: [{ email: "syed@jeddahcrane.com" }]
			}
		  ],
		  from: { email: "nsyed@jeddahcrane.com", name: name },
		  subject: `Website Contact: ${subject}`,
		  content: [
			{
			  type: "text/plain",
			  value:
				`New message from website:\n\n` +
				`Name: ${name}\n` +
				`Email: ${email}\n` +
				(phone ? `Phone: ${phone}\n` : "") +
				`Subject: ${subject}\n\n` +
				`Message:\n${message}`
			}
		  ]
		};
  
		const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
		  method: "POST",
		  headers: {
			"Authorization": `Bearer ${env.SENDGRID_API_KEY}`,
			"Content-Type": "application/json"
		  },
		  body: JSON.stringify(mailBody)
		});
  
		if (response.ok) {
		  return Response.redirect("https://jeddahcrane.pages.dev/thanks.html", 302);
		} else {
		  const err = await response.text();
		  return new Response("Email failed: " + err, { status: 500 });
		}
	  }
  
	  return new Response("Not Found", { status: 404 });
	}
  };
  