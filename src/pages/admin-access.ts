export type AdminAccessInput = {
  readonly status: "restoring" | "anonymous" | "authenticated";
  readonly user: { readonly role: "USER" | "ADMIN" } | null;
  readonly accessToken: string | null;
};

export type AdminAccessState =
  | { readonly kind: "restoring"; readonly message: string }
  | { readonly kind: "not-logged-in"; readonly message: string }
  | { readonly kind: "forbidden"; readonly message: string }
  | { readonly kind: "allowed" };

export function getAdminAccessState(input: AdminAccessInput): AdminAccessState {
  if (input.status === "restoring") {
    return { kind: "restoring", message: "Đang khôi phục phiên đăng nhập..." };
  }
  if (!input.accessToken || input.status !== "authenticated") {
    return { kind: "not-logged-in", message: "Bạn chưa đăng nhập." };
  }
  if (input.user?.role !== "ADMIN") {
    return { kind: "forbidden", message: "Tài khoản không có quyền quản trị." };
  }
  return { kind: "allowed" };
}

export function getPostAuthenticationPath(role: "USER" | "ADMIN") {
  return role === "ADMIN" ? "/admin" : "/";
}
