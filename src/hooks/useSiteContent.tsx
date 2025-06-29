
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteContent {
  [key: string]: string;
}

export const useSiteContent = () => {
  const [content, setContent] = useState<SiteContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value');

    if (!error && data) {
      const contentMap = data.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as SiteContent);
      setContent(contentMap);
    }
    setLoading(false);
  };

  return { content, loading, refetch: fetchContent };
};
