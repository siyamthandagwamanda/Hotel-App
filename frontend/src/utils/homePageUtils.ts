import type { Shelf } from '../slices/hotelSlices.js';

interface DeckPageDefinition {
  id: string;
  title: string;
  shelfIds: string[];
}

export interface DeckPageData {
  id: string;
  title: string;
  shelves: Shelf[];
}

export interface DeckChip {
  id: string;
  label: string;
  pageId: string;
}

const deckPageDefinitions: DeckPageDefinition[] = [
  { id: 'discover', title: 'Discover', shelfIds: ['near-you', 'top-rated', 'best-value'] },
  { id: 'plan', title: 'Plan a trip', shelfIds: ['beach', 'city', 'safari'] },
  { id: 'smart', title: 'Smart picks', shelfIds: ['under-1000', 'pet-friendly'] },
];

export const deckChips: DeckChip[] = [
  { id: 'for-you', label: 'For you', pageId: 'discover' },
  { id: 'beach', label: 'Beach', pageId: 'plan' },
  { id: 'city', label: 'City', pageId: 'plan' },
  { id: 'safari', label: 'Safari', pageId: 'plan' },
  { id: 'budget', label: 'Under R1000', pageId: 'smart' },
  { id: 'pets', label: 'Pet friendly', pageId: 'smart' },
];


export function buildDeckPages(shelves: Shelf[]): DeckPageData[] {
  const pages: DeckPageData[] = [];

  for (const definition of deckPageDefinitions) {
    const pageShelves: Shelf[] = [];
    
    for (const shelfId of definition.shelfIds) {
     
      const found = shelves.find((shelf) => shelf.id === shelfId);
      if (found !== undefined) {
        pageShelves.push(found);
      }
    }
    
    if (pageShelves.length > 0) {
      pages.push({
        id: definition.id,
        title: definition.title,
        shelves: pageShelves,
      });
    }
  }

  return pages;
}
