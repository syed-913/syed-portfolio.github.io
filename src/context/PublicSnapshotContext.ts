import { createContext, useContext } from 'react';
import { readPublicSnapshot, type PublicSnapshot } from '../lib/publicSnapshot';

/** The build supplies its snapshot through context; browsers read their page's JSON. */
export const PublicSnapshotContext = createContext<PublicSnapshot | null>(null);
export const usePublicSnapshot = () => useContext(PublicSnapshotContext) ?? readPublicSnapshot();
