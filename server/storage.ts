import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface PageConfig {
  id: string;
  name: string;
  facebookPageId: string;
  accessToken: string;
  addedAt: string;
}

export interface BotConfig {
  openRouterApiKey: string | null;
  openRouterModel: string | null;
  imageApiKey: string | null;
  imageApiUrl: string | null;
  imageModel: string | null;
  verifyToken: string | null;
  pages: PageConfig[];
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getBotConfig(): Promise<BotConfig>;
  updateBotConfig(updates: Partial<Omit<BotConfig, "pages">>): Promise<BotConfig>;
  addPage(page: PageConfig): Promise<BotConfig>;
  removePage(id: string): Promise<BotConfig>;
  getPages(): Promise<PageConfig[]>;
  getPageByFacebookId(facebookPageId: string): Promise<PageConfig | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private botConfig: BotConfig = {
    openRouterApiKey: process.env.OPENROUTER_API_KEY || null,
    openRouterModel: "stepfun/step-3.5-flash:free",
    imageApiKey: null,
    imageApiUrl: null,
    imageModel: null,
    verifyToken: process.env.VERIFY_TOKEN || null,
    pages: [],
  };

  constructor() {
    this.users = new Map();
    if (process.env.PAGE_ACCESS_TOKEN) {
      const pageEntry = {
        id: randomUUID(),
        name: "Default Page",
        facebookPageId: "",
        accessToken: process.env.PAGE_ACCESS_TOKEN,
        addedAt: new Date().toISOString(),
      };
      this.botConfig.pages.push(pageEntry);

      fetch(`https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${process.env.PAGE_ACCESS_TOKEN}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.id) {
            pageEntry.facebookPageId = data.id;
            if (data.name) pageEntry.name = data.name;
          }
        })
        .catch(() => {});
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBotConfig(): Promise<BotConfig> {
    return { ...this.botConfig, pages: [...this.botConfig.pages] };
  }

  async updateBotConfig(updates: Partial<Omit<BotConfig, "pages">>): Promise<BotConfig> {
    this.botConfig = { ...this.botConfig, ...updates };
    return { ...this.botConfig, pages: [...this.botConfig.pages] };
  }

  async addPage(page: PageConfig): Promise<BotConfig> {
    if (this.botConfig.pages.length >= 15) {
      throw new Error("Maximum of 15 pages reached");
    }
    this.botConfig.pages.push(page);
    return { ...this.botConfig, pages: [...this.botConfig.pages] };
  }

  async removePage(id: string): Promise<BotConfig> {
    this.botConfig.pages = this.botConfig.pages.filter(p => p.id !== id);
    return { ...this.botConfig, pages: [...this.botConfig.pages] };
  }

  async getPages(): Promise<PageConfig[]> {
    return [...this.botConfig.pages];
  }

  async getPageByFacebookId(facebookPageId: string): Promise<PageConfig | undefined> {
    return this.botConfig.pages.find(p => p.facebookPageId === facebookPageId);
  }
}

export const storage = new MemStorage();
