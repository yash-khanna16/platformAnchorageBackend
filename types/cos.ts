export type itemDetailsType = {
  item_id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  category: string;
};

export type orderType = {
  order_id: string;
  booking_id: string;
  room: string;
  remarks: string;
  created_at: Date;
  status: string;
  items: {item_id: string; qty: number }[];
};
