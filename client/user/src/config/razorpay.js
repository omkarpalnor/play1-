import toast from "react-hot-toast";
import axiosInstance from "../hooks/useAxiosInstance";

export const createOrder = async ({ turfId, startTime, endTime, couponCode }) => {
  try {
    const response = await axiosInstance.post("/api/user/booking/create-order", {
      turfId,
      startTime,
      endTime,
      couponCode: couponCode || undefined,
    });
    return response.data;
  } catch (error) {
    console.error("Error during createOrder:", error);

    // Log response if available
    if (error.response) {
      console.error("Error Response Data:", error.response.data);
    }

    // Log request if no response
    if (error.request) {
      console.error("Error Request:", error.request);
    }

    throw error;
  }
};

export const releaseSlotHold = async (holdToken) => {
  if (!holdToken) {
    return;
  }

  await axiosInstance.post("/api/user/booking/release-hold", {
    holdToken,
  });
};


// export const createOrder = async (totalPrice) => {
//   console.log("Hello Frontend");

//   const response = await axiosInstance.post("/api/user/booking/create-order", {
//     totalPrice,
//   });
//   console.log("Here");

//   return response.data;
// };

export const handlePayment = async (order, user, { onDismiss, onPaymentFailed } = {}) => {
  console.log("Handle");

  return new Promise((resolve, reject) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id, // Make sure this is included
      name: "PlayRizon",
      description: "Book a spot for your next adventure",

      handler: function (response) {
        if (response.error) {
          toast.error(response.error.message);
          reject(response.error);
        } else {
          resolve(response);
        }
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: "",
      },
      modal: {
        ondismiss: async () => {
          try {
            if (onDismiss) {
              await onDismiss();
            }
          } finally {
            reject(new Error("Payment cancelled"));
          }
        },
      },

    };
    const rzp1 = new window.Razorpay(options);
    rzp1.on("payment.failed", async (response) => {
      try {
        if (onPaymentFailed) {
          await onPaymentFailed(response);
        }
      } finally {
        reject(response?.error || new Error("Payment failed"));
      }
    });
    rzp1.open();
  });
};
