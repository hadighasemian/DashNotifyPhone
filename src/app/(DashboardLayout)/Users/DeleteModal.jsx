"use client";
import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Button, Spinner } from "flowbite-react";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import URLs from "@/resources/Net/URLs";
import { Notify } from "@/app/components/notification/Notification";

const DeleteModal = ({ popupModal, setPopupModal, obj, login, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const axiosInstance = CreateAxiosInstanceServer({ login });

  const onDelete = async () => {
    if (!obj?.id) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`${URLs.admin.users}/${obj.id}`);
      Notify("User deleted", "success");
      onSuccess();
      setPopupModal(false);
    } catch (e) {
      Notify(e?.message || "Delete failed", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={popupModal}
      onClose={() => setPopupModal(false)}
      className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 z-50"
    >
      <DialogPanel className="w-full max-w-sm rounded-lg bg-white dark:bg-darkgray p-6 shadow-md">
        <DialogTitle className="text-lg font-semibold mb-2">Delete user?</DialogTitle>
        <p className="text-sm text-darklink mb-4">
          This will permanently remove <strong>{obj?.name}</strong> ({obj?.email}).
        </p>
        <div className="flex justify-end gap-2">
          <Button color="light" onClick={() => setPopupModal(false)}>
            Cancel
          </Button>
          <Button color="failure" onClick={onDelete} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Delete"}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default DeleteModal;
