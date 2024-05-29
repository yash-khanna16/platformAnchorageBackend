export const getAllGuests = "SELECT * FROM guests";

export const getNamedGuests = "SELECT * FROM guests JOIN rooms ON rooms.guest_email = guests.email and guests.name=$1 ; ";

export const getAdmin= "Select * FROM admin where email=$1 and password=$2";
