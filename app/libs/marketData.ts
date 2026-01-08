// smartoba/app/libs/marketData.ts

export type Product = {
  id: string;
  name: string;
  price: number;
};

export const products: Product[] = [
  { id: "p1", name: "Alma", price: 1.2 },
  { id: "p2", name: "Pomidor", price: 1.5 },
  { id: "p3", name: "Xiyar", price: 1.1 },
  { id: "p4", name: "Yumurta (10 ədəd)", price: 3.9 },
  { id: "p5", name: "Toyuq filesi", price: 9.5 },
  { id: "p6", name: "Şampun", price: 6.2 },
];
