import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

const CheckList = () => {
  // Initialize state with an empty array
  const [tools, setTools] = useState([]);

  // State for team members
  const [serviceLead, setServiceLead] = useState([]);
  const [serviceTeam, setServiceTeam] = useState([]);
  const [kitchenMembers, setKitchenMembers] = useState([]);

  // Modals state
  const [showPartialModal, setShowPartialModal] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [currentTool, setCurrentTool] = useState(null);
  const [partialQty, setPartialQty] = useState("");
  const [remark, setRemark] = useState("");

  // Fetch data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("checklistData");

    if (savedData) {
      const parsedData = JSON.parse(savedData);

      // Set team members from localStorage
      setServiceLead(parsedData.serviceLead || []);
      setServiceTeam(parsedData.serviceTeam || []);
      setKitchenMembers(parsedData.kitchenMembers || []);

      // Set tools from localStorage
      if (parsedData.tools && parsedData.tools.length > 0) {
        setTools(parsedData.tools);
      } else {
        // Fallback to default data if no tools were saved
        setTools([
          {
            id: 1,
            name: "Plates",
            assetLink: "assets/plates",
            qty: 50,
            status: "Pending",
            receivedQty: 0,
            remark: "",
          },
          {
            id: 2,
            name: "Cups",
            assetLink: "assets/cups",
            qty: 100,
            status: "Pending",
            receivedQty: 0,
            remark: "",
          },
          {
            id: 3,
            name: "Forks",
            assetLink: "assets/forks",
            qty: 75,
            status: "Pending",
            receivedQty: 0,
            remark: "",
          },
          {
            id: 4,
            name: "Knives",
            assetLink: "assets/knives",
            qty: 75,
            status: "Pending",
            receivedQty: 0,
            remark: "",
          },
          {
            id: 5,
            name: "Spoons",
            assetLink: "assets/spoons",
            qty: 75,
            status: "Pending",
            receivedQty: 0,
            remark: "",
          },
        ]);
      }
    }
  }, []);

  const handleCollected = (id) => {
    setTools(
      tools.map((tool) =>
        tool.id === id
          ? {
              ...tool,
              status: "Collected",
              receivedQty: tool.qty,
              remark: "All items received",
            }
          : tool
      )
    );
  };

  const handlePartialClick = (tool) => {
    setCurrentTool(tool);
    setPartialQty("");
    setRemark("");
    setShowPartialModal(true);
  };

  const handleMissingClick = (tool) => {
    setCurrentTool(tool);
    setRemark("");
    setShowMissingModal(true);
  };

  const handlePartialSubmit = () => {
    if (!partialQty || parseInt(partialQty) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    setTools(
      tools.map((tool) =>
        tool.id === currentTool.id
          ? {
              ...tool,
              status: "Partially Collected",
              receivedQty: parseInt(partialQty),
              remark,
            }
          : tool
      )
    );
    setShowPartialModal(false);
  };

  const handleMissingSubmit = () => {
    if (!remark) {
      alert("Please enter a remark");
      return;
    }

    setTools(
      tools.map((tool) =>
        tool.id === currentTool.id
          ? { ...tool, status: "Missing", receivedQty: 0, remark }
          : tool
      )
    );
    setShowMissingModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Collected":
        return "text-green-600";
      case "Partially Collected":
        return "text-orange-500";
      case "Missing":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Tools Checklist</h1>

      {/* Display assigned team members */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {serviceLead.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Service Lead
            </h3>
            <div className="flex flex-wrap gap-2">
              {serviceLead.map((lead, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {lead}
                </span>
              ))}
            </div>
          </div>
        )}

        {serviceTeam.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Service Team
            </h3>
            <div className="flex flex-wrap gap-2">
              {serviceTeam.map((member, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {member}
                </span>
              ))}
            </div>
          </div>
        )}

        {kitchenMembers.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Kitchen Team
            </h3>
            <div className="flex flex-wrap gap-2">
              {kitchenMembers.map((member, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                >
                  {member}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tools
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Link to Assets
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tools.map((tool) => (
              <tr key={tool.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tool.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {tool.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 hover:underline">
                  {tool.assetLink ? (
                    <a
                      href={tool.assetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Asset
                    </a>
                  ) : (
                    "No Asset"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tool.status !== "Pending" ? (
                    <div>
                      <span>
                        {tool.receivedQty}/{tool.qty}
                      </span>
                      {tool.status === "Partially Collected" && (
                        <span className="ml-2 text-xs text-orange-500">
                          ({Math.round((tool.receivedQty / tool.qty) * 100)}%)
                        </span>
                      )}
                    </div>
                  ) : (
                    tool.qty
                  )}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStatusColor(
                    tool.status
                  )}`}
                >
                  {tool.status}
                  {tool.remark && (
                    <div className="text-xs text-gray-500 mt-1">
                      Note: {tool.remark}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {tool.status === "Pending" ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCollected(tool.id)}
                        className="bg-green-50 text-green-700 px-3 py-1 rounded-full hover:bg-green-100 flex items-center"
                      >
                        <CheckCircle size={16} className="mr-1" /> Collected
                      </button>
                      <button
                        onClick={() => handlePartialClick(tool)}
                        className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full hover:bg-orange-100 flex items-center"
                      >
                        <AlertCircle size={16} className="mr-1" /> Partial
                      </button>
                      <button
                        onClick={() => handleMissingClick(tool)}
                        className="bg-red-50 text-red-700 px-3 py-1 rounded-full hover:bg-red-100 flex items-center"
                      >
                        <XCircle size={16} className="mr-1" /> Missing
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">Status updated</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Partial Collection Modal */}
      {showPartialModal && currentTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              Partial Collection: {currentTool.name}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Received Quantity (Max: {currentTool.qty})
              </label>
              <input
                type="number"
                min="1"
                max={currentTool.qty}
                value={partialQty}
                onChange={(e) => setPartialQty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity received"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remark for Remaining Items
              </label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a note about the remaining items"
                rows="3"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPartialModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePartialSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Missing Item Modal */}
      {showMissingModal && currentTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              Missing Item: {currentTool.name}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason / Remark
              </label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Explain why the item is missing"
                rows="3"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowMissingModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleMissingSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckList;
