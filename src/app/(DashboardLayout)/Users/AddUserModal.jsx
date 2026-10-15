"use client";
import React, { useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label, TextInput, Button, Spinner } from "flowbite-react";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import URLs from "@/resources/Net/URLs";
import { Notify } from "@/app/components/notification/Notification";

const AddUserModal = ({ popupModal, setPopupModal, obj, login, onSuccess }) => {
  const editMode = obj && obj.id > 0;
  const axiosInstance = CreateAxiosInstanceServer({ login });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: obj?.name || "",
      email: obj?.email || "",
      password: "",
      role: "admin",
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      password: editMode
        ? Yup.string().min(6, "Min 6 characters")
        : Yup.string().min(6, "Min 6 characters").required("Required"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        setSubmitting(true);
        const payload = { ...values };
        if (editMode && !payload.password) delete payload.password;
        if (editMode) {
          await axiosInstance.put(`${URLs.admin.users}/${obj.id}`, payload);
          Notify("User updated", "success");
        } else {
          await axiosInstance.post(URLs.admin.users, payload);
          Notify("User created", "success");
        }
        onSuccess();
        setPopupModal(false);
      } catch (error) {
        if (error?.errors) setErrors(error.errors);
        else Notify(error?.message || "Save failed", "danger");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!popupModal) formik.resetForm();
  }, [popupModal]);

  return (
    <Dialog
      open={popupModal}
      onClose={() => setPopupModal(false)}
      className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 z-50"
    >
      <DialogPanel className="w-full max-w-md rounded-lg bg-white dark:bg-darkgray p-6 shadow-md">
        <DialogTitle className="text-lg font-semibold mb-4">
          {editMode ? "Edit User" : "Add User"}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" value="Name" />
            <TextInput id="name" name="name" value={formik.values.name} onChange={formik.handleChange} />
            {formik.errors.name && <p className="text-red-500 text-sm">{formik.errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="email" value="Email" />
            <TextInput id="email" name="email" type="email" value={formik.values.email} onChange={formik.handleChange} />
            {formik.errors.email && <p className="text-red-500 text-sm">{formik.errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="password" value={editMode ? "Password (leave blank to keep)" : "Password"} />
            <TextInput id="password" name="password" type="password" value={formik.values.password} onChange={formik.handleChange} />
            {formik.errors.password && <p className="text-red-500 text-sm">{formik.errors.password}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button color="light" type="button" onClick={() => setPopupModal(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? <Spinner size="sm" /> : "Save"}
            </Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
};

export default AddUserModal;
