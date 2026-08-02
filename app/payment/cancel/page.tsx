export default function PaymentCancelPage() {
  return (
    <div className="max-w-md mx-auto mt-24 p-6 text-center">
      <div className="text-5xl mb-4">✕</div>
      <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
      <p className="text-gray-600 mb-6">
        Your payment was not completed. You can try again anytime from your orders page.
      </p>
      <a href="/dashboard/customer/orders" className="inline-block underline text-sm">
        Back to my orders
      </a>
    </div>
  );
}