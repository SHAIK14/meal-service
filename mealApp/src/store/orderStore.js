import { create } from "zustand";
import {
  preparePickupOrder,
  prepareDeliveryOrder,
  getNearbyBranches,
  checkDeliveryAvailability,
  validateVoucher,
  getPaymentMethods,
  processPayment,
  finalizeOrder,
} from "../api/authApi";

const useOrderStore = create((set, get) => ({
  // State - Existing
  deliveryType: null, // 'pickup' or 'delivery'
  selectedAddress: null,
  selectedBranch: null,
  nearbyBranches: [],
  deliveryAvailable: false,
  orderData: null,
  loading: false,
  error: null,

  // State - New for payment
  voucher: null,
  voucherLoading: false,
  voucherError: null,
  cartTotal: 0,
  discountAmount: 0,
  finalTotal: 0,
  paymentMethods: [],
  selectedPaymentMethod: null,
  paymentProcessing: false,
  paymentError: null,
  orderPlaced: false,
  orderId: null,

  // Existing actions
  setDeliveryType: (type) => {
    console.log("setDeliveryType called with:", type);
    set({ deliveryType: type });
  },

  setSelectedAddress: (address) => {
    console.log("setSelectedAddress called with ID:", address?._id);
    set({ selectedAddress: address });
  },

  setSelectedBranch: (branch) => {
    console.log("setSelectedBranch called with ID:", branch?._id);
    set({ selectedBranch: branch });
  },

  resetOrderState: () => {
    console.log("==========================================");
    console.log("resetOrderState CALLED");
    console.log("Current state before reset:", {
      orderPlaced: get().orderPlaced,
      orderId: get().orderId,
      deliveryType: get().deliveryType,
    });
    console.log("==========================================");

    set({
      deliveryType: null,
      selectedAddress: null,
      selectedBranch: null,
      nearbyBranches: [],
      deliveryAvailable: false,
      orderData: null,
      loading: false,
      error: null,
      voucher: null,
      voucherLoading: false,
      voucherError: null,
      cartTotal: 0,
      discountAmount: 0,
      finalTotal: 0,
      paymentMethods: [],
      selectedPaymentMethod: null,
      paymentProcessing: false,
      paymentError: null,
      orderPlaced: false,
      orderId: null,
    });

    console.log("State AFTER reset:", {
      orderPlaced: get().orderPlaced,
      orderId: get().orderId,
      deliveryType: get().deliveryType,
    });
  },

  // Existing methods for branches and delivery
  fetchNearbyBranches: async () => {
    const { selectedAddress } = get();

    if (!selectedAddress || !selectedAddress.coordinates) {
      set({ error: "No address coordinates available" });
      return false;
    }

    try {
      set({ loading: true, error: null });
      const response = await getNearbyBranches({
        latitude: selectedAddress.coordinates.latitude,
        longitude: selectedAddress.coordinates.longitude,
      });

      set({
        nearbyBranches: response.data,
        loading: false,
      });
      return true;
    } catch (error) {
      set({
        error: "Failed to fetch nearby branches",
        loading: false,
      });
      return false;
    }
  },

  checkDeliveryAvailability: async () => {
    const { selectedAddress } = get();

    if (!selectedAddress || !selectedAddress.coordinates) {
      set({ error: "No address coordinates available" });
      return false;
    }

    try {
      set({ loading: true, error: null });
      const response = await checkDeliveryAvailability({
        latitude: selectedAddress.coordinates.latitude,
        longitude: selectedAddress.coordinates.longitude,
      });

      if (response.isDeliveryAvailable) {
        set({
          deliveryAvailable: true,
          selectedBranch: response.branch,
          loading: false,
        });
        return true;
      } else {
        set({
          deliveryAvailable: false,
          error: "Delivery not available for this location",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      set({
        deliveryAvailable: false,
        error: "Failed to check delivery availability",
        loading: false,
      });
      return false;
    }
  },

  preparePickupOrder: async () => {
    console.log("==========================================");
    console.log("preparePickupOrder STARTED");
    const { selectedBranch, selectedAddress } = get();
    console.log("Current state:", {
      branchId: selectedBranch?._id,
      addressId: selectedAddress?._id,
      orderPlaced: get().orderPlaced,
      orderId: get().orderId,
    });
    console.log("==========================================");

    if (!selectedBranch || !selectedAddress) {
      console.log("Missing branch or address");
      set({ error: "Branch and address must be selected" });
      return false;
    }

    try {
      set({ loading: true, error: null });
      console.log("Calling API preparePickupOrder with:", {
        branchId: selectedBranch._id,
        addressId: selectedAddress._id,
      });

      const response = await preparePickupOrder(
        selectedBranch._id,
        selectedAddress._id
      );

      console.log("preparePickupOrder API response:", {
        success: response.success,
        totalAmount: response.data?.totalAmount,
      });

      set({
        orderData: response.data,
        cartTotal: response.data.totalAmount,
        finalTotal: response.data.totalAmount,
        loading: false,
      });

      console.log("State AFTER preparePickupOrder:", {
        cartTotal: get().cartTotal,
        finalTotal: get().finalTotal,
        orderPlaced: get().orderPlaced,
        orderId: get().orderId,
      });

      return true;
    } catch (error) {
      console.error("Error in preparePickupOrder:", error);
      set({
        error: "Failed to prepare pickup order",
        loading: false,
      });
      return false;
    }
  },
  prepareDeliveryOrder: async () => {
    const { selectedAddress } = get();

    if (!selectedAddress) {
      set({ error: "Address must be selected" });
      return false;
    }

    try {
      set({ loading: true, error: null });
      const response = await prepareDeliveryOrder(selectedAddress._id);

      set({
        orderData: response.data,
        cartTotal: response.data.totalAmount,
        finalTotal: response.data.totalAmount,
        loading: false,
      });
      return true;
    } catch (error) {
      set({
        error: "Failed to prepare delivery order",
        loading: false,
      });
      return false;
    }
  },

  // New methods for payment
  validateVoucher: async (promoCode) => {
    try {
      set({ voucherLoading: true, voucherError: null });
      const response = await validateVoucher(promoCode);

      if (response.success) {
        set({
          voucher: response.data,
          discountAmount: response.data.discountAmount,
          finalTotal: response.data.finalTotal,
          voucherLoading: false,
        });
        return true;
      } else {
        set({
          voucherError: response.message || "Invalid voucher",
          voucherLoading: false,
        });
        return false;
      }
    } catch (error) {
      set({
        voucherError:
          error.response?.data?.message || "Failed to validate voucher",
        voucherLoading: false,
      });
      return false;
    }
  },

  clearVoucher: () => {
    const { cartTotal } = get();
    set({
      voucher: null,
      discountAmount: 0,
      finalTotal: cartTotal,
      voucherError: null,
    });
  },

  fetchPaymentMethods: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getPaymentMethods();

      if (response.success) {
        // Filter methods based on delivery type for cash on delivery
        const { deliveryType } = get();
        let methods = response.data;

        if (deliveryType === "pickup") {
          methods = methods.filter((method) => !method.deliveryOnly);
        }

        set({
          paymentMethods: methods,
          loading: false,
        });
        return true;
      } else {
        set({
          error: response.message || "Failed to fetch payment methods",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch payment methods",
        loading: false,
      });
      return false;
    }
  },

  setSelectedPaymentMethod: (method) => {
    set({ selectedPaymentMethod: method });
  },

  processPayment: async () => {
    console.log("==========================================");
    console.log("processPayment STARTED");
    const { selectedPaymentMethod, voucher } = get();
    console.log("Current state:", {
      paymentMethodId: selectedPaymentMethod?.id,
      voucherId: voucher?.voucherId,
      orderPlaced: get().orderPlaced,
      orderId: get().orderId,
    });
    console.log("==========================================");

    if (!selectedPaymentMethod) {
      console.log("No payment method selected");
      set({ paymentError: "Please select a payment method" });
      return false;
    }

    try {
      set({ paymentProcessing: true, paymentError: null });

      console.log("Calling API processPayment with:", {
        paymentMethodId: selectedPaymentMethod.id,
        voucherId: voucher?.voucherId,
      });

      const response = await processPayment(
        selectedPaymentMethod.id,
        voucher ? voucher.voucherId : null
      );

      console.log("processPayment API response:", {
        success: response.success,
      });

      if (response.success) {
        set({
          paymentDetails: response.data.payment,
          paymentProcessing: false,
        });

        console.log("State AFTER successful payment:", {
          paymentDetails: response.data.payment,
          orderPlaced: get().orderPlaced,
          orderId: get().orderId,
        });

        return true;
      } else {
        console.log("Payment API returned error:", response.message);
        set({
          paymentError: response.message || "Payment processing failed",
          paymentProcessing: false,
        });
        return false;
      }
    } catch (error) {
      console.error("Error in processPayment:", error);
      set({
        paymentError:
          error.response?.data?.message || "Payment processing failed",
        paymentProcessing: false,
      });
      return false;
    }
  },

  finalizeOrder: async (notes = "") => {
    console.log("==========================================");
    console.log("finalizeOrder STARTED");
    const {
      deliveryType,
      selectedBranch,
      selectedAddress,
      selectedPaymentMethod,
      voucher,
      paymentDetails,
      orderPlaced,
      orderId,
    } = get();

    console.log("Current state before finalizing:", {
      deliveryType,
      branchId: selectedBranch?._id,
      addressId: selectedAddress?._id,
      paymentMethodId: selectedPaymentMethod?.id,
      voucherId: voucher?.voucherId,
      notes,
      orderPlaced,
      orderId,
    });
    console.log("==========================================");

    if (
      !deliveryType ||
      !selectedBranch ||
      !selectedAddress ||
      !selectedPaymentMethod
    ) {
      console.log("Missing required order information");
      set({ error: "Missing required order information" });
      return false;
    }

    try {
      set({ loading: true, error: null });

      const orderData = {
        deliveryType,
        branchId: selectedBranch._id,
        addressId: selectedAddress._id,
        paymentMethod: selectedPaymentMethod.id,
        voucherId: voucher ? voucher.voucherId : null,
        paymentDetails,
        notes,
      };

      console.log("Calling API finalizeOrder with data:", orderData);

      const response = await finalizeOrder(orderData);
      console.log("finalizeOrder API response:", {
        success: response.success,
        orderId: response.data?.orderId,
      });

      if (response.success) {
        set({
          orderPlaced: true,
          orderId: response.data.orderId,
          loading: false,
        });

        console.log("State AFTER successful order:", {
          orderPlaced: true,
          orderId: response.data.orderId,
        });

        return true;
      } else {
        console.log("Order finalization API returned error:", response.message);
        set({
          error: response.message || "Failed to place order",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      console.error("Error in finalizeOrder:", error);
      set({
        error: error.response?.data?.message || "Failed to place order",
        loading: false,
      });
      return false;
    }
  },
}));

export default useOrderStore;
