import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export async function useFetchCertificates(params?: {
  page?: number;
  limit?: number;
  name?: string;
  sort?: string;
}) {
  const res = await axios.get(`${API_URL}/medical-certificates`, {
    params,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
}
