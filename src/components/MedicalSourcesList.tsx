import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Award, BookOpen, Building2 } from 'lucide-react';

interface MedicalReference {
  source: string;
  url: string;
  quote?: string;
  sourceType: string;
  evidenceStrength?: string;
  visualExamples?: string[];
}

interface MedicalSourcesListProps {
  references: MedicalReference[];
}

const getSourceIcon = (sourceType: string) => {
  switch (sourceType) {
    case 'clinical_guideline':
      return <Building2 className="w-4 h-4" />;
    case 'medical_journal':
      return <BookOpen className="w-4 h-4" />;
    case 'trusted_organization':
      return <Award className="w-4 h-4" />;
    default:
      return <ExternalLink className="w-4 h-4" />;
  }
};

const getEvidenceColor = (strength?: string) => {
  switch (strength) {
    case 'peer_reviewed':
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'clinical_observation':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'expert_consensus':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

const MedicalSourcesList: React.FC<MedicalSourcesListProps> = ({ references }) => {
  if (!references || references.length === 0) return null;

  const groupedRefs = references.reduce((acc, ref) => {
    const type = ref.sourceType || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(ref);
    return acc;
  }, {} as Record<string, MedicalReference[]>);

  return (
    <Card className="bg-card/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="w-5 h-5 text-primary" />
          Medical Research Sources
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          All findings are backed by credible medical sources. Click to verify.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedRefs).map(([type, refs]) => (
          <div key={type} className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground/80 capitalize flex items-center gap-2">
              {getSourceIcon(type)}
              {type.replace(/_/g, ' ')}
            </h4>
            <div className="space-y-2">
              {refs.map((ref, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">
                          {ref.source}
                        </span>
                        {ref.evidenceStrength && (
                          <Badge
                            variant="outline"
                            className={getEvidenceColor(ref.evidenceStrength)}
                          >
                            {ref.evidenceStrength.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                      {ref.quote && (
                        <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                          "{ref.quote}"
                        </p>
                      )}
                      {ref.visualExamples && ref.visualExamples.length > 0 && (
                        <p className="text-xs text-primary">
                          📸 {ref.visualExamples.length} reference image{ref.visualExamples.length > 1 ? 's' : ''} available
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => window.open(ref.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MedicalSourcesList;
