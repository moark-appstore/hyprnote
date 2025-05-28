import { GiteeAiAppPaymentPlan, GiteeAiPaymentPeriod } from "@hypr/plugin-gitee-ai";
import { Button } from "@hypr/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@hypr/ui/components/ui/card";
import { Check, Crown } from "lucide-react";

type PaymentStatus =
  | "idle"
  | "generating"
  | "waiting"
  | "checking"
  | "success"
  | "failed";

interface OrderSummaryProps {
  currentPlan: GiteeAiAppPaymentPlan | undefined;
  selectedPlan: GiteeAiPaymentPeriod;
  periodQuantity: number;
  paymentMethod: "alipay" | "wepay";
  totalPrice: number;
  paymentStatus: PaymentStatus;
  onSubscribe: () => void;
}

export function OrderSummary({
  currentPlan,
  selectedPlan,
  periodQuantity,
  paymentMethod,
  totalPrice,
  paymentStatus,
  onSubscribe,
}: OrderSummaryProps) {
  return (
    <div className="sticky top-4">
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-800">订单摘要</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">套餐类型</span>
              <span className="font-semibold text-gray-800">
                {currentPlan?.name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">单价</span>
              <span className="font-semibold text-gray-800">
                {currentPlan?.price} 元
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">订阅周期</span>
              <span className="font-semibold text-gray-800">
                {periodQuantity} {selectedPlan === "DAY" ? "天" : "个月"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">支付方式</span>
              <span className="font-semibold text-gray-800">
                {paymentMethod === "alipay" ? "支付宝" : "微信支付"}
              </span>
            </div>
          </div>

          <div className="border-t-2 border-gray-100 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">总计</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ¥{totalPrice}
              </span>
            </div>
          </div>

          <Button
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={onSubscribe}
            disabled={!currentPlan || paymentStatus !== "idle"}
          >
            <Crown className="w-5 h-5 mr-2" />
            立即订阅
          </Button>

          <div className="text-xs text-gray-500 text-center leading-relaxed">
            点击订阅即表示您同意我们的
            <br />
            <a href="#" className="text-blue-600 hover:underline">
              服务条款
            </a>
            和
            <a href="#" className="text-blue-600 hover:underline">
              隐私政策
            </a>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <Check className="w-4 h-4" />
              <span className="text-xs font-medium">AI 赋能，助力高效办公</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
