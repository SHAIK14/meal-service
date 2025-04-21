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
  setDeliveryType: (type) => set({ deliveryType: type }),

  setSelectedAddress: (address) => set({ selectedAddress: address }),

  setSelectedBranch: (branch) => set({ selectedBranch: branch }),

  resetOrderState: () =>
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
    }),

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
    const { selectedBranch, selectedAddress } = get();

    if (!selectedBranch || !selectedAddress) {
      set({ error: "Branch and address must be selected" });
      return false;
    }

    try {
      set({ loading: true, error: null });
      const response = await preparePickupOrder(
        selectedBranch._id,
        selectedAddress._id
      );

      set({
        orderData: response.data,
        cartTotal: response.data.totalAmount,
        finalTotal: response.data.totalAmount,
        loading: false,
      });
      return true;
    } catch (error) {
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
    const { selectedPaymentMethod, voucher } = get();

    if (!selectedPaymentMethod) {
      set({ paymentError: "Please select a payment method" });
      return false;
    }

    try {
      set({ paymentProcessing: true, paymentError: null });
      const response = await processPayment(
        selectedPaymentMethod.id,
        voucher ? voucher.voucherId : null
      );

      if (response.success) {
        set({
          paymentDetails: response.data.payment,
          paymentProcessing: false,
        });
        return true;
      } else {
        set({
          paymentError: response.message || "Payment processing failed",
          paymentProcessing: false,
        });
        return false;
      }
    } catch (error) {
      set({
        paymentError:
          error.response?.data?.message || "Payment processing failed",
        paymentProcessing: false,
      });
      return false;
    }
  },

  finalizeOrder: async (notes = "") => {
    const {
      deliveryType,
      selectedBranch,
      selectedAddress,
      selectedPaymentMethod,
      voucher,
      paymentDetails,
    } = get();

    if (
      !deliveryType ||
      !selectedBranch ||
      !selectedAddress ||
      !selectedPaymentMethod
    ) {
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

      const response = await finalizeOrder(orderData);

      if (response.success) {
        set({
          orderPlaced: true,
          orderId: response.data.orderId,
          loading: false,
        });
        return true;
      } else {
        set({
          error: response.message || "Failed to place order",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to place order",
        loading: false,
      });
      return false;
    }
  },
}));

export default useOrderStore;
