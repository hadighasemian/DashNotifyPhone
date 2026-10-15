import axios from "axios";
import URLs from "./URLs";

const CreateAxiosInstanceServer = ({ login } = {}) => {
  const token = login?.token || "";
  const instance = axios.create({
    baseURL: URLs.base,
    timeout: 60000,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const payload = error?.response?.data || { message: "Wrong Services" };
      return Promise.reject(payload);
    }
  );

  return instance;
};

export default CreateAxiosInstanceServer;
