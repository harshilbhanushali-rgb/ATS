import { Metadata } from '../types';

export const updateMetadata = (
  existingMetadata: Metadata | undefined,
  userId: string
): Metadata => {
  const now = new Date().toISOString();
  if (!existingMetadata) {
    return {
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      lastModifiedBy: userId,
    };
  }
  return {
    ...existingMetadata,
    updatedAt: now,
    lastModifiedBy: userId,
  };
};
