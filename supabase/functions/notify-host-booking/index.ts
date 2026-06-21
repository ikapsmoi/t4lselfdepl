import { corsHeaders } from "../_shared/cors.ts";

interface BookingNotification {
  booking_id: string;
  trip_id: string;
  trip_title: string;
  traveler_name: string;
  traveler_email: string;
  host_email: string;
  host_name: string;
  travelers_count: number;
  total_amount: number;
  deposit_amount: number;
  currency: string;
  booking_date: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const notification: BookingNotification = await req.json();

    console.log("Sending booking notification to host:", notification.host_email);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #666; }
    .detail-value { color: #333; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
    .highlight { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 New Booking Received!</h1>
      <p>You have a new traveler for your adventure</p>
    </div>

    <div class="content">
      <p>Hi ${notification.host_name},</p>

      <p>Great news! You've received a new booking for your trip <strong>"${notification.trip_title}"</strong>.</p>

      <div class="booking-details">
        <h3 style="margin-top: 0; color: #667eea;">Booking Details</h3>

        <div class="detail-row">
          <span class="detail-label">Booking Reference:</span>
          <span class="detail-value">${notification.booking_id.slice(0, 8).toUpperCase()}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Traveler Name:</span>
          <span class="detail-value">${notification.traveler_name}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Traveler Email:</span>
          <span class="detail-value">${notification.traveler_email}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Number of Travelers:</span>
          <span class="detail-value">${notification.travelers_count}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Total Amount:</span>
          <span class="detail-value">${notification.currency === 'INR' ? '₹' : '$'}${notification.total_amount.toLocaleString()}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Deposit Received:</span>
          <span class="detail-value">${notification.currency === 'INR' ? '₹' : '$'}${notification.deposit_amount.toLocaleString()}</span>
        </div>

        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">Booking Date:</span>
          <span class="detail-value">${new Date(notification.booking_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
      </div>

      <div class="highlight">
        <strong>⚠️ Important:</strong> Please check your Travel4life dashboard for the payment reference number provided by the traveler. Verify the payment before confirming the booking.
      </div>

      <div style="text-align: center;">
        <a href="https://traveltag.com/#host-dashboard" class="cta-button">View in Dashboard</a>
      </div>

      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Review the booking details in your dashboard</li>
        <li>Verify the payment reference number</li>
        <li>Confirm the booking with the traveler</li>
        <li>Send any pre-trip information or requirements</li>
      </ul>

      <p>Thank you for hosting with TravelTag! 🌍</p>

      <div class="footer">
        <p>This is an automated notification from TravelTag.</p>
        <p>Please do not reply to this email. For support, contact support@traveltag.com</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const emailText = `
New Booking Received!

Hi ${notification.host_name},

You've received a new booking for your trip "${notification.trip_title}".

Booking Details:
- Booking Reference: ${notification.booking_id.slice(0, 8).toUpperCase()}
- Traveler: ${notification.traveler_name} (${notification.traveler_email})
- Number of Travelers: ${notification.travelers_count}
- Total Amount: ${notification.currency === 'INR' ? '₹' : '$'}${notification.total_amount.toLocaleString()}
- Deposit: ${notification.currency === 'INR' ? '₹' : '$'}${notification.deposit_amount.toLocaleString()}
- Booking Date: ${new Date(notification.booking_date).toLocaleString()}

Please verify the payment reference number in your dashboard before confirming.

View in Dashboard: https://traveltag.com/#host-dashboard

Thank you for hosting with TravelTag!
    `;

    console.log("Email prepared, sending via mailto (production: integrate with Resend/SendGrid)");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification processed",
        email_preview: {
          to: notification.host_email,
          subject: `New Booking for "${notification.trip_title}" - ${notification.booking_id.slice(0, 8).toUpperCase()}`,
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
    console.error("Error processing notification:", error);
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
