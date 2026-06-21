import { corsHeaders } from "../_shared/cors.ts";

interface InquiryNotification {
  inquiry_id: string;
  trip_id: string;
  trip_title: string;
  traveler_name: string;
  traveler_email: string;
  traveler_mobile?: string;
  host_email: string;
  host_name: string;
  message: string;
  inquiry_date: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const notification: InquiryNotification = await req.json();

    console.log("Sending inquiry notification to host:", notification.host_email);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .inquiry-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #666; }
    .detail-value { color: #333; }
    .message-box { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
    .cta-button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💬 New Trip Inquiry</h1>
      <p>Someone is interested in your adventure!</p>
    </div>

    <div class="content">
      <p>Hi ${notification.host_name},</p>

      <p>You've received a new inquiry about your trip <strong>"${notification.trip_title}"</strong>.</p>

      <div class="inquiry-details">
        <h3 style="margin-top: 0; color: #10b981;">Traveler Information</h3>

        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-value">${notification.traveler_name}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${notification.traveler_email}</span>
        </div>

        ${notification.traveler_mobile ? `
        <div class="detail-row">
          <span class="detail-label">Mobile:</span>
          <span class="detail-value">${notification.traveler_mobile}</span>
        </div>
        ` : ''}

        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">Inquiry Date:</span>
          <span class="detail-value">${new Date(notification.inquiry_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
      </div>

      <div class="message-box">
        <h4 style="margin-top: 0; color: #10b981;">Their Message:</h4>
        <p style="white-space: pre-wrap;">${notification.message}</p>
      </div>

      <div style="text-align: center;">
        <a href="https://traveltag.com/#host-dashboard" class="cta-button">Reply in Dashboard</a>
      </div>

      <p><strong>Quick Response Tips:</strong></p>
      <ul>
        <li>Respond within 24 hours to increase booking chances</li>
        <li>Answer all questions clearly and enthusiastically</li>
        <li>Share additional photos or details about the trip</li>
        <li>Provide availability and next steps</li>
      </ul>

      <p>Thank you for hosting with TravelTag! 🌍</p>

      <div class="footer">
        <p>This is an automated notification from TravelTag.</p>
        <p>Please do not reply to this email. Respond through your dashboard or contact support@traveltag.com</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const emailText = `
New Trip Inquiry

Hi ${notification.host_name},

You've received a new inquiry about your trip "${notification.trip_title}".

Traveler Information:
- Name: ${notification.traveler_name}
- Email: ${notification.traveler_email}
${notification.traveler_mobile ? `- Mobile: ${notification.traveler_mobile}\n` : ''}
- Inquiry Date: ${new Date(notification.inquiry_date).toLocaleString()}

Their Message:
${notification.message}

Reply in Dashboard: https://traveltag.com/#host-dashboard

Tip: Respond within 24 hours to increase your booking chances!

Thank you for hosting with TravelTag!
    `;

    console.log("Inquiry email prepared, sending via mailto (production: integrate with Resend/SendGrid)");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Inquiry notification processed",
        email_preview: {
          to: notification.host_email,
          subject: `New Inquiry for "${notification.trip_title}" from ${notification.traveler_name}`,
          html: emailHtml,
          text: emailText
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing inquiry notification:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
