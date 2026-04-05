import stringSimilarity from 'string-similarity';
import { Recipe } from './objects';

export const extractRecipeNames = (recipes: Recipe[]): string[] => {
  return recipes.map((recipe) => recipe.name);
};

export const getSimilarity = (a: string, b: string): number => {
  if (a === '' && b === '') return 1.0;
  if (a === '' || b === '') return 0.0;

  try {
    return stringSimilarity.compareTwoStrings(a, b);
  } catch (e) {
    return simpleStringSimilarity(a,b);
  }
};

export const simpleStringSimilarity = (a: string, b: string): number => {
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0 || lenB === 0) return 0.0;

  let matches = 0;
  for (let i = 0; i < Math.min(lenA, lenB); i++) {
    if (a[i].toLowerCase() === b[i].toLowerCase()) {
      matches++;
    }
  }

  return matches / ((lenA + lenB) / 2.0);
};

export const stringCompare = (a: string, b: string): number => {
  if (a === '' && b === '') return 1.0;
  if (a === '' || b === '') return 0.0;

  const similarity = getSimilarity(a, b);
  return Math.max(0.0, Math.min(1.0, similarity));
};

export const sortStringsBySimilarity = (
  strings: string[],
  targetString: string
): string[] => {
  if (strings.length === 0 || targetString === '') return [];

  const scoredStrings = strings.map((str) => ({
    value: str,
    similarity: stringCompare(str, targetString),
  }));

  scoredStrings.sort((a, b) => b.similarity - a.similarity);

  return scoredStrings.map((item) => item.value);
};

export const getIfEmpty = (input: string): boolean => {
  if (input.length === 0) return true;

  const list_of_chars = [
    ' ', '!', '"', '#', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?',
    '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[', '\\', ']', '^', '_',
    '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
    'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '{', '|', '}', '~'
  ];

  for (let i = 0; i < list_of_chars.length; i++) {
    if (input.includes(list_of_chars[i])) {
      return false;
    }
  }
  return true;
};

export const processFoodSectionName = (name: string): string => {
  let buffer = name.replace(/_/g, ' ').split(' ');
  
  buffer = buffer.map((word) => {
    if (word.length > 0) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word;
  });

  return buffer.join(' ');
};