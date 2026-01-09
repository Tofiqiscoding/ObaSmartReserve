// smartoba/app/libs/branches.ts

export type Branch = {
  id: string;
  name: string;
  boxCapacity: number; // filialdakı maksimum box sayı
};

export const branches: Branch[] = [
  { id: "yasamal", name: "Yasamal filialı", boxCapacity: 2 },
  { id: "narimanov", name: "Nərimanov filialı", boxCapacity: 1 },
  { id: "xetai", name: "Xətai filialı", boxCapacity: 0 },
];
