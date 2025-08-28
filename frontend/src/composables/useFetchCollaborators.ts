import axios from 'axios';
import type { CollaboratorStatus } from '@/enums/status.enums';

const API_URL = import.meta.env.VITE_API_URL;

export async function useFetchCollaborators(params?: {
  page?: number;
  limit?: number;
  status?: CollaboratorStatus;
}) {
  const res = await axios.get(`${API_URL}/collaborators`, {
    params,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
}
