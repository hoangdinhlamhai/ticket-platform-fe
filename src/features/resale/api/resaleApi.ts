import axiosClient from '../../../api/axiosClient.ts'
import type { ResaleListing } from '../types/resale'

export type ResaleListingsResponse = { listings: ResaleListing[] }

export const findResaleListings = () =>
  axiosClient.get<ResaleListingsResponse>('/resale/listings')
