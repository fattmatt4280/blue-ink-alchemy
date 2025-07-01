
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Plus, Trash2 } from 'lucide-react';

interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: string;
}

interface FooterLinksEditorProps {
  content: SiteContent[];
  onContentUpdate: (content: SiteContent[]) => void;
  onSave: (id: string, value: string) => void;
  saving: boolean;
}

const FooterLinksEditor = ({ content, onContentUpdate, onSave, saving }: FooterLinksEditorProps) => {
  const handleInputChange = (id: string, value: string) => {
    onContentUpdate(
      content.map(c => 
        c.id === id ? { ...c, value } : c
      )
    );
  };

  const quickLinksContent = content.filter(item => item.key.startsWith('quick_link'));
  const supportContent = content.filter(item => item.key.startsWith('support_'));
  const quickLinksTitle = content.find(item => item.key === 'quick_links_title');
  const supportTitle = content.find(item => item.key === 'support_title');

  const renderLinkEditor = (items: SiteContent[], type: 'quick_link' | 'support_link') => {
    const linkPairs = [];
    for (let i = 1; i <= 5; i++) {
      const nameItem = items.find(item => item.key === `${type}_${i}_name`);
      const urlItem = items.find(item => item.key === `${type}_${i}_url`);
      if (nameItem && urlItem) {
        linkPairs.push({ name: nameItem, url: urlItem });
      }
    }

    return (
      <div className="space-y-4">
        {linkPairs.map((pair, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label>Link Name</Label>
              <Input
                value={pair.name.value}
                onChange={(e) => handleInputChange(pair.name.id, e.target.value)}
                placeholder="Enter link name"
              />
            </div>
            <div className="space-y-2">
              <Label>Link URL</Label>
              <Input
                value={pair.url.value}
                onChange={(e) => handleInputChange(pair.url.id, e.target.value)}
                placeholder="Enter link URL"
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <Button
                onClick={() => onSave(pair.name.id, pair.name.value)}
                disabled={saving}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Name
              </Button>
              <Button
                onClick={() => onSave(pair.url.id, pair.url.value)}
                disabled={saving}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save URL
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Footer Links Editor</CardTitle>
        <CardDescription>
          Edit the footer navigation links and their destinations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quick-links" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick-links">Quick Links</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quick-links" className="space-y-4">
            {quickLinksTitle && (
              <div className="space-y-2">
                <Label>Section Title</Label>
                <div className="flex gap-2">
                  <Input
                    value={quickLinksTitle.value}
                    onChange={(e) => handleInputChange(quickLinksTitle.id, e.target.value)}
                    placeholder="Section title"
                  />
                  <Button
                    onClick={() => onSave(quickLinksTitle.id, quickLinksTitle.value)}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            {renderLinkEditor(quickLinksContent, 'quick_link')}
          </TabsContent>
          
          <TabsContent value="support" className="space-y-4">
            {supportTitle && (
              <div className="space-y-2">
                <Label>Section Title</Label>
                <div className="flex gap-2">
                  <Input
                    value={supportTitle.value}
                    onChange={(e) => handleInputChange(supportTitle.id, e.target.value)}
                    placeholder="Section title"
                  />
                  <Button
                    onClick={() => onSave(supportTitle.id, supportTitle.value)}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            {renderLinkEditor(supportContent.filter(item => !item.key.includes('title')), 'support_link')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FooterLinksEditor;
