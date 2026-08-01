import { X } from 'lucide-react';
import type { RowData } from '../../utils/bulkUploadUtils';

interface BulkUploadViewModalProps {
  viewingRow: RowData;
  onClose: () => void;
}

export default function BulkUploadViewModal({ viewingRow, onClose }: BulkUploadViewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
          <h3 className="font-bold text-xl">View Row Data</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold border-b border-border pb-2 text-primary">Basic Info</h4>
              <div>
                <span className="block text-sm text-muted-foreground">Type</span>
                <span className="font-medium">{viewingRow.mechanicType || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-sm text-muted-foreground">Business Name</span>
                <span className="font-medium">{viewingRow.businessName || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-sm text-muted-foreground">Mechanic Name</span>
                <span className="font-medium">{viewingRow.mechanicName || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-sm text-muted-foreground">Description</span>
                <p className="text-sm">{viewingRow.description || 'N/A'}</p>
              </div>
            </div>

            {/* Image Preview */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold border-b border-border pb-2 text-primary">Image</h4>
              {viewingRow.imageUrl ? (
                <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
                  <img
                    src={viewingRow.imageUrl}
                    alt={viewingRow.businessName || 'Mechanic'}
                    className="h-56 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                      const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                      if (fallback) {
                        fallback.classList.remove('hidden');
                      }
                    }}
                  />
                  <div className="hidden h-56 items-center justify-center p-4 text-sm text-muted-foreground">
                    Unable to load image preview
                  </div>
                </div>
              ) : (
                <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
                  No image provided
                </div>
              )}
              {viewingRow.imageUrl && (
                <a
                  href={viewingRow.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block break-all text-sm text-blue-500 hover:underline"
                >
                  {viewingRow.imageUrl}
                </a>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold border-b border-border pb-2 text-primary">Contact</h4>
              <div>
                <span className="block text-sm text-muted-foreground">Mobile Phone</span>
                <span className="font-medium">{viewingRow.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-sm text-muted-foreground">WhatsApp</span>
                <span className="font-medium">{viewingRow.whatsappNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-sm text-muted-foreground">Tel Number</span>
                <span className="font-medium">{viewingRow.telNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-sm text-muted-foreground">Email</span>
                <span className="font-medium">{viewingRow.email || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-sm text-muted-foreground">Website</span>
                <a href={viewingRow.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline break-all">{viewingRow.websiteUrl || 'N/A'}</a>
              </div>
            </div>

            {/* Location Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold border-b border-border pb-2 text-primary">Location</h4>
              <div>
                <span className="block text-sm text-muted-foreground">Address</span>
                <span className="text-sm block">{viewingRow.address}, {viewingRow.landmark}</span>
                <span className="text-sm block">{viewingRow.pincode ? `Pincode: ${viewingRow.pincode}` : `Area: ${viewingRow.area}`}, {viewingRow.city}, {viewingRow.state}</span>
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="block text-sm text-muted-foreground">Lat</span>
                  <span className="font-medium">{viewingRow.latitude || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-sm text-muted-foreground">Lng</span>
                  <span className="font-medium">{viewingRow.longitude || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Services Info */}
            <div className="space-y-4 md:col-span-2 lg:col-span-3">
              <h4 className="text-lg font-semibold border-b border-border pb-2 text-primary">Services & Offerings</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="block text-sm text-muted-foreground">Vehicles</span>
                  <span className="font-medium text-sm">{viewingRow.vehicleTypes || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-sm text-muted-foreground">Services</span>
                  <span className="font-medium text-sm">{viewingRow.serviceTypes || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-sm text-muted-foreground">Operating Days & Hours</span>
                  <span className="font-medium block text-sm">{viewingRow.operatingDays || 'N/A'}</span>
                  <span className="font-medium block text-sm">{viewingRow.operatingHours || 'N/A'}</span>
                </div>
              </div>
              
              {/* Toggles Display */}
              <div className="flex flex-wrap gap-2 mt-4">
                {viewingRow.evSupport === 'true' && <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full border border-green-200 dark:border-green-800">EV Support</span>}
                {viewingRow.homeService === 'true' && <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-full border border-blue-200 dark:border-blue-800">Home Service</span>}
                {viewingRow.roadsideAssistance === 'true' && <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 text-xs rounded-full border border-orange-200 dark:border-orange-800">Roadside Assist</span>}
                {viewingRow.is24Hours === 'true' && <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 text-xs rounded-full border border-purple-200 dark:border-purple-800">24/7 Hours</span>}
                {viewingRow.holidayWorking === 'true' && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs rounded-full border border-yellow-200 dark:border-yellow-800">Holiday Working</span>}
              </div>
            </div>

          </div>
        </div>
        
        <div className="p-4 border-t border-border flex justify-end shrink-0 bg-card rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
