exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { ref } = event.queryStringParameters || {};

    if (!ref) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Missing reference parameter",
        }),
      };
    }

    // TODO: Check payment status from database/cache
    // For now, return a simple response
    // In production, query your payment status store

    // This is a placeholder implementation
    // Replace with actual payment status lookup
    const paymentStatus = {
      paid: false,
      transactionId: null,
      timestamp: null,
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        ok: true,
        estimateId: ref,
        ...paymentStatus,
      }),
    };
  } catch (error) {
    console.error("Payment status check error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        ok: false,
        error: "Failed to check payment status",
      }),
    };
  }
};
