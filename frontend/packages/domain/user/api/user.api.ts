import { userClient } from "../../clients/user-client";
import type {
  UserAddress,
  UserAddressResponse,
  UserAddressUpsert,
  UserProfile,
  UserProfileResponse,
  UserProfileUpdate,
} from "../types/user.types";

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  return await userClient.get<UserProfile>("profile");
};

export const updateUserProfile = async (
  data: UserProfileUpdate,
): Promise<UserProfileResponse> => {
  return await userClient.patch<UserProfile, UserProfileUpdate>("profile", data);
};

export const getUserAddress = async (): Promise<UserAddressResponse> => {
  return await userClient.get<UserAddress>("address");
};

export const upsertUserAddress = async (
  data: UserAddressUpsert,
): Promise<UserAddressResponse> => {
  return await userClient.put<UserAddress, UserAddressUpsert>("address", data);
};
