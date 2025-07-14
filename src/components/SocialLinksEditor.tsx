import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const socialPlatforms = [
  {
    key: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    placeholder: 'https://www.tiktok.com/@username'
  },
  {
    key: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    placeholder: 'https://www.instagram.com/username'
  },
  {
    key: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    placeholder: 'https://www.facebook.com/username'
  },
  {
    key: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    placeholder: 'https://twitter.com/username'
  },
  {
    key: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    placeholder: 'https://www.youtube.com/@username'
  }
];

const SocialLinksEditor = () => {
  const { content, loading, refetch } = useSiteContent();
  const { toast } = useToast();
  const [socialData, setSocialData] = useState<{[key: string]: any}>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content) {
      const data: {[key: string]: any} = {};
      socialPlatforms.forEach(platform => {
        data[platform.key] = {
          name: content[`social_${platform.key}_name`] || platform.name,
          url: content[`social_${platform.key}_url`] || '',
          enabled: content[`social_${platform.key}_enabled`] === 'true'
        };
      });
      data.social_links_enabled = content.social_links_enabled === 'true';
      setSocialData(data);
    }
  }, [content]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [];
      
      // Add overall social links enabled setting
      updates.push({
        key: 'social_links_enabled',
        value: socialData.social_links_enabled ? 'true' : 'false',
        type: 'boolean'
      });

      // Add each platform's data
      socialPlatforms.forEach(platform => {
        const platformData = socialData[platform.key] || {};
        updates.push(
          {
            key: `social_${platform.key}_name`,
            value: platformData.name || platform.name,
            type: 'text'
          },
          {
            key: `social_${platform.key}_url`,
            value: platformData.url || '',
            type: 'text'
          },
          {
            key: `social_${platform.key}_enabled`,
            value: platformData.enabled ? 'true' : 'false',
            type: 'boolean'
          }
        );
      });

      // Save all updates
      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert(update, { onConflict: 'key' });
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Social links updated successfully",
      });
      
      refetch();
    } catch (error) {
      console.error('Error saving social links:', error);
      toast({
        title: "Error",
        description: "Failed to update social links",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSocialData = (key: string, field: string, value: any) => {
    setSocialData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            checked={socialData.social_links_enabled || false}
            onCheckedChange={(checked) => 
              setSocialData(prev => ({...prev, social_links_enabled: checked}))
            }
          />
          <Label>Enable Social Links</Label>
        </div>

        <Separator />

        {socialPlatforms.map((platform) => {
          const platformData = socialData[platform.key] || {};
          const IconComponent = platform.icon;
          
          return (
            <div key={platform.key} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                {typeof IconComponent === 'string' ? (
                  <span className="text-xl">{IconComponent}</span>
                ) : (
                  <IconComponent className="w-5 h-5" />
                )}
                <h3 className="text-lg font-medium">{platform.name}</h3>
                <Switch
                  checked={platformData.enabled || false}
                  onCheckedChange={(checked) => 
                    updateSocialData(platform.key, 'enabled', checked)
                  }
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`${platform.key}-name`}>Display Name</Label>
                  <Input
                    id={`${platform.key}-name`}
                    value={platformData.name || platform.name}
                    onChange={(e) => 
                      updateSocialData(platform.key, 'name', e.target.value)
                    }
                    placeholder={platform.name}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`${platform.key}-url`}>URL</Label>
                  <Input
                    id={`${platform.key}-url`}
                    value={platformData.url || ''}
                    onChange={(e) => 
                      updateSocialData(platform.key, 'url', e.target.value)
                    }
                    placeholder={platform.placeholder}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Social Links"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SocialLinksEditor;