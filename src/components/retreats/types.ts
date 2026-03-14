export interface RetreatItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity?: number;
  duration?: string;
  image: string;
  tags?: string[];
  slug?: string;
}

export interface FeaturedRetreatData extends RetreatItem {
  time?: string;
}
