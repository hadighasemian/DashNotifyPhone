import { setAuthState } from "../../redux/authSlice";

function Logout(dispatch) {
  const auth = {
    login: {
      login: false,
      token: "",
    },
    user: {
      id: 0,
      name: "",
      email: "",
      mobile: "",
      role: { id: 0, name: "", title: "" },
    },
  };
  dispatch(setAuthState(auth));
}

export default Logout;
