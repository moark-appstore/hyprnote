import { Button } from "@hypr/ui/components/ui/button";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@hypr/ui/components/ui/modal";
import { Loader2, CheckCircle, XCircle, Crown } from "lucide-react";
import { AliPayIcon, WePayIcon } from "./PaymentIcons";
import { GiteeAiPayDetail, GiteeAiPayResult } from "@hypr/plugin-gitee-ai";

type PaymentStatus =
  | "idle"
  | "generating"
  | "waiting"
  | "checking"
  | "success"
  | "failed";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentStatus: PaymentStatus;
  paymentMethod: "alipay" | "wepay";
  qrCodeDataUrl: string;
  paymentResult: GiteeAiPayResult | null;
  onCheckPayment: () => void;
  onRetryPayment: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  paymentStatus,
  paymentMethod,
  qrCodeDataUrl,
  paymentResult,
  onCheckPayment,
  onRetryPayment,
}: PaymentModalProps) {
  const getPaymentStatusInfo = () => {
    switch (paymentStatus) {
      case "generating":
        return {
          title: "生成支付码中...",
          description: "正在为您生成支付二维码，请稍候",
          icon: <Loader2 className="w-8 h-8 animate-spin text-blue-500" />,
        };
      case "waiting":
        return {
          title: "请扫码支付",
          description: `请使用${
            paymentMethod === "alipay" ? "支付宝" : "微信"
          }扫描二维码完成支付`,
          icon: paymentMethod === "alipay" ? <AliPayIcon /> : <WePayIcon />,
        };
      case "checking":
        return {
          title: "检查支付状态中...",
          description: "正在确认您的支付状态，请稍候",
          icon: <Loader2 className="w-8 h-8 animate-spin text-orange-500" />,
        };
      case "success":
        return {
          title: "支付成功！",
          description: "恭喜您成功订阅 Pro 版本，即将为您跳转",
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
        };
      case "failed":
        return {
          title: "支付失败",
          description: "支付过程中出现问题，请稍后重试",
          icon: <XCircle className="w-8 h-8 text-red-500" />,
        };
      default:
        return {
          title: "",
          description: "",
          icon: null,
        };
    }
  };

  const statusInfo = getPaymentStatusInfo();

  return (
    <Modal
      open={isOpen}
      onClose={paymentStatus === "success" ? () => {} : onClose}
      size="md"
      preventClose={
        paymentStatus === "checking" || paymentStatus === "generating"
      }
    >
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-lg overflow-hidden">
        <ModalHeader className="p-5 pb-3 bg-gradient-to-r from-blue-600/5 to-purple-600/5">
          <ModalTitle className="text-xl font-bold text-center text-gray-800">
            {statusInfo.title}
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="px-5 py-3">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 rounded-full bg-white/80 shadow-lg">
                {statusInfo.icon}
              </div>
              <p className="text-center text-gray-600 text-sm leading-relaxed">
                {statusInfo.description}
              </p>
            </div>

            {paymentStatus === "waiting" && qrCodeDataUrl && (
              <div className="">
                <div className="relative flex-shrink-0">
                  <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <img
                      src={qrCodeDataUrl}
                      alt="支付二维码"
                      className="w-32 h-32 rounded-lg"
                    />
                  </div>
                  {/* 装饰性边框 */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl -z-10"></div>
                </div>
              </div>
            )}

            {paymentResult && paymentStatus === "success" && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 w-80 shadow-sm">
                <div className="text-center space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700 font-medium">
                      支付金额
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      ¥{paymentResult.amount}
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-sm text-green-600 bg-white/60 py-2 px-4 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    <div className="flex items-center space-x-2">
                      {paymentResult.pay_type === "alipay" ? (
                        <AliPayIcon />
                      ) : (
                        <WePayIcon />
                      )}
                      <span>
                        {paymentResult.pay_type === "alipay"
                          ? "支付宝"
                          : "微信支付"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="p-4 pt-2 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
          <div className="flex justify-center space-x-4 w-full">
            {paymentStatus === "waiting" && (
              <Button
                onClick={onCheckPayment}
                disabled={false}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-2.5 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                支付完成
              </Button>
            )}

            {paymentStatus === "checking" && (
              <Button
                disabled={true}
                className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-2.5 text-sm font-medium shadow-lg"
                size="sm"
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                检查中...
              </Button>
            )}

            {paymentStatus === "failed" && (
              <Button
                onClick={onRetryPayment}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2.5 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-2" />
                重新支付
              </Button>
            )}

            {(paymentStatus === "failed" || paymentStatus === "waiting") && (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={false}
                className="px-8 py-2.5 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                size="sm"
              >
                取消
              </Button>
            )}
          </div>
        </ModalFooter>
      </div>
    </Modal>
  );
}
