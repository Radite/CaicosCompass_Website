export interface Activity {
  _id: string;
  name: string;
  location: string;
  island: string;
  price?: number;
  options?: { cost: number }[];
  category?: string;
  images?: { url: string; isMain?: boolean }[];
  reviews?: { rating: number }[];
}

export const fetchActivities = async (): Promise<Activity[]> => {
  try {
    const res = await fetch("`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/`services/type/activities");
    if (!res.ok) throw new Error("Failed to fetch activities");
    return await res.json();
  } catch (err) {
    console.error("Error fetching activities:", err);
    return [];
  }
};
