import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MechanicFormComponent from '../components/MechanicFormComponent';
import * as api from '../api/mechanics';

export default function UpdateRequestForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const requestId = parseInt(id as string, 10);
        if (isNaN(requestId)) {
          toast.error('Invalid Request ID');
          navigate('/admin/update-requests');
          return;
        }

        const data = await api.getUpdateRequestById(requestId);
        
        let parsedData = {};
        if (typeof data.updatedData === 'string') {
          try {
            parsedData = JSON.parse(data.updatedData);
          } catch (e) {
            console.error('Failed to parse updatedData string', e);
          }
        } else if (typeof data.updatedData === 'object') {
          parsedData = data.updatedData || {};
        }

        setInitialData(parsedData);
      } catch (err) {
        toast.error('Failed to load update request');
        navigate('/admin/update-requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, navigate]);

  const handleSubmit = async (payload: any) => {
    try {
      const requestId = parseInt(id as string, 10);
      await api.updateUpdateRequest(requestId, payload);
      toast.success('Update request modified successfully');
      navigate('/admin/update-requests');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to modify update request');
      throw err; // Re-throw to let MechanicFormComponent handle loading state if necessary
    }
  };

  const handleCancel = () => {
    navigate('/admin/update-requests');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <MechanicFormComponent 
      id={id} 
      isEdit={true} 
      initialData={initialData} 
      onSubmitOverride={handleSubmit} 
      onCancelOverride={handleCancel}
    />
  );
}
