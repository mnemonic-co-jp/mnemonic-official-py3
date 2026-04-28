export interface Entry {
  id: number;
  title: string;
  date: string;
  tweetIds: string[];
  body: string;
  tags: string[];
  previous?: {
    id: number;
    title: string;
  };
  next?: {
    id: number;
    title: string;
  };
  isPublished?: boolean;
  isDeleted?: boolean;
}

export interface EntryPayload {
  id?: number;
  title: string;
  date: string;
  tweetIds: string[];
  body: string;
  tags: string[];
  isPublished: boolean;
}
