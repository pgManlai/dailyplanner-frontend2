// Storage stub - using external backend
export interface IStorage {
  getUser(id: string): Promise<any>;
  upsertUser(user: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) {
    return null;
  }

  async upsertUser(user: any) {
    return user;
  }
}

export const storage = new DatabaseStorage();
