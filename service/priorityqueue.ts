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
            throw new Error(`Booking with ID ${bookingId} not found`);
        }
        return this.queue.splice(index, 1)[0];
    }
    public getAllEntries(): BookingData[] {
        console.log(this.queue,"this is queue");
        return this.queue;
    }
}

export const priorityQueue = new PriorityQueue();
