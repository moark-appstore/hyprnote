import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useGiteeAi } from "@/contexts/gitee-ai";
import {
  SubscriptionHeader,
  ProFeatures,
  PlanSelection,
  SubscriptionPeriod,
  PaymentMethodSelection,
  OrderSummary,
  PaymentModal,
} from "../components/subscription";
import { RegisterForm } from "../components/RegisterForm";
import { useSubscription } from "../hooks/useSubscription";

export const Route = createFileRoute("/app/subscription")({
  component: Component,
});

function Component() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const {
    subscriptionPlans,
    selectedPlan,
    periodQuantity,
    paymentMethod,
    currentPlan,
    totalPrice,

    isPaymentModalOpen,
    paymentStatus,
    qrCodeDataUrl,
    paymentResult,

    setSelectedPlan,
    setPeriodQuantity,
    setPaymentMethod,
    handleSubscribe: originalHandleSubscribe,
    checkPaymentResult,
    closePaymentModal,
  } = useSubscription();
  const { loginStatus } = useGiteeAi((s) => ({
    loginStatus: s.loginStatus,
  }));

  const handleSubscribe = async () => {
    // 检查是否已登录（有token）
    if (!loginStatus.is_logged_in || !loginStatus.token_info) {
      setShowLoginModal(true);
      return;
    }

    // 已登录，直接进行支付
    await originalHandleSubscribe();
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // 登录成功后自动触发支付
    setTimeout(() => {
      originalHandleSubscribe();
    }, 100);
  };

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="min-h-full">
        <SubscriptionHeader />

        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-1 order-2 xl:order-1">
              <ProFeatures />
            </div>

            <div className="xl:col-span-2 order-1 xl:order-2 space-y-6">
              <PlanSelection
                subscriptionPlans={subscriptionPlans}
                selectedPlan={selectedPlan}
                onPlanChange={setSelectedPlan}
              />

              <SubscriptionPeriod
                selectedPlan={selectedPlan}
                periodQuantity={periodQuantity}
                onPeriodQuantityChange={setPeriodQuantity}
              />

              <PaymentMethodSelection
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
              />
            </div>

            <div className="xl:col-span-1 order-3">
              <OrderSummary
                currentPlan={currentPlan}
                selectedPlan={selectedPlan}
                periodQuantity={periodQuantity}
                paymentMethod={paymentMethod}
                totalPrice={totalPrice}
                paymentStatus={paymentStatus}
                onSubscribe={handleSubscribe}
              />
            </div>
          </div>
        </div>

        <div className="h-20 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        paymentStatus={paymentStatus}
        paymentMethod={paymentMethod}
        qrCodeDataUrl={qrCodeDataUrl}
        paymentResult={paymentResult}
        onCheckPayment={checkPaymentResult}
        onRetryPayment={handleSubscribe}
      />

      {showLoginModal && (
        <RegisterForm
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
