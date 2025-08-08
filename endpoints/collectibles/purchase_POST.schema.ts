import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  collectibleTypeId: z.number().int().positive(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: true;
  newPoints: number;
};

// Mock storage for user collectibles
export let mockUserCollectibles: Array<{
  userCollectibleId: number;
  quantity: number;
  purchasedAt: Date;
  collectibleTypeId: number;
  name: string;
  description: string;
  emoji: string;
  cost: number;
}> = [
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

// Mock collectible types
const mockCollectibleTypes = [
  { id: 1, name: "Golden Leaf", description: "A rare golden leaf that sparkles in the sunlight", emoji: "🍂", cost: 50 },
  { id: 2, name: "Crystal Flower", description: "A beautiful crystal flower that never wilts", emoji: "🌸", cost: 75 },
  { id: 3, name: "Rainbow Gem", description: "A colorful gem that changes hues", emoji: "💎", cost: 100 },
  { id: 4, name: "Starlight Orb", description: "A glowing orb that shines like the stars", emoji: "⭐", cost: 150 },
  { id: 5, name: "Mystic Crystal", description: "A powerful crystal with ancient magic", emoji: "🔮", cost: 200 },
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

    return {
      success: true,
      newPoints: 100, // Mock new points value
    };
  }
};