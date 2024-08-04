export type itemDetailsType = {
  item_id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  category: string;
  time_to_prepare: number;
};

export type orderType = {
  order_id: string;
  booking_id: string;
  room: string;
  remarks: string;
  created_at: string;
  status: string;
  items: {item_id: string; qty: number }[];
};
