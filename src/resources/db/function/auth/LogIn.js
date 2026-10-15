import { setAuthState } from "../../redux/authSlice";

/**
 * Normalize various Sanctum/API login payloads into the persisted auth slice.
 * Accepts:
 *  - { token, user }
 *  - { data: { token, user } }
 *  - { data: { authState: {...} } }  (legacy template)
 */
export function normalizeAuthPayload(raw) {
  if (!raw) return null;
  if (raw.login && raw.user) return raw;

  const data = raw.data || raw;
  if (data.authState) return data.authState;

  const token =
    data.token ||
    data.access_token ||
    data.plainTextToken ||
    data?.token?.plainTextToken ||
    "";
  const user = data.user || data.admin || {};

  const roleTitle =
    typeof user.role === "string"
      ? user.role
      : user.role?.title || user.role?.name || "admin";

  return {
    login: {
      login: true,
      token: String(token),
    },
    user: {
      id: user.id || 0,
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || user.email || "",
      role: {
        id: user.role?.id || 1,
        name: typeof user.role === "string" ? user.role : user.role?.name || "admin",
        title: roleTitle,
      },
    },
  };
}

function LogIn(dispatch, auth) {
  const normalized = normalizeAuthPayload(auth) || auth;
  dispatch(setAuthState(normalized));
}

export default LogIn;
