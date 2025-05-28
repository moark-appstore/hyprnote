import { useMutation } from "@tanstack/react-query";
// import { useNavigate } from "@tanstack/react-router"; // 移除未使用的导入
// import { message } from "@tauri-apps/plugin-dialog"; // 移除未使用的导入
import { useEffect, useState } from "react";

import { commands } from "@/types";
// import { commands as authCommands, events } from "@hypr/plugin-auth"; // 隐藏 OAuth 认证
import { commands as localSttCommands, SupportedModel } from "@hypr/plugin-local-stt";
import { commands as sfxCommands } from "@hypr/plugin-sfx";
import { Modal, ModalBody } from "@hypr/ui/components/ui/modal";
import { Particles } from "@hypr/ui/components/ui/particles";

import { ModelSelectionView } from "./model-selection-view";
import { WelcomeView } from "./welcome-view";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  // const navigate = useNavigate(); // 移除未使用的变量
  // const [port, setPort] = useState<number | null>(null); // 隐藏 OAuth 端口
  const [showModelSelection, setShowModelSelection] = useState(false);

  const selectSTTModel = useMutation({
    mutationFn: (model: SupportedModel) => localSttCommands.setCurrentModel(model),
  });

  // 注释掉 OAuth 相关的 useEffect
  // useEffect(() => {
  //   let cleanup: (() => void) | undefined;
  //   let unlisten: (() => void) | undefined;

  //   if (isOpen) {
  //     authCommands.startOauthServer().then((port) => {
  //       setPort(port);

  //       events.authEvent
  //         .listen(({ payload }) => {
  //           if (payload === "success") {
  //             commands.setupDbForCloud().then(() => {
  //               onClose();
  //             });
  //             return;
  //           }

  //           if (payload.error) {
  //             message("Error occurred while authenticating!");
  //             return;
  //           }
  //         })
  //         .then((fn) => {
  //           unlisten = fn;
  //         });

  //       cleanup = () => {
  //         unlisten?.();
  //         authCommands.stopOauthServer(port);
  //       };
  //     });
  //   }

  //   return () => cleanup?.();
  // }, [isOpen, onClose, navigate]);

  useEffect(() => {
    if (isOpen) {
      commands.setOnboardingNeeded(false);
      sfxCommands.play("BGM");
    } else {
      sfxCommands.stop("BGM");
    }
  }, [isOpen]);

  const handleStartLocal = () => {
    setShowModelSelection(true);
  };

  const handleModelSelected = (model: SupportedModel) => {
    selectSTTModel.mutate(model);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="full"
      className="bg-background"
      preventClose
    >
      <ModalBody className="relative p-0 flex flex-col items-center justify-center overflow-hidden">
        <div className="z-10">
          {!showModelSelection
            ? (
              <WelcomeView
                // portReady={port !== null} // 隐藏 OAuth 端口检查
                portReady={true} // 直接设为 true，允许立即开始
                onGetStarted={handleStartLocal}
              />
            )
            : <ModelSelectionView onContinue={handleModelSelected} />}
        </div>

        <Particles
          className="absolute inset-0 z-0"
          quantity={150}
          ease={80}
          color={"#000000"}
          refresh
        />
      </ModalBody>
    </Modal>
  );
}
