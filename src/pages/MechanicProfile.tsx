import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { apiClient } from '../api/apiClient';
import type { Mechanic } from '../types';
import { MapPin, Wrench, Navigation, Phone } from 'lucide-react';
import { MechanicReviews } from '../components/shared/MechanicReviews';
import { LazyImage } from '../components/shared/LazyImage';

export default function MechanicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mechanic, setMechanic] = useState<Mechanic | null>(null);
  const [loading, setLoading] = useState(true);
  const [aggregateRating, setAggregateRating] = useState<{ ratingValue: number; reviewCount: number } | null>(null);

  useEffect(() => {
    const fetchMechanic = async () => {
      try {
        const data = await apiClient<Mechanic>(`/public/mechanics/${id}`);
        setMechanic(data);
        
        // Also fetch reviews to get aggregate rating for Schema
        try {
          const reviewsData = await apiClient<any[]>(`/public/mechanics/${id}/reviews`);
          if (reviewsData && reviewsData.length > 0) {
            let total = 0;
            reviewsData.forEach(r => {
              total += (r.ratingTimeliness + r.ratingFairness + r.ratingRecommendation) / 3;
            });
            setAggregateRating({
              ratingValue: Number((total / reviewsData.length).toFixed(1)),
              reviewCount: reviewsData.length
            });
          }
        } catch (rErr) {
          console.error('Error fetching reviews for schema', rErr);
        }
      } catch (error) {
        console.error('Error fetching mechanic', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchMechanic();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!mechanic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h2 className="text-2xl font-bold mb-4">Mechanic Not Found</h2>
        <p className="text-muted-foreground mb-6">The mechanic profile you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate('/')} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium">
          Return Home
        </button>
      </div>
    );
  }

  const businessName = mechanic.businessName || mechanic.name || 'Auto Repair Service';
  const locationText = mechanic.city || mechanic.district || mechanic.area || 'Tamil Nadu';
  const title = `${businessName} - Auto Repair & Towing in ${locationText}`;
  
  // Format services for description
  const servicesList = mechanic.services?.length 
    ? mechanic.services.slice(0, 3).map((s: any) => typeof s === 'string' ? s : s.name).join(', ')
    : 'mechanics, towing, roadside assistance';
    
  const description = `Get expert ${servicesList} from ${businessName} in ${locationText}, ${mechanic.state || 'Tamil Nadu'}. Available for emergency vehicle support.`;
  const canonicalUrl = `https://roadresq.in/mechanic/${mechanic.id}`;
  const rawImageUrl = mechanic.image || mechanic.imageUrl || '';
  const imageUrl = rawImageUrl
    ? (rawImageUrl.startsWith('http') ? rawImageUrl : `https://roadresq.in${rawImageUrl.startsWith('/') ? rawImageUrl : `/${rawImageUrl}`}`)
    : "https://roadresq.in/social-share.png";

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": businessName,
    "image": imageUrl,
    "@id": canonicalUrl,
    "url": canonicalUrl,
    "telephone": Array.isArray(mechanic.phone) && mechanic.phone.length > 0 ? mechanic.phone[0] : (mechanic.phone || ""),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": mechanic.address || mechanic.area || "",
      "addressLocality": mechanic.city || "",
      "addressRegion": mechanic.state || "Tamil Nadu",
      "addressCountry": "IN"
    },
    ...(mechanic.latitude && mechanic.longitude ? {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": mechanic.latitude,
        "longitude": mechanic.longitude
      }
    } : {})
  };

  if (aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": aggregateRating.ratingValue,
      "reviewCount": aggregateRating.reviewCount
    };
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <SEO 
        title={title}
        description={description}
        url={canonicalUrl}
        image={imageUrl}
        schema={schema}
      />
      
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-12">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-muted-foreground hover:text-primary transition-colors font-medium">
          &larr; Back
        </button>
        
        <div className="bg-card rounded-[24px] shadow-xl border border-border overflow-hidden">
          <div className="h-64 sm:h-80 bg-secondary/50 relative">
            {imageUrl && imageUrl !== "https://roadresq.in/social-share.png" ? (
               <LazyImage src={imageUrl} alt={businessName} />
            ) : (
               <div className="w-full h-full flex items-center justify-center bg-muted">
                 <Wrench className="w-20 h-20 text-muted-foreground/30" />
               </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md mb-2">{businessName}</h1>
              <p className="text-white/90 flex items-center gap-2 text-lg font-medium drop-shadow-md">
                <MapPin className="w-5 h-5 text-primary" />
                {mechanic.landmark ? `${mechanic.landmark}, ` : ''}{mechanic.area}{mechanic.city ? `, ${mechanic.city}` : ''}
              </p>
            </div>
          </div>
          
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    Contact Information
                  </h3>
                  {mechanic.phone ? (
                    <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                      <p className="font-medium text-lg">
                        {Array.isArray(mechanic.phone) ? mechanic.phone.join(', ') : mechanic.phone}
                      </p>
                      {mechanic.alternatePhone && (
                        <p className="text-muted-foreground mt-1">{mechanic.alternatePhone}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Phone number not available.</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-primary" />
                    Location
                  </h3>
                  <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                    <p className="text-foreground">{mechanic.address || `${mechanic.area}, ${mechanic.city}`}</p>
                    <a 
                      href={mechanic.mapLink || `https://maps.google.com/?q=${mechanic.latitude},${mechanic.longitude}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-block mt-3 text-primary font-semibold hover:underline"
                    >
                      Get Directions on Google Maps &rarr;
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                 <div>
                   <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                     <Wrench className="w-5 h-5 text-primary" />
                     Services Offered
                   </h3>
                   <div className="flex flex-wrap gap-2">
                     {mechanic.services?.map((service: any, index: number) => (
                       <span key={index} className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-semibold">
                         {service.name || service}
                       </span>
                     ))}
                     {(!mechanic.services || mechanic.services.length === 0) && (
                       <span className="text-muted-foreground italic">Specific services not listed. Please contact to inquire.</span>
                     )}
                   </div>
                 </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 justify-center">
               <button 
                 onClick={() => navigate(`/map?routeTo=${mechanic.id}`)} 
                 className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
               >
                 View on Interactive Map
               </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <MechanicReviews mechanicId={mechanic.id!} />
        </div>
      </div>
    </div>
  );
}
