import { z } from "zod";
import superjson from 'superjson';
import { getMockUserProgressForUser, saveMockUserProgressForUser } from '../user-progress_GET.schema';
import { persistence } from '../../helpers/persistence';

export const schema = z.object({
  collectibleTypeId: z.number().int().positive(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: true;
  newPoints: number;
};

// Function to get mock collectibles for a specific user
export const getMockUserCollectiblesForUser = (userId?: number): Array<{
  userCollectibleId: number;
  quantity: number;
  purchasedAt: Date;
  collectibleTypeId: number;
  name: string;
  description: string;
  emoji: string;
  cost: number;
}> => {
  return persistence.loadCollectibles(userId) || [
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
};

// Function to save mock collectibles for a specific user
export const saveMockUserCollectiblesForUser = (collectibles: Array<{
  userCollectibleId: number;
  quantity: number;
  purchasedAt: Date;
  collectibleTypeId: number;
  name: string;
  description: string;
  emoji: string;
  cost: number;
}>, userId?: number) => {
  persistence.saveCollectibles(collectibles, userId);
};

// Mock collectible types - must match the shop items exactly
const mockCollectibleTypes = [
  { id: 1, name: "Golden Leaf", description: "A rare golden leaf that sparkles in the sunlight", emoji: "🍂", cost: 50 },
  { id: 2, name: "Crystal Flower", description: "A beautiful crystal flower that never wilts", emoji: "🌸", cost: 75 },
  { id: 3, name: "Rainbow Butterfly", description: "A magical butterfly with rainbow wings", emoji: "🦋", cost: 100 },
  { id: 4, name: "Starlight Tree", description: "A tree that glows with starlight at night", emoji: "🌳", cost: 150 },
  { id: 5, name: "Moonstone", description: "A precious stone that glows with moonlight", emoji: "💎", cost: 200 },
];

export const postCollectiblesPurchase = async (body: InputType, init?: RequestInit, userId?: number): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  try {
    const result = await fetch(`/_api/collectibles/purchase`, {
      method: "POST",
      body: superjson.stringify(validatedInput),
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
    // Mock purchase logic
    console.warn('Purchase API not available, using mock data:', error);
    
    const collectibleType = mockCollectibleTypes.find(type => type.id === validatedInput.collectibleTypeId);
    if (!collectibleType) {
      throw new Error('Collectible type not found');
    }

    // Get user-specific collectibles
    const userCollectibles = getMockUserCollectiblesForUser(userId);
    
    // Check if user already has this collectible
    const existingCollectible = userCollectibles.find(
      item => item.collectibleTypeId === validatedInput.collectibleTypeId
    );

    if (existingCollectible) {
      // Increase quantity
      existingCollectible.quantity += 1;
      console.log(`Increased quantity of ${collectibleType.name} to ${existingCollectible.quantity} for user:`, userId);
    } else {
      // Add new collectible to inventory
      const newCollectible = {
        userCollectibleId: userCollectibles.length + 1,
        quantity: 1,
        purchasedAt: new Date(),
        collectibleTypeId: validatedInput.collectibleTypeId,
        name: collectibleType.name,
        description: collectibleType.description,
        emoji: collectibleType.emoji,
        cost: collectibleType.cost,
      };
      userCollectibles.push(newCollectible);
      console.log(`Added ${collectibleType.name} to inventory for user:`, userId);
    }
    
    // Save to localStorage with user-specific key
    saveMockUserCollectiblesForUser(userCollectibles, userId);

    // Get current user progress and deduct the cost from user's Kaiblooms
    const currentProgress = getMockUserProgressForUser(userId);
    const currentKaiblooms = currentProgress.kaibloomsPoints;
    const newKaiblooms = currentKaiblooms - collectibleType.cost;
    
    if (newKaiblooms < 0) {
      throw new Error('Not enough Kaiblooms to purchase this item');
    }
    
    // Update the user's Kaiblooms
    const updatedProgress = {
      ...currentProgress,
      kaibloomsPoints: newKaiblooms,
      updatedAt: new Date(),
    };
    
    // Save to localStorage with user-specific key
    saveMockUserProgressForUser(updatedProgress, userId);
    
    console.log(`Deducted ${collectibleType.cost} Kaiblooms for ${collectibleType.name} for user ${userId}. New balance: ${newKaiblooms}`);

    return {
      success: true,
      newPoints: newKaiblooms,
    };
  }
};