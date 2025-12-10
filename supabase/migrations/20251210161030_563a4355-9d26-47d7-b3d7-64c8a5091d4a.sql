-- Create function to anonymize customer email after review approval
CREATE OR REPLACE FUNCTION public.anonymize_approved_review()
RETURNS TRIGGER AS $$
BEGIN
  -- Only anonymize when transitioning from unapproved to approved
  IF NEW.approved = TRUE AND (OLD.approved = FALSE OR OLD.approved IS NULL) THEN
    NEW.email = 'reviewed@anonymous.local';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-anonymize emails on approval
DROP TRIGGER IF EXISTS anonymize_review_on_approval ON customer_reviews;
CREATE TRIGGER anonymize_review_on_approval
  BEFORE UPDATE ON customer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.anonymize_approved_review();