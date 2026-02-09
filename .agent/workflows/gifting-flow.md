---
description: Technical workflow for the Flutterwave gifting integration
---

This workflow describes the end-to-end process for a guest sending a financial gift to an event host.

### Phase 1: Initiation
1. **Host Email Retrieval**: The frontend calls the `get_event_with_host_email` RPC to fetch the event creator's email (required for Flutterwave transactions).
2. **User Interaction**: The guest enters the amount and message on the `GuestUpload` page.
3. **Payment Link Generation**:
   - Frontend calls the `flutterwave-payment` Edge Function.
   - Frontend stores the `finalAmount` in `localStorage` as `pending_gift_amount_[shareCode]`.
   - The Edge Function requests a payment link from Flutterwave v3 API, passing `eventId` and `message` in the `meta` object.
4. **Redirect**: The frontend redirects the guest to the Flutterwave checkout page.

### Phase 2: Payment
1. **Third-Party Checkout**: The guest completes the payment securely on Flutterwave's site.
2. **Callback**: Flutterwave redirects the guest back to the `GuestUpload` page with `transaction_id` and `status=successful` in the URL parameters.

### Phase 3: Verification & Recording
1. **Detection**: The `fetchEventAndFeed` effect in `GuestUpload.tsx` detects the `transaction_id`.
2. **Verification Call**:
   - Frontend retrieves the expected amount from `localStorage`.
   - Frontend calls the `flutterwave-verify` Edge Function with the `transaction_id` and `expected_amount`.
3. **Server-Side Confirmation**:
   - `flutterwave-verify` calls the Flutterwave API to confirm the transaction status and amount.
   - Upon success, it inserts a new record into the `gifts` table with status `successful`.
4. **Completion**: The frontend displays a success toast, triggers confetti, and clears the URL parameters.

### Phase 4: Display
1. **Realtime Updates**: (Optional/Planned) The live feed reflects the new gift once it appears in the `gifts` table.
