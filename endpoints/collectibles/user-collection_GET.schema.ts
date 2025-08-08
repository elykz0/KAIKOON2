import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type CollectibleTypes, type UserCollectibles } from "../../helpers/schema";

// No input schema needed for a simple GET request
export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

// The output is a join of UserCollectibles and CollectibleTypes
export type UserCollectionItem = {
  userCollectibleId: Selectable<UserCollectibles>['id'];
  quantity: Selectable<UserCollectibles>['quantity'];
  purchasedAt: Selectable<UserCollectibles>['purchasedAt'];
  collectibleTypeId: Selectable<CollectibleTypes>['id'];
  name: Selectable<CollectibleTypes>['name'];
  description: Selectable<CollectibleTypes>['description'];
  emoji: Selectable<CollectibleTypes>['emoji'];
  cost: Selectable<CollectibleTypes>['cost'];
};

export type OutputType = UserCollectionItem[];

// Import the mock storage functions from purchase endpoint
import { getMockUserCollectiblesForUser } from './purchase_POST.schema';

export const getUserCollection = async (init?: RequestInit, userId?: number): Promise<OutputType> => {
  try {
    const result = await fetch(`/_api/collectibles/user-collection`, {
      method: "GET",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!result.ok) {
      const errorObject = superjson.parse(await result.text());
      const errorMessage = typeof errorObject === 'object' && errorObject !== null && 'error' in errorObject && typeof errorObject.error === 'string' 
        ? errorObject.error 
        : 'An unknown error occurred';
      throw new Error(errorMessage);
    }
    return superjson.parse<OutputType>(await result.text());
  } catch (error) {
    // Return mock data when API is not available
    console.warn('User collection API not available, using mock data:', error);
    const userCollectibles = getMockUserCollectiblesForUser(userId);
    return userCollectibles;
  }
};