import axiosClient from "../../../api/axiosClient";
import type { AttendeeUser } from "../../auth/types/authContract";

export const getMe = () =>
  axiosClient.get<{ user: AttendeeUser }>("/auth/me");
