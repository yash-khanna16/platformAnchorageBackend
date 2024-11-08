export type itemDetailsType = {
  item_id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  category: string;
  category_id: string;
  time_to_prepare: number;
  available: boolean
  base_price: number,
  sequence: number,
};

export type orderType = {
  order_id: string;
  booking_id: string;
  room: string;
  remarks: string;
  created_at: string;
  delay: number;
  status: string;
  items: { item_id: string; qty: number }[];
  coupon_id: string;
  email: string;
  discount: number;
};


export type OrderDetails = {
  order_id: string;
  booking_id: string;
  room: string;
  remarks: string;
  created_at: string;
  status: string;
  guest_name: string;
  guest_email: string;
  items: Array<{
    item_id: string;
    name: string;
    description: string;
    price: number;
    qty: number;
    type: string;
    category: string;
    available: boolean;
    time_to_prepare: number;
  }>;
};

export type Coupon = {
  coupon_id: string;
  code: string;
  description: string;
  coupon_type: 'free_item' | 'percentage_discount' | 'flat_discount';
  discount_value: string;
  max_discount: number | null;
  min_order_value: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  is_active: boolean;
  created_at: string | null;
  modified_at: string | null;
  coupon_type_description: string;
  restriction_id: string | null;
  category_id: string;
  is_allowed: boolean | null;
  item_id: string | null;
  user_usage_limit: number | null,
  percentage_discount: number | null;
};

export type FreeItem = {
  coupon_id: string;
  item_id: string;
  qty: number;
  created_at: string | null;
  modified_at: string | null;
  name: string;
  description: string;
  price: number;
  type: string;
  category_id: string;
  category: string;
  available: boolean;
  time_to_prepare: number;
  base_price: number;
};

export type adminCoupon = {
  coupon_id:string;
  code: string;
  description: string;
  coupon_type: 'free_item' | 'percentage_discount' | 'flat_discount';
  discount_value: string|null;
  max_discount: number | null;
  min_order_value: number|null;
  start_date: string;
  end_date: string;
  usage_limit: number|null;
  is_active: boolean;
  created_at: string | null;
  modified_at: string | null;
  coupon_type_description: string;
  restriction_id: string | null;
  user_usage_limit: number | null,
  percentage_discount: number | null;
  free_items: Array<{
    item_id: string;
    qty: number;
  }>;
  applicable_categories: Array<string>;
  applicable_items: Array<{
    item_id: string;
    qty: number;
  }>;
  selectedGuests: Array<{
    booking_id: string;
    email: string;
  }>;
}

