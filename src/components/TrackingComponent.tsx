import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, MapPin, Clock, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TrackingEvent {
  status: string;
  status_details: string;
  status_date: string;
  location: {
    city?: string;
    state?: string;
    country?: string;
  };
}

interface TrackingInfo {
  tracking_number: string;
  carrier: string;
  status: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  eta?: string;
  tracking_url?: string;
  history: TrackingEvent[];
}

const TrackingComponent = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("USPS");
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      toast.error("Please enter a tracking number");
      return;
    }

    setLoading(true);
    setError("");
    setTrackingInfo(null);

    try {
      const { data, error } = await supabase.functions.invoke('track-shipment', {
        body: {
          trackingNumber: trackingNumber.trim(),
          carrier: carrier.toLowerCase()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success && data?.tracking) {
        setTrackingInfo(data.tracking);
      } else {
        throw new Error(data?.error || "Failed to get tracking information");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to track shipment";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-500';
      case 'out_for_delivery': return 'bg-blue-500';
      case 'in_transit': return 'bg-yellow-500';
      case 'pre_transit': return 'bg-gray-500';
      case 'exception': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatLocation = (location: any) => {
    if (!location) return "";
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country && location.country !== "US") parts.push(location.country);
    return parts.join(", ");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Track Your Package
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
              />
            </div>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USPS">USPS</option>
              <option value="UPS">UPS</option>
              <option value="FEDEX">FedEx</option>
            </select>
          </div>
          
          <Button 
            onClick={handleTrack} 
            disabled={loading || !trackingNumber.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Tracking...
              </>
            ) : (
              <>
                <Package className="w-4 h-4 mr-2" />
                Track Package
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {trackingInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tracking Details</span>
              {trackingInfo.tracking_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={trackingInfo.tracking_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Carrier Website
                  </a>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">Tracking Number: {trackingInfo.tracking_number}</p>
                <p className="text-sm text-gray-600">Carrier: {trackingInfo.carrier.toUpperCase()}</p>
              </div>
              <Badge className={getStatusColor(trackingInfo.status)}>
                {formatStatus(trackingInfo.status)}
              </Badge>
            </div>

            {/* Current Location */}
            {trackingInfo.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Current Location: {formatLocation(trackingInfo.location)}</span>
              </div>
            )}

            {/* ETA */}
            {trackingInfo.eta && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Estimated Delivery: {formatDate(trackingInfo.eta)}</span>
              </div>
            )}

            {/* Tracking History */}
            {trackingInfo.history && trackingInfo.history.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Tracking History</h4>
                <div className="space-y-3">
                  {trackingInfo.history.map((event, index) => (
                    <div key={index} className="flex gap-4 p-3 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full mt-1 ${getStatusColor(event.status)}`} />
                      <div className="flex-1">
                        <p className="font-medium">{formatStatus(event.status)}</p>
                        {event.status_details && (
                          <p className="text-sm text-gray-600">{event.status_details}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>{formatDate(event.status_date)}</span>
                          {event.location && (
                            <span>{formatLocation(event.location)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrackingComponent;