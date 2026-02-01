export interface Property {
    id: number;
    title: string;
    description: string;
    price: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
    owner: string;
    image: string | null;
    images: { id: number; image: string }[];
}
