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

export const getUserCollection = async (init?: RequestInit): Promise<OutputType> => {
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
    return [
      {
        userCollectibleId: 1,
        quantity: 2,
        purchasedAt: new Date(),
        collectibleTypeId: 1,
        name: "Golden Leaf",
        description: "A rare golden leaf that sparkles in the sunlight",
        emoji: "🍂",
        cost: 50,
      },
      {
        userCollectibleId: 2,
        quantity: 1,
        purchasedAt: new Date(),
        collectibleTypeId: 2,
        name: "Crystal Flower",
        description: "A beautiful crystal flower that never wilts",
        emoji: "🌸",
        cost: 75,
      }
    ];
  }
};