type BookingData = {
    checkin: Date,
    checkout: Date,
    email: string,
    meal_veg: number,
    meal_non_veg: number,
    remarks: string,
    additional: string,
    room: string,
    name: string,
    phone: number,
    company: string,
    vessel: string,
    rank: string,
    breakfast: number,
    booking_id: string
};

class PriorityQueue {
    private queue: BookingData[];

    constructor() {
        this.queue = [];
    }

    public enqueue(booking: BookingData) {
        this.queue.push(booking);
        this.queue.sort((a, b) => a.checkin.getTime() - b.checkin.getTime());
    }

    public dequeue(): BookingData | undefined {
        return this.queue.shift();
    }

    public peek(): BookingData | undefined {
        return this.queue[0];
    }

    public isEmpty(): boolean {
        return this.queue.length === 0;
    }

    public size(): number {
        return this.queue.length;
    }
    public removeById(bookingId: string): BookingData | undefined {
        const index = this.queue.findIndex(booking => booking.booking_id === bookingId);
        if (index === -1) {
            return ;
        }
        return this.queue.splice(index, 1)[0];
    }
    public getAllEntries(): BookingData[] {
        return this.queue;
    }
}

export const priorityQueue = new PriorityQueue();

type CouponData = {
    coupon_id: string;
    coupon_code: string;
    description: string;
    date_created: Date;
    email: string;
    room: string;
    name: string;
};

class CouponPendingQueue {
    private queue: CouponData[];

    constructor() {
        this.queue = [];
    }

    public enqueue(coupon: CouponData) {
        this.queue.push(coupon);
        this.queue.sort((a, b) => a.date_created.getTime() - b.date_created.getTime());
    }

    public dequeue(): CouponData | undefined {
        return this.queue.shift();
    }

    public peek(): CouponData | undefined {
        return this.queue[0];
    }

    public isEmpty(): boolean {
        return this.queue.length === 0;
    }

    public size(): number {
        return this.queue.length;
    }

    public removeById(couponId: string): CouponData | undefined {
        const index = this.queue.findIndex(coupon => coupon.coupon_id === couponId);
        if (index === -1) {
            return undefined;
        }
        return this.queue.splice(index, 1)[0];
    }

    public getAllEntries(): CouponData[] {
        return this.queue;
    }
}

export const couponPendingQueue = new CouponPendingQueue();
