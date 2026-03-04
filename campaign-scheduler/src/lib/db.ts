import { insforge } from "./insforge";

// Export the insforge database client as 'db' to maintain compatibility where needed, 
// or simply use the insforge object directly.
export const db = insforge.database;
