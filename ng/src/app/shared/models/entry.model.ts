export interface Entry {
  id: number;
  title: string;
  date: string;
  tweetIds: string[];
  body: string;
  tags: string;
  views: number[];
  isPublished: boolean;
  isDeleted: boolean;
}
