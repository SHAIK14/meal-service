// src/components/SpiceLevelSelector.jsx
import { FaFire } from "react-icons/fa";

const SpiceLevelSelector = ({ value, onChange }) => {
  const spiceLevels = [
    { level: 1, label: "Mild" },
    { level: 2, label: "Spicy" },
    { level: 3, label: "Very Spicy" },
  ];

  return (
    <div className="mt-2">
      <p className="text-sm text-gray-700 mb-1">Spice Level (Optional):</p>
      <div className="flex space-x-2">
        {spiceLevels.map((spice) => (
          <button
            key={spice.level}
            type="button"
            onClick={() => onChange(spice.level)}
            className={`flex items-center px-2 py-1 rounded-md ${
              value === spice.level
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="flex">
              {[...Array(spice.level)].map((_, i) => (
                <FaFire
                  key={i}
                  className={`text-${
                    value === spice.level ? "white" : "red-500"
                  } mr-1`}
                />
              ))}
            </span>
            <span className="text-xs">{spice.label}</span>
          </button>
        ))}
      </div>
      {value > 0 && (
        <button
          onClick={() => onChange(0)}
          className="mt-1 text-xs text-gray-500 hover:text-red-500"
        >
          Clear selection (Default)
        </button>
      )}
    </div>
  );
};

export default SpiceLevelSelector;
