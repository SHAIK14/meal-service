// src/components/dining/OrdersDisplay.jsx
import React from "react";
import { FaCheck, FaArrowRight, FaPrint } from "react-icons/fa";

function OrdersDisplay({
  tableSession,
  selectedTable,
  onClose,
  handleOrderStatusChange,
  handleItemAction,
  handleGenerateInvoice,
  formatTimestamp,
  getEffectiveQuantity,
  hasActiveItems,
}) {
  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "New Order";
      case "admin_approved":
        return "Approved";
      case "in_preparation":
        return "Preparing";
      case "ready_for_pickup":
        return "Ready for Pickup";
      case "served":
        return "Served";
      case "canceled":
        return "Canceled";
      default:
        return status;
    }
  };

  const getNextAction = (order) => {
    // First check if the order has any active items
    if (!order || !hasActiveItems(order) || order.status === "canceled") {
      return null; // Don't show any action buttons for empty or canceled orders
    }

    // Original switch case for different statuses
    switch (order.status) {
      case "pending":
        return {
          label: "Approve",
          action: "admin_approved",
          icon: <FaCheck />,
          color: "green",
        };
      case "admin_approved":
        // This is used in kitchen dashboard, not here
        return null;
      case "in_preparation":
        // This is used in kitchen dashboard, not here
        return null;
      case "ready_for_pickup":
        return {
          label: "Serve to Customer",
          action: "served",
          icon: <FaArrowRight />,
          color: "blue",
        };
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {selectedTable.name}
              </h2>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-medium">
                  Session Total:{" "}
                  {tableSession?.session?.totalAmount?.toFixed(2) || "0.00"} SAR
                </span>
              </div>
            </div>
            <button
              className="bg-gray-100 cursor-pointer hover:bg-gray-200 rounded-full p-2 text-gray-500 transition-all duration-200"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Orders List Container with Subtle Scrollbar */}
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {tableSession.orders && tableSession.orders.length > 0 ? (
            tableSession.orders.map((order) => (
              <div
                key={order._id}
                className="mb-4 border-b border-gray-100 last:border-b-0"
              >
                {/* Order Header */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">
                        {order.orderNumber || `#${order._id.slice(-4)}`}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-md 
                          ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : ""
                          }
                          ${
                            order.status === "admin_approved"
                              ? "bg-blue-100 text-blue-800"
                              : ""
                          }
                          ${
                            order.status === "in_preparation"
                              ? "bg-orange-100 text-orange-800"
                              : ""
                          }
                          ${
                            order.status === "ready_for_pickup"
                              ? "bg-purple-100 text-purple-800"
                              : ""
                          }
                          ${
                            order.status === "served"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                          ${
                            order.status === "canceled"
                              ? "bg-red-100 text-red-800"
                              : ""
                          }
                        `}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {formatTimestamp(order.createdAt)}
                    </div>
                  </div>

                  {/* Order Status Timeline */}
                  {(order.statusTimestamps?.admin_approved ||
                    order.statusTimestamps?.in_preparation ||
                    order.statusTimestamps?.ready_for_pickup ||
                    order.statusTimestamps?.served) && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 overflow-x-auto pb-1">
                      <div className="flex items-center whitespace-nowrap">
                        {order.statusTimestamps?.admin_approved && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Approved:{" "}
                            {formatTimestamp(
                              order.statusTimestamps.admin_approved
                            )}
                          </span>
                        )}
                      </div>
                      {order.statusTimestamps?.in_preparation && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-md whitespace-nowrap">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          Prep:{" "}
                          {formatTimestamp(
                            order.statusTimestamps.in_preparation
                          )}
                        </span>
                      )}
                      {order.statusTimestamps?.ready_for_pickup && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md whitespace-nowrap">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          Ready:{" "}
                          {formatTimestamp(
                            order.statusTimestamps.ready_for_pickup
                          )}
                        </span>
                      )}
                      {order.statusTimestamps?.served && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md whitespace-nowrap">
                          <span className="w-2 h-2 bg-green-500  rounded-full"></span>
                          Served:{" "}
                          {formatTimestamp(order.statusTimestamps.served)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Next Action Button */}
                  {getNextAction(order) && (
                    <button
                      className={`w-full mt-2 px-4 py-2 cursor-pointer rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all
                        ${
                          getNextAction(order).color === "green"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : ""
                        }
                        ${
                          getNextAction(order).color === "blue"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : ""
                        }
                        ${
                          getNextAction(order).color === "orange"
                            ? "bg-orange-600 hover:bg-orange-700 text-white"
                            : ""
                        }
                        ${
                          getNextAction(order).color === "purple"
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : ""
                        }
                        ${
                          getNextAction(order).color === "red"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : ""
                        }
                      `}
                      onClick={() =>
                        handleOrderStatusChange(
                          order._id,
                          getNextAction(order).action
                        )
                      }
                    >
                      {getNextAction(order).icon}
                      {getNextAction(order).label}
                    </button>
                  )}
                </div>

                {/* Order Items */}
                <div className="px-4 pb-4">
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600">
                          <th className="px-4 py-2 text-left font-medium">
                            Item
                          </th>
                          <th className="px-4 py-2 text-center font-medium">
                            Qty
                          </th>
                          <th className="px-4 py-2 text-right font-medium">
                            Price
                          </th>
                          <th className="px-4 py-2 text-right font-medium">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items
                          .filter((item) => {
                            const effectiveQuantity =
                              getEffectiveQuantity(item);
                            return effectiveQuantity > 0;
                          })
                          .map((item, idx) => {
                            const effectiveQuantity =
                              getEffectiveQuantity(item);
                            const isReturned = (item.returnedQuantity || 0) > 0;
                            const isCancelled =
                              (item.cancelledQuantity || 0) > 0;

                            return (
                              <tr
                                key={idx}
                                className={`border-b border-gray-200 last:border-b-0 ${
                                  isReturned || isCancelled ? "bg-gray-50" : ""
                                }`}
                              >
                                <td className="px-4 py-3 text-gray-800 font-medium">
                                  {item.name}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex flex-col items-center">
                                    <span className="font-medium">
                                      {effectiveQuantity}
                                    </span>
                                    {isReturned && (
                                      <span className="text-xs text-red-600">
                                        (-{item.returnedQuantity} returned)
                                      </span>
                                    )}
                                    {isCancelled && (
                                      <span className="text-xs text-red-600">
                                        (-{item.cancelledQuantity} cancelled)
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div>
                                    <div className="font-medium">
                                      {(
                                        effectiveQuantity *
                                          (item?.price || 0) || 0
                                      ).toFixed(2)}{" "}
                                      SAR
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {item.price} SAR each
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {effectiveQuantity > 0 &&
                                    order.status !== "canceled" && (
                                      <button
                                        className={`cursor-pointer px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 
                                          ${
                                            order.status === "served"
                                              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                              : "bg-red-100 text-red-700 hover:bg-red-200"
                                          }`}
                                        onClick={() =>
                                          handleItemAction(order, idx, item)
                                        }
                                      >
                                        {order.status === "served" ? (
                                          <>
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-3 w-3"
                                              viewBox="0 0 20 20"
                                              fill="currentColor"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                            Return
                                          </>
                                        ) : (
                                          <>
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-3 w-3"
                                              viewBox="0 0 20 20"
                                              fill="currentColor"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                            Cancel
                                          </>
                                        )}
                                      </button>
                                    )}
                                </td>
                              </tr>
                            );
                          })}

                        {!hasActiveItems(order) &&
                          order.status !== "canceled" && (
                            <tr>
                              <td
                                colSpan="4"
                                className="px-4 py-4 text-center text-gray-500 italic"
                              >
                                No active items in this order. It will be
                                automatically canceled.
                              </td>
                            </tr>
                          )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-100">
                          <td
                            colSpan="2"
                            className="px-4 py-3 text-right font-bold text-gray-700"
                          >
                            Order Total:
                          </td>
                          <td
                            colSpan="2"
                            className="px-4 py-3 text-right font-bold text-gray-800"
                          >
                            {(order?.totalAmount || 0).toFixed(2)} SAR
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-300 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm text-gray-400 mt-1">
                This table has no orders in the current session
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button
            className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
            onClick={handleGenerateInvoice}
          >
            <FaPrint className="h-5 w-5" />
            Generate Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrdersDisplay;
