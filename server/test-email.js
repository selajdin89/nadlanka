const nodemailer = require("nodemailer");
require("dotenv").config();

// Test email configuration
const testEmail = async () => {
	console.log("🧪 Testing Email Configuration...\n");

	// Check if email credentials are set
	if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
		console.error("❌ Email credentials not found in .env file");
		console.log("Please add EMAIL_USER and EMAIL_PASS to your .env file");
		return;
	}

	console.log("📧 Email User:", process.env.EMAIL_USER);
	console.log("🔑 Email Password:", process.env.EMAIL_PASS ? "***" : "NOT SET");
	console.log("📮 Email From:", process.env.EMAIL_FROM || "NOT SET");
	console.log("");

	// Create transporter
	const isGmail = process.env.EMAIL_USER?.includes("@gmail.com");

	let transporter;
	if (isGmail) {
		console.log("🔍 Detected Gmail account, using Gmail SMTP...");
		transporter = nodemailer.createTransporter({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});
	} else if (process.env.EMAIL_HOST) {
		console.log("🔍 Using custom SMTP configuration...");
		transporter = nodemailer.createTransporter({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT || 587,
			secure: process.env.EMAIL_SECURE === "true",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});
	} else {
		console.log("🔍 Using default SMTP configuration...");
		transporter = nodemailer.createTransporter({
			host: process.env.EMAIL_HOST || "smtp.gmail.com",
			port: process.env.EMAIL_PORT || 587,
			secure: false,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});
	}

	try {
		// Test connection
		console.log("🔌 Testing connection...");
		await transporter.verify();
		console.log("✅ Connection successful!\n");

		// Send test email
		console.log("📤 Sending test email...");
		const testEmailAddress = process.env.EMAIL_USER; // Send to yourself

		const info = await transporter.sendMail({
			from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
			to: testEmailAddress,
			subject: "🧪 NaDlanka Email Test",
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
						<h2 style="color: #15803d; margin: 0;">✅ Email Test Successful!</h2>
						<p style="color: #166534; margin: 10px 0 0 0;">Your email configuration is working correctly.</p>
					</div>
					
					<div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
						<h3 style="color: #1e293b; margin: 0 0 15px 0;">Configuration Details:</h3>
						<ul style="color: #374151; line-height: 1.6;">
							<li><strong>Email User:</strong> ${process.env.EMAIL_USER}</li>
							<li><strong>Email From:</strong> ${
								process.env.EMAIL_FROM || process.env.EMAIL_USER
							}</li>
							<li><strong>Service:</strong> ${isGmail ? "Gmail SMTP" : "Custom SMTP"}</li>
							<li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
						</ul>
					</div>
					
					<div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; margin-top: 20px;">
						<p style="margin: 0; color: #64748b; font-size: 14px;">
							This is a test email from NaDlanka Marketplace.<br>
							If you received this, your email setup is working! 🎉
						</p>
					</div>
				</div>
			`,
			text: `
Email Test Successful!

Your email configuration is working correctly.

Configuration Details:
- Email User: ${process.env.EMAIL_USER}
- Email From: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}
- Service: ${isGmail ? "Gmail SMTP" : "Custom SMTP"}
- Test Time: ${new Date().toLocaleString()}

This is a test email from NaDlanka Marketplace.
If you received this, your email setup is working! 🎉
			`,
		});

		console.log("✅ Test email sent successfully!");
		console.log("📧 Message ID:", info.messageId);
		console.log("📮 Check your inbox at:", testEmailAddress);
		console.log("\n🎉 Email configuration is working perfectly!");
	} catch (error) {
		console.error("❌ Email test failed:");
		console.error(error.message);

		if (error.message.includes("Invalid login")) {
			console.log("\n💡 Troubleshooting tips:");
			console.log(
				"- For Gmail: Make sure you're using an App Password, not your regular password"
			);
			console.log(
				"- Check that 2-Step Verification is enabled on your Gmail account"
			);
			console.log("- Verify your email credentials in the .env file");
		} else if (error.message.includes("Connection timeout")) {
			console.log("\n💡 Troubleshooting tips:");
			console.log("- Check your internet connection");
			console.log("- Verify the SMTP host and port settings");
			console.log("- Make sure your firewall isn't blocking the connection");
		}
	}
};

// Run the test
testEmail();
