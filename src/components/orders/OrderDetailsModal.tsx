import { useState } from "react";
import { Modal } from "@/components/Modal";
import { updateOrderStatus } from "@/lib/api";
import { OrderData } from "@/types";

interface OrderDetailsModalProps {
  order: OrderData;
  onClose: () => void;
  onUpdate: () => void;
}

export function OrderDetailsModal({ order, onClose, onUpdate }: OrderDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(order?.orderStatus || "PENDING");

  if (!order) return null;

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    try {
      setIsUpdating(true);
      await updateOrderStatus(order._id, newStatus);
      onUpdate();
    } catch (error) {
      console.error("Failed to update order status", error);
      alert("Failed to update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Order Details">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
            <p className="mt-1 text-sm text-gray-900">{order._id}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(order.updatedAt || order.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Customer</h3>
            <p className="mt-1 text-sm text-gray-900">{order.customerName || "N/A"}</p>
            <p className="text-sm text-gray-500">{order.customerEmail}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
            <p className="mt-1 text-sm font-medium text-gray-900">
              ${(order.totalAmount).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h3>
          {order.shippingAddress ? (
            <p className="text-sm text-gray-600">
              {order.shippingAddress.name && <>{order.shippingAddress.name}<br/></>}
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 && `, ${order.shippingAddress.line2}`}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}
              <br />
              {order.shippingAddress.country}
            </p>
          ) : (
            <p className="text-sm text-gray-500">No shipping address provided.</p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Order Items</h3>
          <ul className="divide-y divide-gray-100">
            {order.items.map((item: OrderData["items"][0] & { productName?: string, sku?: string, customWig?: { wigStyle: string, hairLength: string, headSize: string, bundles?: { quantity: number; product?: { name: string }; variantSku?: string }[], laceSystem?: { product?: { name: string }; variantSku?: string } } }, idx: number) => (
              <li key={idx} className="py-3 flex justify-between">
                  <div>
                    {item.itemType === "PRODUCT" ? (
                      <>
                        <p className="text-sm font-medium text-gray-900">
                          {item.productName || item.product?.name || "Unknown Product"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Qty: {item.quantity} | SKU: {item.sku || item.variantSku || "N/A"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-900">
                          {item.productName || "Custom Wig"} (Qty: {item.quantity})
                        </p>
                        {item.customWig && (
                          <div className="mt-2 text-xs text-gray-600 space-y-1 bg-gray-50 p-2 rounded-md border border-gray-100">
                            <p><span className="font-semibold text-gray-700">Style:</span> {item.customWig.wigStyle}, {item.customWig.hairLength}&quot;, {item.customWig.headSize}</p>
                            
                            <p className="font-semibold text-gray-700 mt-2">Bundles:</p>
                            <ul className="list-disc pl-4 mb-1">
                              {item.customWig.bundles?.map((b: { quantity: number; product?: { name: string }; variantSku?: string }, i: number) => (
                                <li key={i}>{b.quantity}x {b.product?.name || "Bundle"} (SKU: {b.variantSku})</li>
                              ))}
                            </ul>
                            
                            <p className="font-semibold text-gray-700 mt-2">Lace System:</p>
                            <p className="pl-4">1x {item.customWig.laceSystem?.product?.name || "Lace"} (SKU: {item.customWig.laceSystem?.variantSku})</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                <p className="text-sm text-gray-900">
                  ${(item.totalPrice).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
            <span
              className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                order.paymentStatus === "PAID" || order.paymentStatus === "SUCCESSFUL"
                  ? "bg-green-100 text-green-800"
                  : order.paymentStatus === "FAILED" || order.paymentStatus === "CANCELLED"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.paymentStatus === "PAID" || order.paymentStatus === "SUCCESSFUL" ? "Successful" : 
               order.paymentStatus === "FAILED" ? "Failed" : 
               order.paymentStatus === "CANCELLED" ? "Canceled" : "Pending"}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Order Status</h3>
            <select
              value={status}
              onChange={handleStatusChange}
              disabled={isUpdating}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#86733B] focus:ring-[#86733B] sm:text-sm"
            >
              {order.paymentStatus === "PENDING" && <option value="PENDING">PENDING</option>}
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
