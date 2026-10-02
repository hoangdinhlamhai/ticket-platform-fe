import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL ?? '/api',
})

axiosClient.interceptors.request.use((config) => {
  const accessToken = typeof localStorage === 'undefined'
    ? null
    : localStorage.getItem('accessToken')

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})

export default axiosClient
