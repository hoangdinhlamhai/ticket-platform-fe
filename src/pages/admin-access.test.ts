import test from "node:test";
import assert from "node:assert/strict";
import {
  getAdminAccessState,
  getPostAuthenticationPath,
} from "./admin-access.ts";

test("reports not logged in when Admin has no access token", () => {
  assert.deepEqual(
    getAdminAccessState({ status: "anonymous", user: null, accessToken: null }),
    {
      kind: "not-logged-in",
      message: "Bạn chưa đăng nhập.",
    },
  );
});

test("reports restoring while the session is being restored", () => {
  assert.deepEqual(
    getAdminAccessState({ status: "restoring", user: null, accessToken: null }),
    {
      kind: "restoring",
      message: "Đang khôi phục phiên đăng nhập...",
    },
  );
});

test("reports forbidden for an authenticated non-admin", () => {
  assert.deepEqual(
    getAdminAccessState({
      status: "authenticated",
      user: { role: "USER" },
      accessToken: "token",
    }),
    {
      kind: "forbidden",
      message: "Tài khoản không có quyền quản trị.",
    },
  );
});

test("allows an authenticated admin", () => {
  assert.deepEqual(
    getAdminAccessState({
      status: "authenticated",
      user: { role: "ADMIN" },
      accessToken: "token",
    }),
    {
      kind: "allowed",
    },
  );
});

test("redirects admins to the Admin workspace after login", () => {
  assert.equal(getPostAuthenticationPath("ADMIN"), "/admin");
});

test("redirects regular users to the attendee home after login", () => {
  assert.equal(getPostAuthenticationPath("USER"), "/");
});
