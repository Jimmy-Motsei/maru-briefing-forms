const { QuickBooks } = require("node-quickbooks");

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const payload = JSON.parse(event.body);

    // TODO: Verify FNB signature once merchant API is activated
    // For now, just log the payload
    console.log(
      "FNB Payment Webhook received:",
      JSON.stringify(payload, null, 2)
    );

    // Extract payment details (structure will depend on FNB's webhook format)
    const { estimateId, transactionId, amount, status, timestamp } = payload;

    if (status === "success" && estimateId) {
      try {
        // Initialize QuickBooks client
        const qbo = new QuickBooks({
          realmId: process.env.QBO_REALM_ID,
          clientId: process.env.QBO_CLIENT_ID,
          clientSecret: process.env.QBO_CLIENT_SECRET,
          refreshToken: process.env.QBO_REFRESH_TOKEN,
          sandbox: false,
        });

        // Refresh access token
        await qbo.refreshAccessToken();

        // Update estimate memo with payment confirmation
        const estimate = await qbo.getEstimate(estimateId);
        if (estimate.Estimate) {
          const updatedEstimate = {
            ...estimate.Estimate,
            PrivateNote: `${
              estimate.Estimate.PrivateNote || ""
            }\n\nDeposit paid (FNB) – ${transactionId || "TXN-" + Date.now()}`,
          };

          await qbo.updateEstimate(updatedEstimate);
          console.log(
            `Updated estimate ${estimateId} with payment confirmation`
          );
        }

        // TODO: Store payment confirmation in database/cache for frontend polling
        // For now, we'll use a simple in-memory store (not production-ready)
        // In production, use Redis, DynamoDB, or similar
      } catch (qboError) {
        console.error("Error updating QuickBooks estimate:", qboError);
        // Don't fail the webhook - FNB needs a 200 response
      }
    }

    // Always return 200 to FNB to acknowledge receipt
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        received: true,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("FNB Webhook error:", error);

    // Still return 200 to FNB to prevent retries
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        received: true,
        error: "Processing error logged",
      }),
    };
  }
};
