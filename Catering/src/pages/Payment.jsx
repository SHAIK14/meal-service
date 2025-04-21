import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/BG/bg.png";
import OutDoorHeader from "../components/OutDoorHeader";
import { CreditCard, DollarSign, Check } from "lucide-react";

const Payment = () => {
  const navigate = useNavigate();
  const [paymentOption, setPaymentOption] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [cateringTermsAgreed, setCateringTermsAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get confirmed order from localStorage
  const confirmedOrder =
    JSON.parse(localStorage.getItem("confirmedOrder")) || {};
  const totalPrice = confirmedOrder.totalPrice || 0;
  const partialPayment = Math.round(totalPrice * 0.75);

  const handlePaymentOptionChange = (option) => {
    setPaymentOption(option);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!paymentOption) {
      alert("Please select a payment option (75% or Full Payment)");
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    if (!termsAgreed || !cateringTermsAgreed) {
      alert("Please agree to all terms and conditions");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      // Save payment info to localStorage
      localStorage.setItem(
        "paymentInfo",
        JSON.stringify({
          paymentOption,
          paymentMethod,
          amount: paymentOption === "partial" ? partialPayment : totalPrice,
          date: new Date().toISOString(),
        })
      );

      // Navigate to a thank you or receipt page
      navigate("/outdoorCatering/thankyou");
    }, 2000);
  };

  return (
    <section className="min-h-screen relative py-12 px-4">
      {/* Black base layer */}
      <div className="absolute inset-0 bg-black z-10"></div>

      {/* Background Image with opacity */}
      <div
        className="absolute inset-0 bg-cover bg-center z-20 opacity-60"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Content container with higher z-index */}
      <div className="relative z-30 max-w-2xl mx-auto">
        <div className="text-white mb-8">
          <OutDoorHeader />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center text-white">
          Payment
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Select your preferred payment option and method
        </p>

        {/* Payment Form */}
        <div className="bg-gray-900/90 rounded-xl p-4 md:p-6 mb-6 border border-gray-800">
          <form onSubmit={handleSubmit}>
            {/* Payment Options */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#c4a75f] mb-4">
                Select Payment Option
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`py-4 px-4 border rounded-lg flex items-center justify-center transition-all ${
                    paymentOption === "partial"
                      ? "bg-[#c4a75f]/20 border-[#c4a75f] text-[#c4a75f]"
                      : "bg-gray-800/80 border-gray-700 text-white hover:bg-gray-800"
                  }`}
                  onClick={() => handlePaymentOptionChange("partial")}
                >
                  <span className="font-medium">75% Payment</span>
                  <span className="ml-2 text-sm">({partialPayment} SAR)</span>
                </button>

                <button
                  type="button"
                  className={`py-4 px-4 border rounded-lg flex items-center justify-center transition-all ${
                    paymentOption === "full"
                      ? "bg-[#c4a75f]/20 border-[#c4a75f] text-[#c4a75f]"
                      : "bg-gray-800/80 border-gray-700 text-white hover:bg-gray-800"
                  }`}
                  onClick={() => handlePaymentOptionChange("full")}
                >
                  <span className="font-medium">Full Payment</span>
                  <span className="ml-2 text-sm">({totalPrice} SAR)</span>
                </button>
              </div>

              {/* Terms Agreement Checkbox */}
              <div className="mt-4 flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1"
                  checked={termsAgreed}
                  onChange={() => setTermsAgreed(!termsAgreed)}
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                  I agree to the payment terms and conditions
                </label>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#c4a75f] mb-4">
                Select Payment Method
              </h3>
              <div className="space-y-3">
                <button
                  type="button"
                  className={`w-full py-4 px-4 border rounded-lg flex items-center transition-all ${
                    paymentMethod === "card"
                      ? "bg-[#c4a75f]/20 border-[#c4a75f] text-[#c4a75f]"
                      : "bg-gray-800/80 border-gray-700 text-white hover:bg-gray-800"
                  }`}
                  onClick={() => handlePaymentMethodChange("card")}
                >
                  <CreditCard className="mr-3" size={20} />
                  <span className="font-medium">Credit or Debit Card</span>
                </button>

                <button
                  type="button"
                  className={`w-full py-4 px-4 border rounded-lg flex items-center transition-all ${
                    paymentMethod === "apple"
                      ? "bg-[#c4a75f]/20 border-[#c4a75f] text-[#c4a75f]"
                      : "bg-gray-800/80 border-gray-700 text-white hover:bg-gray-800"
                  }`}
                  onClick={() => handlePaymentMethodChange("apple")}
                >
                  <svg
                    className="mr-3"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.0446 12.8184C17.0258 9.95014 19.3605 8.72375 19.4561 8.66591C18.1639 6.77402 16.144 6.53332 15.4294 6.51508C13.7368 6.34069 12.1119 7.50402 11.2525 7.50402C10.3743 7.50402 9.06709 6.53514 7.64129 6.56402C5.80382 6.59289 4.09252 7.64864 3.16443 9.26647C1.2466 12.5603 2.67241 17.5188 4.5149 20.3516C5.43735 21.738 6.52241 23.2879 7.97295 23.2334C9.38252 23.1734 9.89802 22.342 11.6083 22.342C13.2997 22.342 13.7857 23.2334 15.2602 23.1988C16.7786 23.1734 17.7156 21.8062 18.6 20.4062C19.6655 18.7628 20.0911 17.1484 20.1099 17.0743C20.0723 17.0607 17.0671 15.9153 17.0446 12.8184Z" />
                    <path d="M14.3989 4.27998C15.1372 3.35753 15.6372 2.08887 15.4918 0.800049C14.4125 0.842216 13.0777 1.52123 12.3072 2.42216C11.6219 3.22308 11.0122 4.53504 11.1764 5.78232C12.3935 5.86823 13.6337 5.1863 14.3989 4.27998Z" />
                  </svg>
                  <span className="font-medium">Apple Pay</span>
                </button>

                <button
                  type="button"
                  className={`w-full py-4 px-4 border rounded-lg flex items-center transition-all ${
                    paymentMethod === "cash"
                      ? "bg-[#c4a75f]/20 border-[#c4a75f] text-[#c4a75f]"
                      : "bg-gray-800/80 border-gray-700 text-white hover:bg-gray-800"
                  }`}
                  onClick={() => handlePaymentMethodChange("cash")}
                >
                  <DollarSign className="mr-3" size={20} />
                  <span className="font-medium">Cash</span>
                </button>
              </div>
            </div>

            {/* Catering Terms Checkbox */}
            <div className="mb-6 flex items-start">
              <input
                type="checkbox"
                id="cateringTerms"
                className="mt-1"
                checked={cateringTermsAgreed}
                onChange={() => setCateringTermsAgreed(!cateringTermsAgreed)}
              />
              <label
                htmlFor="cateringTerms"
                className="ml-2 text-sm text-gray-300"
              >
                I agree to the catering terms and conditions including
                cancellation policy and service guidelines
              </label>
            </div>

            {/* Price summary */}
            <div className="bg-gray-800/80 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Payment Option</span>
                <span className="text-white">
                  {paymentOption === "partial"
                    ? "75% Partial Payment"
                    : paymentOption === "full"
                    ? "Full Payment"
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-300">Payment Method</span>
                <span className="text-white">
                  {paymentMethod === "card"
                    ? "Credit/Debit Card"
                    : paymentMethod === "apple"
                    ? "Apple Pay"
                    : paymentMethod === "cash"
                    ? "Cash"
                    : "-"}
                </span>
              </div>
              <div className="border-t border-gray-700 pt-4 flex justify-between">
                <span className="text-lg font-bold text-[#c4a75f]">
                  Amount Due
                </span>
                <span className="text-lg font-bold text-white">
                  {paymentOption === "partial"
                    ? partialPayment
                    : paymentOption === "full"
                    ? totalPrice
                    : 0}{" "}
                  SAR
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-transparent hover:bg-gray-800 cursor-pointer text-white font-medium py-3 px-6 border border-gray-600 rounded-full transition-all"
              >
                Back to Review
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="bg-[#c4a75f] hover:bg-[#c0913b] text-black font-bold py-3 px-8 rounded-full transition-all flex items-center justify-center"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <span>Confirm & Pay</span>
                    <Check size={18} className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Payment;
