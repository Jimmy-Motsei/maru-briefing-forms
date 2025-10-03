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
    const { customer, ticket, estimate, payment } = payload;

    // Initialize QuickBooks client
    const qbo = new QuickBooks({
      realmId: process.env.QBO_REALM_ID,
      clientId: process.env.QBO_CLIENT_ID,
      clientSecret: process.env.QBO_CLIENT_SECRET,
      refreshToken: process.env.QBO_REFRESH_TOKEN,
      sandbox: false, // Set to true for sandbox testing
    });

    // Refresh access token
    await qbo.refreshAccessToken();

    // Upsert customer
    let customerId;
    try {
      const existingCustomers = await qbo.findCustomers({
        Query: `Email = '${customer.email}'`,
      });

      if (
        existingCustomers.QueryResponse.Customer &&
        existingCustomers.QueryResponse.Customer.length > 0
      ) {
        customerId = existingCustomers.QueryResponse.Customer[0].Id;
      } else {
        const newCustomer = await qbo.createCustomer({
          Name: customer.company || customer.name,
          GivenName: customer.name,
          FamilyName: customer.name.split(" ").slice(1).join(" ") || "",
          PrimaryEmailAddr: { Address: customer.email },
          PrimaryPhone: customer.phone
            ? { FreeFormNumber: customer.phone }
            : undefined,
        });
        customerId = newCustomer.Customer.Id;
      }
    } catch (error) {
      console.error("Error creating/finding customer:", error);
      throw new Error("Failed to process customer information");
    }

    // Create estimate
    const estimateData = {
      CustomerRef: { value: customerId },
      TxnDate: new Date().toISOString().split("T")[0],
      DueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 7 days from now
      Line: [
        {
          DetailType: "SalesItemLineDetail",
          Amount: estimate.subtotal,
          SalesItemLineDetail: {
            ItemRef: { value: process.env.QBO_ITEM_SERVICE_ID },
            Qty: estimate.hours,
            UnitPrice: estimate.rate,
          },
          Description: `Support Ticket: ${ticket.subject} (${ticket.priority} priority, ${ticket.asset_type})`,
        },
      ],
      DocNumber: `EST-${Date.now()}`,
      PrivateNote: `Support ticket estimate. Priority: ${
        ticket.priority
      }, Asset: ${ticket.asset_type}, Environment: ${
        ticket.environment || "N/A"
      }, URL: ${ticket.url || "N/A"}`,
    };

    // Add deposit line if required
    if (estimate.deposit > 0) {
      estimateData.Line.push({
        DetailType: "SalesItemLineDetail",
        Amount: estimate.deposit,
        SalesItemLineDetail: {
          ItemRef: { value: process.env.QBO_ITEM_SERVICE_ID },
          Qty: 1,
          UnitPrice: estimate.deposit,
        },
        Description: "Support ticket deposit (first hour)",
      });
    }

    const createdEstimate = await qbo.createEstimate(estimateData);
    const estimateId = createdEstimate.Estimate.Id;

    // Generate payment URL
    let paymentUrl = "";
    if (!estimate.has_sla && estimate.deposit > 0) {
      // Temporary FNB payment URL placeholder
      // Replace with actual FNB merchant API integration once activated
      const siteUrl = process.env.SITE_URL || "https://maruonline.com";
      paymentUrl = `${siteUrl}/pay/fnb.html?amount=${estimate.deposit}&ref=${estimateId}`;
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({
        ok: true,
        estimateId: estimateId,
        paymentUrl: paymentUrl,
      }),
    };
  } catch (error) {
    console.error("Error creating estimate:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({
        ok: false,
        error: error.message || "Failed to create estimate",
      }),
    };
  }
};
