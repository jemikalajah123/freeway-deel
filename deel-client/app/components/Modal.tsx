import { ReactNode } from "react";
import Modal from "react-modal";

type CustomModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

const CustomModal = ({ isOpen, onClose, title, children }: CustomModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Fund Account"
      className="w-full max-w-xl h-screen flex items-center justify-center rounded m-auto focus-visible:outline-none"
    >
      <div className="p-4 pb-8 bg-white rounded-lg shadow-2xl w-full min-h-[200px]">
        <div className="flex justify-between">
          <span className="font-semibold">{title}</span>
          <span className="cursor-pointer" onClick={onClose}>Close</span>
        </div>
        <hr className="mt-1 mb-5" />

        {children}
      </div>
    </Modal>
  );
};

export default CustomModal;
