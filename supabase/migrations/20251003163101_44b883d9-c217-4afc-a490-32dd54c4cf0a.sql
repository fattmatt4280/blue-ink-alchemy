-- Fix: Allow public to SELECT approved reviews from customer_reviews table
-- This enables the approved_customer_reviews view to work properly
-- The view itself filters columns to exclude email addresses

CREATE POLICY "Public can view approved reviews only"
  ON customer_reviews
  FOR SELECT
  TO public
  USING (approved = true);