import { Card, CardContent, CardHeader, CardTitle } from "@hypr/ui/components/ui/card";
import { Label } from "@hypr/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@hypr/ui/components/ui/radio-group";
import { AliPayIcon, WePayIcon } from "./PaymentIcons";

interface PaymentMethodSelectionProps {
  paymentMethod: "alipay" | "wepay";
  onPaymentMethodChange: (method: "alipay" | "wepay") => void;
}

export function PaymentMethodSelection({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodSelectionProps) {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>支付方式</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => onPaymentMethodChange(value as "alipay" | "wepay")}
          className="space-y-3"
        >
          <div
            className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              paymentMethod === "alipay"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <RadioGroupItem value="alipay" id="alipay" />
            <Label
              htmlFor="alipay"
              className="flex items-center space-x-3 cursor-pointer flex-1"
            >
              <AliPayIcon />
              <div>
                <span className="font-semibold text-gray-800">支付宝</span>
                <p className="text-xs text-gray-500">安全便捷的支付方式</p>
              </div>
            </Label>
          </div>
          <div
            className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              paymentMethod === "wepay"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <RadioGroupItem value="wepay" id="wepay" />
            <Label
              htmlFor="wepay"
              className="flex items-center space-x-3 cursor-pointer flex-1"
            >
              <WePayIcon />
              <div>
                <span className="font-semibold text-gray-800">微信支付</span>
                <p className="text-xs text-gray-500">快速扫码支付</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
