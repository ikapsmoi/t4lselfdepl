/*
  # Create Payments Table

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key to bookings)
      - `traveler_id` (uuid, foreign key to users)
      - `amount` (decimal)
      - `currency` (enum)
      - `gateway` (enum)
      - `status` (enum)
      - `escrow_release_date` (date)
      - `transaction_ref` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `payments` table
    - Add policies for travelers and payment processing
*/

-- Create enums
CREATE TYPE currency_type AS ENUM ('INR', 'USD');
CREATE TYPE payment_gateway AS ENUM ('Razorpay', 'Stripe', 'PayPal');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  traveler_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  currency currency_type NOT NULL DEFAULT 'USD',
  gateway payment_gateway NOT NULL,
  status payment_status DEFAULT 'pending',
  escrow_release_date date,
  transaction_ref text,
  gateway_payment_id text,
  gateway_response jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Travelers can read their payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = traveler_id);

CREATE POLICY "Service role can manage all payments"
  ON payments
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_traveler_id ON payments(traveler_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_gateway ON payments(gateway);
CREATE INDEX idx_payments_transaction_ref ON payments(transaction_ref);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Create updated_at trigger
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint to bookings table
ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_payment_id 
FOREIGN KEY (payment_id) REFERENCES payments(id);