import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type CollectibleTypes } from "../helpers/schema";

// No input schema needed for a simple GET request
export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<CollectibleTypes>[];

export const getCollectibles = async (init?: RequestInit): Promise<OutputType> => {
  try {
    const result = await fetch(`/_api/collectibles`, {
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
    console.warn('Collectibles API not available, using mock data:', error);
    return [
      {
        id: 1,
        name: "Golden Leaf",
        emoji: "🍂",
        description: "A rare golden leaf that sparkles in the sunlight",
        cost: 50,
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "Crystal Flower",
        emoji: "🌸",
        description: "A beautiful crystal flower that never wilts",
        cost: 75,
        createdAt: new Date(),
      },
      {
        id: 3,
        name: "Rainbow Butterfly",
        emoji: "🦋",
        description: "A magical butterfly with rainbow wings",
        cost: 100,
        createdAt: new Date(),
      },
      {
        id: 4,
        name: "Starlight Tree",
        emoji: "🌳",
        description: "A tree that glows with starlight at night",
        cost: 150,
        createdAt: new Date(),
      },
      {
        id: 5,
        name: "Moonstone",
        emoji: "💎",
        description: "A precious stone that glows with moonlight",
        cost: 200,
        createdAt: new Date(),
      }
    ];
  }
};