import { useSelector } from "react-redux";

function AuthModel() {
  let login = {
    login: false,
    token: "",
  };
  let user = {
    id: 0,
    name: "",
    email: "",
    mobile: "",
    role: {
      id: 0,
      name: "",
      title: "",
    },
  };
  const auth = useSelector((state) => state.auth.auth);
  if (auth) {
    login = auth.login || login;
    user = auth.user || user;
  }
  return { login, user };
}

export default AuthModel;
