import { userClient } from "../../clients/user-client";
import type {
  UserAddressResponse,
  UserAddressUpsert,
  UserProfileResponse,
  UserProfileUpdate,
} from "../types/user.types";

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  return await userClient.get<UserProfileResponse>("profile");
};

export const updateUserProfile = async (
  data: UserProfileUpdate,
): Promise<UserProfileResponse> => {
  return await userClient.patch<UserProfileResponse>("profile", data);
};

export const getUserAddress = async (): Promise<UserAddressResponse> => {
  return await userClient.get<UserAddressResponse>("address");
};

export const upsertUserAddress = async (
  data: UserAddressUpsert,
): Promise<UserAddressResponse> => {
  return await userClient.put<UserAddressResponse>("address", data);
};
