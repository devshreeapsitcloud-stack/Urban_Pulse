# Urban Pulse Firestore Security Specification

## 1. Data Invariants
- A `User` profile must belong to the authenticated user (`uid == request.auth.uid`).
- A `Booking` must have a valid `user_id` matching the authenticated user.
- A `Booking` must reference an existing `parking_id`.
- `ParkingSpot` availability cannot exceed `total_spots` and cannot be negative.
- Timestamp fields (`createdAt`, `updatedAt`) must be set using `request.time`.

## 2. The Dirty Dozen Payloads (Targeted for Permission Denied)
1. **Identity Spoofing**: Creating a user profile with a different UID.
2. **PII Breach**: User A trying to read User B's private profile.
3. **Price Manipulation**: Updating a booking's `total_price` to 0.
4. **Booking Hijack**: Reading or deleting another user's booking.
5. **Over-capacity**: Setting `available_spots` > `total_spots`.
6. **Negative Availability**: Setting `available_spots` < 0.
7. **Ghost Update**: Adding a field `is_admin: true` to a user profile.
8. **Time Travel**: Setting `start_time` in the past.
9. **Role Escalation**: Attempting to write to a hypothetical `admins` collection.
10. **Parking Vandalism**: Deleting a `parking_spot` as a regular user.
11. **Shadow Move**: Changing the `user_id` of an existing booking.
12. **Spam IDs**: Using a 2KB string as a document ID.

## 3. Test Runner
(I will implement `firestore.rules.test.ts` later if needed, but for now I'll focus on the rules themselves).
