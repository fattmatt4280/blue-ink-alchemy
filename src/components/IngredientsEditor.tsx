
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import IconSelector from './IconSelector';

interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: string;
}

interface IngredientsEditorProps {
  content: SiteContent[];
  onContentUpdate: (content: SiteContent[]) => void;
  onSave: (id: string, value: string) => void;
  saving: boolean;
}

const IngredientsEditor = ({ content, onContentUpdate, onSave, saving }: IngredientsEditorProps) => {
  const handleInputChange = (id: string, value: string) => {
    onContentUpdate(
      content.map(c => 
        c.id === id ? { ...c, value } : c
      )
    );
  };

  const getContentValue = (key: string) => {
    return content.find(c => c.key === key)?.value || '';
  };

  const getContentId = (key: string) => {
    return content.find(c => c.key === key)?.id || '';
  };

  const saveAllSectionFields = async (keys: string[]) => {
    for (const key of keys) {
      const id = getContentId(key);
      const value = getContentValue(key);
      if (id && value !== undefined) {
        await onSave(id, value);
      }
    }
  };

  const ingredientKeys = ['ingredients_title', 'ingredients_subtitle'];
  const ingredientNumbers = [1, 2, 3, 4, 5, 6];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredients Section Editor</CardTitle>
        <CardDescription>Edit ingredients section content and icons</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section Title and Subtitle */}
        <Card className="p-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Section Header</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ingredientKeys.map((key) => {
              const item = content.find(c => c.key === key);
              if (!item) return null;
              
              return (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>
                    {key === 'ingredients_title' ? 'Section Title' : 'Section Subtitle'}
                  </Label>
                  {key === 'ingredients_subtitle' ? (
                    <Textarea
                      id={key}
                      value={item.value}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                      className="min-h-[80px]"
                    />
                  ) : (
                    <Input
                      id={key}
                      value={item.value}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
            <Button
              onClick={() => saveAllSectionFields(ingredientKeys)}
              disabled={saving}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Section Header'}
            </Button>
          </CardContent>
        </Card>

        {/* Individual Ingredients */}
        <div className="grid gap-6">
          {ingredientNumbers.map((num) => {
            const nameKey = `ingredient_${num}_name`;
            const benefitKey = `ingredient_${num}_benefit`;
            const descriptionKey = `ingredient_${num}_description`;
            const iconKey = `ingredient_${num}_icon`;
            const allKeys = [nameKey, benefitKey, descriptionKey, iconKey];

            return (
              <Card key={num} className="p-4">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Ingredient {num}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={getContentValue(nameKey)}
                        onChange={(e) => handleInputChange(getContentId(nameKey), e.target.value)}
                      />
                    </div>
                    
                    <IconSelector
                      value={getContentValue(iconKey)}
                      onChange={(value) => handleInputChange(getContentId(iconKey), value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Benefit</Label>
                    <Input
                      value={getContentValue(benefitKey)}
                      onChange={(e) => handleInputChange(getContentId(benefitKey), e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={getContentValue(descriptionKey)}
                      onChange={(e) => handleInputChange(getContentId(descriptionKey), e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <Button
                    onClick={() => saveAllSectionFields(allKeys)}
                    disabled={saving}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : `Save Ingredient ${num}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default IngredientsEditor;
