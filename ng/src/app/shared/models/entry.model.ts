export interface Entry {
  id: number;
  title: string;
  date: string;
  twitterIds: number[];
  body: string;
  tags: string;
  views: number[];
  isPublished: boolean;
  isDeleted: boolean;
}
