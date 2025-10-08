import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertCircle, BookOpen } from "lucide-react";

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
              className="w-full"
              onClick={() => window.open(medicalReference.url, '_blank')}
            >
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              View Full Medical Reference
            </Button>
          </div>
        </div>

        {/* Visual Examples */}
        {medicalReference.visualExamples && medicalReference.visualExamples.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs font-semibold mb-2">
              📸 Medical Comparison Images:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {medicalReference.visualExamples.map((imgUrl, i) => (
                <div
                  key={i}
                  className="relative group cursor-pointer"
                  onClick={() => window.open(imgUrl, '_blank')}
                >
                  <img
                    src={imgUrl}
                    alt={`Medical reference ${i + 1}`}
                    className="rounded border-2 border-border object-cover h-24 w-full group-hover:border-primary transition-colors"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded flex items-center justify-center">
                    <ExternalLink className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Click images to view full size medical examples
            </p>
          </div>
        )}

        {/* When to Seek Care */}
        <Alert variant={riskFactor.severity === 'urgent' ? 'destructive' : 'default'} className="mt-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong className="block mb-1">When to Seek Medical Care:</strong>
            {medicalReference.whenToSeekCare}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
