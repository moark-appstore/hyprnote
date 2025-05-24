import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import {
  commands as giteeAiCommands,
  GiteeAiAppPaymentPlan,
  GiteeAiPaymentPeriod,
  GiteeAiPayDetail,
  GiteeAiPayResult,
} from "@hypr/plugin-gitee-ai";

type PaymentStatus =
  | "idle"
  | "generating"
  | "waiting"
  | "checking"
  | "success"
  | "failed";

export function useSubscription() {
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    GiteeAiAppPaymentPlan[]
  >([]);
  const [selectedPlan, setSelectedPlan] =
    useState<GiteeAiPaymentPeriod>("MONTH");
  const [periodQuantity, setPeriodQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"alipay" | "wepay">(
    "alipay"
  );

  // 支付相关状态
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [paymentDetail, setPaymentDetail] = useState<GiteeAiPayDetail | null>(
    null
  );
  const [paymentResult, setPaymentResult] = useState<GiteeAiPayResult | null>(
    null
  );
  const [checkingCount, setCheckingCount] = useState(0);

  const currentPlan = subscriptionPlans.find((p) => p.period === selectedPlan);
  const totalPrice = currentPlan ? currentPlan?.price * periodQuantity : 0;

  // 生成二维码
  const generateQRCode = useCallback(async (url: string) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 156,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(qrCodeDataURL);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  }, []);

  // 检查支付结果
  const checkPaymentResult = useCallback(async () => {
    if (!paymentDetail) return;

    try {
      setPaymentStatus("checking");
      const result = await giteeAiCommands.getPayResult(paymentDetail.ident);
      setPaymentResult(result);

      if (result.status === "SUCCESS" || result.status === "PAID") {
        setPaymentStatus("success");
        setTimeout(() => {
          setIsPaymentModalOpen(false);
          setPaymentStatus("idle");
          setPaymentDetail(null);
          setPaymentResult(null);
          setQrCodeDataUrl("");
        }, 2000);
      } else if (result.status === "FAILED" || result.status === "CANCEL") {
        setPaymentStatus("failed");
      } else {
        setPaymentStatus("waiting");
        setCheckingCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to check payment result:", error);
      setPaymentStatus("failed");
    }
  }, [paymentDetail]);

  // 开始支付流程
  const handleSubscribe = async () => {
    if (!currentPlan) return;

    try {
      setPaymentStatus("generating");
      setIsPaymentModalOpen(true);
      setCheckingCount(0);

      const res = await giteeAiCommands.pay(
        currentPlan.ident,
        periodQuantity,
        paymentMethod
      );

      setPaymentDetail(res);

      if (res.redirect_type === "qrcode" && res.url) {
        await generateQRCode(res.url);
        setPaymentStatus("waiting");
      } else {
        if (res.url) {
          window.open(res.url, "_blank");
        }
        setPaymentStatus("waiting");
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setPaymentStatus("failed");
    }
  };

  // 关闭支付弹窗
  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentStatus("idle");
    setPaymentDetail(null);
    setPaymentResult(null);
    setQrCodeDataUrl("");
    setCheckingCount(0);
  };

  // 获取应用信息
  useEffect(() => {
    giteeAiCommands.getAppInfo().then((res) => {
      console.log(res);
      setSubscriptionPlans(res.payment_plans);
    });
  }, []);

  return {
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
    paymentDetail,
    paymentResult,
    checkingCount,

    // 动作函数
    setSelectedPlan,
    setPeriodQuantity,
    setPaymentMethod,
    handleSubscribe,
    checkPaymentResult,
    closePaymentModal,
  };
}
