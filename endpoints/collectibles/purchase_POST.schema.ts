import { z } from "zod";
import superjson from 'superjson';
import { mockUserProgress } from '../user-progress_GET.schema';
import { persistence } from '../../helpers/persistence';

export const schema = z.object({
  collectibleTypeId: z.number().int().positive(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: true;
  newPoints: number;
};

// Mock storage for user collectibles - load from localStorage on initialization
export let mockUserCollectibles: Array<{
  userCollectibleId: number;
  quantity: number;
  purchasedAt: Date;
  collectibleTypeId: number;
  name: string;
  description: string;
  emoji: string;
  cost: number;
}> = persistence.loadCollectibles() || [
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

// Mock collectible types - must match the shop items exactly
const mockCollectibleTypes = [
  { id: 1, name: "Golden Leaf", description: "A rare golden leaf that sparkles in the sunlight", emoji: "🍂", cost: 50 },
  { id: 2, name: "Crystal Flower", description: "A beautiful crystal flower that never wilts", emoji: "🌸", cost: 75 },
  { id: 3, name: "Rainbow Butterfly", description: "A magical butterfly with rainbow wings", emoji: "🦋", cost: 100 },
  { id: 4, name: "Starlight Tree", description: "A tree that glows with starlight at night", emoji: "🌳", cost: 150 },
  { id: 5, name: "Moonstone", description: "A precious stone that glows with moonlight", emoji: "💎", cost: 200 },
];

export const postCollectiblesPurchase = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
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

    // Check if user already has this collectible
    const existingCollectible = mockUserCollectibles.find(
      item => item.collectibleTypeId === validatedInput.collectibleTypeId
    );

    if (existingCollectible) {
      // Increase quantity
      existingCollectible.quantity += 1;
      console.log(`Increased quantity of ${collectibleType.name} to ${existingCollectible.quantity}`);
    } else {
      // Add new collectible to inventory
      const newCollectible = {
        userCollectibleId: mockUserCollectibles.length + 1,
        quantity: 1,
        purchasedAt: new Date(),
        collectibleTypeId: validatedInput.collectibleTypeId,
        name: collectibleType.name,
        description: collectibleType.description,
        emoji: collectibleType.emoji,
        cost: collectibleType.cost,
      };
      mockUserCollectibles.push(newCollectible);
      console.log(`Added ${collectibleType.name} to inventory`);
    }
    
    // Save to localStorage
    persistence.saveCollectibles(mockUserCollectibles);

    // Deduct the cost from user's Kaiblooms
    const currentKaiblooms = mockUserProgress.kaibloomsPoints;
    const newKaiblooms = currentKaiblooms - collectibleType.cost;
    
    if (newKaiblooms < 0) {
      throw new Error('Not enough Kaiblooms to purchase this item');
    }
    
    // Update the user's Kaiblooms
    mockUserProgress.kaibloomsPoints = newKaiblooms;
    mockUserProgress.updatedAt = new Date();
    
    // Save to localStorage
    persistence.saveUserProgress(mockUserProgress);
    
    console.log(`Deducted ${collectibleType.cost} Kaiblooms for ${collectibleType.name}. New balance: ${newKaiblooms}`);

    return {
      success: true,
      newPoints: newKaiblooms,
    };
  }
};