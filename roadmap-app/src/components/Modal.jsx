import { IconClose } from "./Icons";

export default function Modal({ title, onClose, children, width = "max-w-lg" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`w-full ${width} rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between border-b border-border-gray px-5 py-4">
          <h3 className="text-base font-bold text-dark-gray">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-medium-gray hover:bg-light-gray hover:text-dark-gray"
          >
            <IconClose />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
