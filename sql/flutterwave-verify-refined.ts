import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const flwSecretKey = Deno.env.get('FLW_SECRET_KEY') ?? ''

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { transaction_id, expected_amount } = await req.json()

        if (!transaction_id) {
            throw new Error('Transaction ID is required')
        }

        // 1. Verify specific transaction
        const response = await fetch(
            `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${flwSecretKey}`,
                },
            }
        )

        const flwData = await response.json()

        if (flwData.status !== 'success') {
            throw new Error('Transaction not found on Flutterwave')
        }

        const { status, amount, currency, tx_ref, meta, customer } = flwData.data

        // 2. Validate payment status and amount
        if (status === 'successful' && amount >= expected_amount) {

            // 3. Update the 'gifts' table (the dedicated table for this feature)
            const { error: dbError } = await supabase
                .from('gifts')
                .insert([
                    {
                        event_id: meta.eventId,
                        sender_id: meta.consumer_id !== 'guest_user' ? meta.consumer_id : null,
                        guest_name: customer.name,
                        amount: amount,
                        currency: currency,
                        message: meta.message,
                        payment_ref: tx_ref,
                        status: 'successful'
                    }
                ])

            if (dbError) {
                console.error('DB Error:', dbError)
                throw new Error('Payment verified but failed to save to database')
            }

            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Gift recorded successfully',
                    data: flwData.data
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        } else {
            throw new Error(`Verification failed: Expected ${expected_amount}, got ${amount}. Status: ${status}`)
        }

    } catch (error) {
        console.error('Verify Function Error:', error.message)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
