import { createFileRoute } from "@tanstack/react-router";
import { useSubscription } from "../hooks/useSubscription";
import {
  SubscriptionHeader,
  ProFeatures,
  PlanSelection,
  SubscriptionPeriod,
  PaymentMethodSelection,
  OrderSummary,
  PaymentModal,
} from "../components/subscription";

export const Route = createFileRoute("/app/subscription")({
  component: Component,
});

function Component() {
  const {
    // 订阅相关状态
    subscriptionPlans,
    selectedPlan,
    periodQuantity,
    paymentMethod,
    currentPlan,
    totalPrice,

    // 支付相关状态
    isPaymentModalOpen,
    paymentStatus,
    qrCodeDataUrl,
    paymentResult,

    // 动作函数
    setSelectedPlan,
    setPeriodQuantity,
    setPaymentMethod,
    handleSubscribe,
    checkPaymentResult,
    closePaymentModal,
  } = useSubscription();

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="min-h-full">
        {/* 顶部装饰区域 */}
        <SubscriptionHeader />

        {/* 主要内容区域 */}
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* 功能特性展示 */}
            <div className="xl:col-span-1 order-2 xl:order-1">
              <ProFeatures />
            </div>

            {/* 套餐选择和配置 */}
            <div className="xl:col-span-2 order-1 xl:order-2 space-y-6">
              {/* 套餐选择 */}
              <PlanSelection
                subscriptionPlans={subscriptionPlans}
                selectedPlan={selectedPlan}
                onPlanChange={setSelectedPlan}
              />

              {/* 订阅周期 */}
              <SubscriptionPeriod
                selectedPlan={selectedPlan}
                periodQuantity={periodQuantity}
                onPeriodQuantityChange={setPeriodQuantity}
              />

              {/* 支付方式 */}
              <PaymentMethodSelection
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
              />
            </div>

            {/* 订单摘要 */}
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

        {/* 底部装饰 */}
        <div className="h-20 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
      </div>

      {/* 支付弹窗 */}
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
    </div>
  );
}
