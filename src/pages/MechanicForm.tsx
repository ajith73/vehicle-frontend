import { useParams } from 'react-router-dom';
import MechanicFormComponent from '../components/MechanicFormComponent';

export default function MechanicForm() {
  const { id } = useParams();
  const isEdit = Boolean(id) && id !== 'new' && id !== 'null' && id !== 'undefined';

  return (
    <MechanicFormComponent id={id} isEdit={isEdit} />
  );
}
