import React, { useState } from "react";

const AddToCartButton = ({ initialQuantity = 0, onQuantityChange }) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleAddClick = () => {
    setQuantity(1); // Initialize quantity to 1
    if (onQuantityChange) onQuantityChange(1);
  };

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    if (onQuantityChange) onQuantityChange(newQuantity);
  };

  const handleDecrease = () => {
    const newQuantity = quantity > 1 ? quantity - 1 : 0;
    setQuantity(newQuantity);
    if (onQuantityChange) onQuantityChange(newQuantity);
  };

  return (
    <div className="mt-2">
      {quantity === 0 ? (
        <button
          className="bg-red-600 px-5 py-1 rounded-full flex justify-center items-center text-sm font-semibold text-white"
          onClick={handleAddClick}
        >
          Add
        </button>
      ) : (
        <div className="flex items-center gap-4 bg-slate-100 rounded-lg overflow-hidden">
          <button
            className="bg-slate-100 px-2 py-0.5 text-black font-semibold"
            onClick={handleDecrease}
          >
            -
          </button>
          <span className="text-black font-semibold">{quantity}</span>
          <button
            className="bg-slate-100 px-2 py-0.5 text-black font-semibold"
            onClick={handleIncrease}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;
