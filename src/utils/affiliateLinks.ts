import { supabase } from '@/integrations/supabase/client';

export const generateAffiliateLink = (asin: string, tag: string): string => {
  return `https://www.amazon.com/dp/${asin}?tag=${tag}`;
};

export const getProductsByCategory = async (category: string) => {
  const { data, error } = await supabase
    .from('affiliate_products')
    .select('*')
    .eq('category', category)
    .eq('active', true)
    .order('priority');

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }

  return data || [];
};

export const getProductsForCondition = async (condition: string) => {
  const { data, error } = await supabase
    .from('affiliate_products')
    .select('*')
    .contains('recommended_for', [condition])
    .eq('active', true)
    .order('priority');

  if (error) {
    console.error('Error fetching products for condition:', error);
    return [];
  }

  return data || [];
};

export const getAssociateTag = async (): Promise<string> => {
  const { data, error } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', 'amazon_associate_tag')
    .single();

  if (error) {
    console.error('Error fetching associate tag:', error);
    return '';
  }

  return data?.value || '';
};
