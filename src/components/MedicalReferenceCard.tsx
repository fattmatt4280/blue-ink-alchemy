import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertCircle, BookOpen, Image as ImageIcon, AlertTriangle } from "lucide-react";

interface MedicalReference {
  source: string;
  sourceType: string;
  url: string;
  visualExamples?: string[];
  keyQuote: string;
  whenToSeekCare: string;
  evidenceStrength: string;
}

interface RiskFactorWithEvidence {
  concern: string;
  symptoms: string[];
  severity: string;
  medicalReference?: MedicalReference;
}

interface MedicalReferenceCardProps {
  riskFactor: RiskFactorWithEvidence;
}

export const MedicalReferenceCard = ({ riskFactor }: MedicalReferenceCardProps) => {
  const { medicalReference } = riskFactor;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  if (!medicalReference) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'urgent': return 'border-red-600 bg-red-50 dark:bg-red-950/20';
      case 'concerning': return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20';
      case 'monitor': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  const getSourceIcon = (sourceType: string) => {
    const icons: Record<string, string> = {
      nhs: '🏥',
      mayo_clinic: '⚕️',
      medical_journal: '📚',
      dermatology_org: '🔬',
      clinical_guideline: '📋'
    };
    return icons[sourceType] || '📖';
  };

  return (
    <Card className={`border-2 ${getSeverityColor(riskFactor.severity)} mt-3`}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Medical Evidence & Reference
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Observed Symptoms */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            Symptoms Observed in Your Photos:
          </p>
          <ul className="space-y-1.5">
            {riskFactor.symptoms.map((symptom, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-amber-600 flex-shrink-0" />
                <span>{symptom}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Medical Source */}
        <div className="pt-3 border-t">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{getSourceIcon(medicalReference.sourceType)}</span>
            <p className="text-xs font-semibold">Medical Source:</p>
            <Badge variant="outline" className="text-xs">
              {medicalReference.evidenceStrength.replace('_', ' ')}
            </Badge>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-3 space-y-3">
            <p className="font-medium text-sm">{medicalReference.source}</p>
            <blockquote className="text-xs italic border-l-2 border-primary pl-3 text-muted-foreground">
              "{medicalReference.keyQuote}"
            </blockquote>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => window.open(medicalReference.url, '_blank')}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Read Full Medical Article
            </Button>
          </div>
        </div>

        {/* Visual Examples */}
        {medicalReference.visualExamples && medicalReference.visualExamples.length > 0 && (
          <div className="pt-3 border-t space-y-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold">
                Medical Reference Photos ({medicalReference.visualExamples.length})
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Compare your tattoo with these verified medical reference images. Click to enlarge.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {medicalReference.visualExamples.map((imgUrl, i) => (
                <div
                  key={i}
                  className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-all"
                  onClick={() => setSelectedImage(imgUrl)}
                >
                  <img
                    src={imgUrl}
                    alt={`Medical reference ${i + 1} for ${riskFactor.concern}`}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ExternalLink className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lightbox for enlarged images */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage}
              alt="Enlarged medical reference"
              className="max-w-full max-h-full rounded-lg"
            />
          </div>
        )}

        {/* When to Seek Care */}
        {medicalReference.whenToSeekCare && (
          <div className="pt-3 border-t">
            <Alert variant={riskFactor.severity === 'urgent' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs space-y-1">
                <strong className="block font-semibold">When to Seek Professional Medical Care:</strong>
                <p>{medicalReference.whenToSeekCare}</p>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
