
export type Product = {
  id: string;
  name: string;
  price: number;
  image: string; 
};

export const products: Product[] = [
  { id: "p1", name: "Alma", price: 1.2, image: "/products/apple.jpg" },
  { id: "p2", name: "Pomidor", price: 1.5, image: "/products/tomato.jpg" },
  { id: "p3", name: "Xiyar", price: 1.1, image: "/products/cucumber.jpg" },
  { id: "p4", name: "Yumurta (10 ədəd)", price: 3.9, image: "/products/egg.jpg" },
  { id: "p5", name: "Toyuq filesi", price: 9.5, image: "/products/chicken_breast.jpg" },
  { id: "p6", name: "Şampun", price: 6.2, image: "/products/shampoo.jpg" },
];
