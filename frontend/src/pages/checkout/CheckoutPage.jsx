import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../../redux/features/cart/cartSlice";
import { orderService } from "../../services/orderService";
import { voucherService } from "../../services/voucherService";
import { paymentService } from "../../services/paymentService";
import { toast } from "react-toastify";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, totalPrice, tax, grandTotal } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discount, setDiscount] = useState(0);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    street: "",
    ward: "",
    district: "",
    city: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [notes, setNotes] = useState("");

  // Calculate totals
  const subtotal = products.reduce((sum, product) => {
    const numericPrice = Number(String(product.price).replace(/\D/g, ""));
    return sum + numericPrice * product.quantity;
  }, 0);

  const shippingFee = 30000; // Fixed shipping fee
  const finalTotal = subtotal + shippingFee - discount;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Please enter voucher code");
      return;
    }

    try {
      const response = await voucherService.validateVoucher(voucherCode, subtotal);
      const voucher = response.data.voucher;

      let discountAmount = 0;
      if (voucher.discountType === "percentage") {
        discountAmount = (subtotal * voucher.discountValue) / 100;
        if (voucher.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount);
        }
      } else {
        discountAmount = voucher.discountValue;
      }

      setAppliedVoucher(voucher);
      setDiscount(discountAmount);
      toast.success(`Voucher applied! Discount: ${formatPrice(discountAmount)}`);
    } catch (error) {
      toast.error(error.message || "Invalid voucher code");
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscount(0);
    setVoucherCode("");
    toast.info("Voucher removed");
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to place order");
      navigate("/login");
      return;
    }

    if (products.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Validate shipping address
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street ||
      !shippingAddress.ward || !shippingAddress.district || !shippingAddress.city) {
      toast.error("Please fill in all required shipping information");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: products.map((p) => ({
          product: p._id,
          variant: p.variant?._id,
          quantity: p.quantity,
          price: Number(String(p.price).replace(/\D/g, "")),
        })),
        shippingAddress,
        voucher: appliedVoucher?._id,
        shippingFee,
        paymentMethod,
        notes,
      };

      const response = await orderService.createOrder(orderData);
      const order = response.data.order;

      toast.success("Đơn hàng đã được tạo thành công!");
      dispatch(clearCart());

      // Redirect based on payment method
      if (paymentMethod === "VNPay") {
        try {
          console.log("Creating VNPay payment for order:", order._id);
          // Get VNPay payment URL
          const paymentResponse = await paymentService.createVNPayPayment(order._id);
          console.log("VNPay full response:", paymentResponse);

          // Try different response structures
          const paymentUrl = paymentResponse.paymentUrl || paymentResponse.data?.paymentUrl;

          console.log("Payment URL:", paymentUrl);

          if (!paymentUrl) {
            throw new Error("Payment URL not found in response");
          }

          // Redirect to VNPay
          window.location.href = paymentUrl;
        } catch (error) {
          console.error("VNPay error:", error);
          console.error("Error response:", error.response?.data);
          const errorMsg = error.response?.data?.message || error.message || "Không thể tạo link thanh toán VNPay";
          toast.error(errorMsg);
          navigate(`/orders/${order._id}`);
        }
      } else {
        // COD - go directly to order detail
        navigate(`/orders/${order._id}`);
      }
    } catch (error) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Please login to checkout</h2>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d]"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate("/shop")}
            className="px-6 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d]"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section__container mt-20">
      <h2 className="text-3xl font-bold mb-8">Checkout</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Shipping & Payment */}
        <div className="lg:col-span-2">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67c52]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67c52]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 123 Nguyen Hue"
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, street: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67c52]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ward <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Phường Bến Nghé"
                    value={shippingAddress.ward}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, ward: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67c52]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Quận 1"
                    value={shippingAddress.district}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, district: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67c52]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    City/Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Hồ Chí Minh"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67c52]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>Cash on Delivery (COD)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="VNPay"
                    checked={paymentMethod === "VNPay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>VNPay (Online Payment)</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Order Notes (Optional)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                placeholder="Any special instructions for your order..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67c52]"
              ></textarea>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow sticky top-24">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

            {/* Products */}
            <div className="mb-4 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product._id} className="border-b pb-3 last:border-b-0">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col align-center justify-center">
                        <h4 className="text-sm font-medium mb-1 line-clamp-2">
                          {product.name}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Số Lượng: {product.quantity}</span>
                          <span className="font-semibold text-[#a67c52]">
                            {formatPrice(Number(String(product.price).replace(/\D/g, "")))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="my-4" />

            {/* Voucher */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Voucher Code</label>
              {appliedVoucher ? (
                <div className="flex items-center justify-between bg-green-50 p-3 rounded">
                  <span className="text-sm text-green-700 font-medium">
                    {appliedVoucher.code}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    className="px-4 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            <hr className="my-4" />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-[#a67c52]">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-6 px-6 py-3 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
