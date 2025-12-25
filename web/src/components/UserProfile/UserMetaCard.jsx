import { useState, useRef, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, updateProfileImage, updateLoading, updateSuccess, updateError, clearUpdateStatus } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Handle success/close modal on successful update
  useEffect(() => {
    if (updateSuccess && isOpen) {
      setSelectedImage(null);
      setPreviewUrl(null);
      closeModal();
      clearUpdateStatus?.();
    }
  }, [updateSuccess, isOpen, closeModal, clearUpdateStatus]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!selectedImage || !user?._id) {
      closeModal();
      return;
    }

    try {
      await updateProfileImage(user._id, selectedImage);
    } catch (error) {
      console.error("Error updating profile image:", error);
    }
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    clearUpdateStatus?.();
    closeModal();
  };

  const userImage = user?.image?.url || "/images/user/owner.jpg";
  const fullName = user ? `${user.firstname || ""} ${user.lastname || ""}`.trim() : "Admin User";
  const role = user?.role || "Admin";
  const location = user?.address 
    ? `${user.address.city || ""}, ${user.address.country || ""}`.replace(/^, |, $/g, "")
    : "";

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 group">
              <img 
                src={userImage} 
                alt={fullName}
                className="object-cover w-full h-full"
              />
              <div 
                onClick={openModal}
                className="absolute inset-0 flex items-center justify-center transition-opacity bg-black/50 opacity-0 cursor-pointer group-hover:opacity-100"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {fullName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {role}
                </p>
                {location && (
                  <>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {location}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-success-700 bg-success-50 rounded-full dark:bg-success-500/10 dark:text-success-400">
                <span className="w-2 h-2 mr-1.5 bg-success-500 rounded-full"></span>
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Update Profile Picture
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Choose a new profile picture
            </p>
          </div>

          {updateError && (
            <div className="mb-4 p-3 text-sm text-error-600 bg-error-50 border border-error-200 rounded-lg dark:bg-error-500/10 dark:border-error-500/20 dark:text-error-400">
              {updateError}
            </div>
          )}

          <div className="flex flex-col items-center gap-6">
            <div className="w-32 h-32 overflow-hidden border-2 border-gray-200 border-dashed rounded-full dark:border-gray-700">
              <img
                src={previewUrl || userImage}
                alt="Preview"
                className="object-cover w-full h-full"
              />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />

            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={updateLoading}
            >
              Choose Image
            </Button>
          </div>

          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={handleCloseModal} disabled={updateLoading}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={updateLoading || !selectedImage}>
              {updateLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
