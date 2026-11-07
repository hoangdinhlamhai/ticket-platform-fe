import axiosClient from "../../../api/axiosClient.ts";
import type { ResaleListing } from "../types/resale";

export type ResaleListingsResponse = { listings: ResaleListing[] };
export type CreateResaleListingPayload = {
  ticketId: string;
  price: number;
  termsAccepted: boolean;
};
export type ResaleListingResponse = { listing: ResaleListing };

export const findResaleListings = () =>
  axiosClient.get<ResaleListingsResponse>("/resale/listings");

export const findMyResaleListings = () =>
  axiosClient.get<ResaleListingsResponse>("/resale/listings/mine");

export const createResaleListingRequest = (data: CreateResaleListingPayload) =>
  axiosClient.post<ResaleListingResponse>("/resale/listings", data);
