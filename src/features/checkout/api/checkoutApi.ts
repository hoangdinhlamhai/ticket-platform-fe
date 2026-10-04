import axiosClient from "../../../api/axiosClient";
import type { AttendeeUser } from "../../auth/types/authContract";

export const getMe = async (): Promise<{ user: AttendeeUser }> => {
  const response = await axiosClient.get<{ user: AttendeeUser }>("/auth/me", {
    withCredentials: true,
  });
  return response.data;
};
