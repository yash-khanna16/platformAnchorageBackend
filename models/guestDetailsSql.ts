// Guest details (name, phone, company, vessel, rank, ID) are stored on each
// booking / log row (guest_name, guest_phone, ...) because the same email is
// often reused for different stays or even different people. The shared
// `guests` row (one per email) is only a fallback for old rows that were never
// filled in (see migrations/2026-10-25_per_booking_guest_details.sql).
//
// `b` is the SQL alias of the bookings/logs row, `g` the alias of the guests row.

export const guestName = (b: string, g: string) => `COALESCE(${b}.guest_name, ${g}.name)`;
export const guestPhone = (b: string, g: string) => `COALESCE(${b}.guest_phone, ${g}.phone)`;
export const guestCompany = (b: string, g: string) => `COALESCE(${b}.guest_company, ${g}.company)`;
export const guestVessel = (b: string, g: string) => `COALESCE(${b}.guest_vessel, ${g}.vessel)`;
export const guestRank = (b: string, g: string) => `COALESCE(${b}.guest_rank, ${g}.rank)`;
export const guestIdNumber = (b: string, g: string) => `COALESCE(${b}.guest_id_number, ${g}.id)`;

// All six, under the column names the frontends already use. When a query
// selects `*` from both tables, put this AFTER the `*` so these values win
// (node-postgres keeps the last column when two share a name).
export const guestDetailColumns = (b: string, g: string) => `
    ${guestName(b, g)} AS name,
    ${guestPhone(b, g)} AS phone,
    ${guestCompany(b, g)} AS company,
    ${guestVessel(b, g)} AS vessel,
    ${guestRank(b, g)} AS rank,
    ${guestIdNumber(b, g)} AS id`;
