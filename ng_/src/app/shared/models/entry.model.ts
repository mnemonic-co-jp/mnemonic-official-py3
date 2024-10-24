export interface Entry {
  id: number;
  title: string;
  date: string;
  tweetIds: string[];
  body: string;
  tags: string;
  views: number[];
  previous: {
    id: number;
    title: string;
  } | null;
  next: {
    id: number;
    title: string;
  } | null;
  isPublished: boolean;
  isDeleted: boolean;
}
