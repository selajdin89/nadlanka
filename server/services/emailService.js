const nodemailer = require("nodemailer");

// Email configuration
const createTransporter = () => {
	// Check if we're using Gmail or another service
	const isGmail = process.env.EMAIL_USER?.includes("@gmail.com");

	if (isGmail) {
		// Gmail SMTP configuration
		return nodemailer.createTransporter({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS, // Use App Password, not regular password
			},
		});
	} else if (process.env.EMAIL_HOST) {
		// Custom SMTP configuration (for other providers)
		return nodemailer.createTransporter({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT || 587,
			secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});
	} else {
		// Fallback to test email service for development
		console.warn(
			"⚠️  Using test email service. Configure real email credentials for production."
		);
		return nodemailer.createTransporter({
			host: "smtp.ethereal.email",
			port: 587,
			secure: false,
			auth: {
				user: process.env.EMAIL_USER || "ethereal.user@ethereal.email",
				pass: process.env.EMAIL_PASS || "ethereal.pass",
			},
		});
	}
};

// Send message notification email to seller
const sendMessageNotificationEmail = async (messageData) => {
	try {
		const transporter = createTransporter();

		// Email template for seller notification
		const mailOptions = {
			from: `"NaDlanka Marketplace" <${
				process.env.EMAIL_FROM || "noreply@nadlanka.com"
			}>`,
			to: messageData.seller.email,
			subject: `New message about your product: ${messageData.product.title}`,
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
						<h2 style="color: #1e293b; margin: 0 0 10px 0;">New Message on NaDlanka</h2>
						<p style="color: #64748b; margin: 0;">Someone is interested in your product!</p>
					</div>
					
					<div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px;">
						<h3 style="color: #1e293b; margin: 0 0 15px 0;">Product Details</h3>
						<div style="margin-bottom: 10px;">
							<strong>Product:</strong> ${messageData.product.title}
						</div>
						<div style="margin-bottom: 10px;">
							<strong>Price:</strong> ${messageData.product.currency} ${
				messageData.product.price
			}
						</div>
					</div>
					
					<div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px;">
						<h3 style="color: #1e293b; margin: 0 0 15px 0;">Message from Buyer</h3>
						<div style="margin-bottom: 10px;">
							<strong>Name:</strong> ${messageData.senderName}
						</div>
						<div style="margin-bottom: 10px;">
							<strong>Email:</strong> ${messageData.senderEmail}
						</div>
						<div style="margin-bottom: 15px;">
							<strong>Preferred Contact:</strong> ${messageData.preferredContactMethod}
						</div>
						<div style="background: #f1f5f9; padding: 15px; border-radius: 6px;">
							<strong>Message:</strong><br>
							${messageData.message.replace(/\n/g, "<br>")}
						</div>
					</div>
					
					<div style="background: #f0f9ff; padding: 20px; border: 1px solid #bae6fd; border-radius: 8px; margin-bottom: 20px;">
						<h3 style="color: #0369a1; margin: 0 0 10px 0;">Next Steps</h3>
						<p style="margin: 0; color: #0c4a6e;">
							Reply directly to this email to contact the buyer, or log in to your NaDlanka account to view all your messages.
						</p>
					</div>
					
					<div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
						<p style="margin: 0; color: #64748b; font-size: 14px;">
							This message was sent through NaDlanka Marketplace.<br>
							Please reply directly to this email to contact the buyer.
						</p>
					</div>
				</div>
			`,
			text: `
New Message on NaDlanka

Product: ${messageData.product.title}
Price: ${messageData.product.currency} ${messageData.product.price}

From: ${messageData.senderName} (${messageData.senderEmail})
Preferred Contact: ${messageData.preferredContactMethod}

Message:
${messageData.message}

Reply directly to this email to contact the buyer.
			`,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("Message notification email sent:", info.messageId);
		return info;
	} catch (error) {
		console.error("Error sending message notification email:", error);
		throw error;
	}
};

// Send confirmation email to buyer
const sendMessageConfirmationEmail = async (messageData) => {
	try {
		const transporter = createTransporter();

		const mailOptions = {
			from: `"NaDlanka Marketplace" <${
				process.env.EMAIL_FROM || "noreply@nadlanka.com"
			}>`,
			to: messageData.senderEmail,
			subject: `Message sent successfully - ${messageData.product.title}`,
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
						<h2 style="color: #15803d; margin: 0 0 10px 0;">Message Sent Successfully!</h2>
						<p style="color: #166534; margin: 0;">Your message has been delivered to the seller.</p>
					</div>
					
					<div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px;">
						<h3 style="color: #1e293b; margin: 0 0 15px 0;">Product Details</h3>
						<div style="margin-bottom: 10px;">
							<strong>Product:</strong> ${messageData.product.title}
						</div>
						<div style="margin-bottom: 10px;">
							<strong>Price:</strong> ${messageData.product.currency} ${
				messageData.product.price
			}
						</div>
						<div style="margin-bottom: 10px;">
							<strong>Seller:</strong> ${messageData.seller.name}
						</div>
					</div>
					
					<div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
						<h3 style="color: #1e293b; margin: 0 0 10px 0;">Your Message</h3>
						<div style="background: #f1f5f9; padding: 15px; border-radius: 6px;">
							${messageData.message.replace(/\n/g, "<br>")}
						</div>
					</div>
					
					<div style="background: #f0f9ff; padding: 20px; border: 1px solid #bae6fd; border-radius: 8px;">
						<h3 style="color: #0369a1; margin: 0 0 10px 0;">What's Next?</h3>
						<p style="margin: 0; color: #0c4a6e;">
							The seller will receive your message and should reply soon. 
							If you don't hear back within a few days, you can try contacting them directly.
						</p>
					</div>
				</div>
			`,
			text: `
Message Sent Successfully!

Product: ${messageData.product.title}
Price: ${messageData.product.currency} ${messageData.product.price}
Seller: ${messageData.seller.name}

Your Message:
${messageData.message}

The seller will receive your message and should reply soon.
			`,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("Message confirmation email sent:", info.messageId);
		return info;
	} catch (error) {
		console.error("Error sending message confirmation email:", error);
		throw error;
	}
};

module.exports = {
	sendMessageNotificationEmail,
	sendMessageConfirmationEmail,
};
