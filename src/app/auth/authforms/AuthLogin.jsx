'use client'
import { Button, Checkbox, Label, Spinner, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import i18n from "@/utils/i18n";
import { useRouter } from "next/navigation";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import { useDispatch } from "react-redux";
import { useFormik } from 'formik';
import AuthModel from "@/resources/models/Auth/AuthModel";
import LogIn from "@/resources/db/function/auth/LogIn";
import URLs from "@/resources/Net/URLs";
import { Notify } from "@/app/components/notification/Notification";

const AuthLogin = () => {
  const router = useRouter();
  const axiosInstance = CreateAxiosInstanceServer(AuthModel());
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { login, user } = AuthModel();

  useEffect(() => {
    if (login?.login) {
      router.push('/Overview');
    }
  }, [login?.login, user, router]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validate: (values) => {
      const errors = {};
      if (!values.email) {
        errors.email = i18n.t('Required') || 'Required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Invalid email';
      }
      if (!values.password) {
        errors.password = i18n.t('Required') || 'Required';
      }
      return errors;
    },
    onSubmit: async (values, { setErrors }) => {
      setLoading(true);
      try {
        const response = await axiosInstance.post(URLs.auth.login, values);
        LogIn(dispatch, response.data);
        Notify(i18n.t('Successfully') || 'Logged in', 'success');
        router.push('/Overview');
      } catch (error) {
        const msg = error?.message || 'Login failed';
        if (error?.errors) {
          setErrors(error.errors);
        } else {
          setErrors({ email: msg });
        }
        Notify(msg, 'danger');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-ld">PhoneNotify</h2>
        <p className="text-darklink text-sm mt-1">Admin Dashboard</p>
      </div>
      <form className="mt-6" onSubmit={formik.handleSubmit}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="email" value={i18n.t('Email') || 'Email'} />
          </div>
          <TextInput
            className="form-control"
            sizing="md"
            type="email"
            name="email"
            id="email"
            autoComplete="username"
            placeholder="admin@example.com"
            value={formik.values.email}
            onChange={formik.handleChange}
          />
          {formik.errors.email ? (
            <div className="text-right pr-3 pt-2 text-red-500 text-sm">
              {formik.errors.email}
            </div>
          ) : null}
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="password" value={i18n.t('Password') || 'Password'} />
          </div>
          <TextInput
            sizing="md"
            className="form-control"
            type="password"
            name="password"
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={formik.values.password}
            onChange={formik.handleChange}
          />
          {formik.errors.password ? (
            <div className="text-right pr-3 pt-2 text-red-500 text-sm">
              {formik.errors.password}
            </div>
          ) : null}
        </div>
        <div className="flex justify-between my-5">
          <div className="flex items-center gap-2">
            <Checkbox id="accept" className="checkbox" />
            <Label htmlFor="accept" className="opacity-90 font-normal cursor-pointer">
              {i18n.t('Remember Me') || 'Remember Me'}
            </Label>
          </div>
        </div>
        <Button type="submit" color="primary" className="w-full" disabled={loading}>
          {loading ? (
            <span>
              <Spinner aria-label="loading" size="sm" />
              <span className="px-3">{i18n.t('Loading...') || 'Loading...'}</span>
            </span>
          ) : (
            i18n.t('LogIn') || 'Login'
          )}
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
