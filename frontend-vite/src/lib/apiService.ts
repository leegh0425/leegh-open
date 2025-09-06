import axios from 'axios';
import type { Dayjs } from 'dayjs';

// .env 파일에서 API 기본 URL을 가져옵니다.
const API_URL = import.meta.env.VITE_API_URL;

// 재사용을 위해 axios 인스턴스를 생성합니다.
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 응답 인터셉터를 추가하여 모든 API 응답을 일관되게 처리합니다.
 * 성공 시에는 response.data를 반환하고,
 * 실패 시에는 에러 메시지를 파싱하여 반환합니다.
 */
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || '알 수 없는 오류가 발생했습니다.';
    // 일관된 에러 처리를 위해 Promise.reject를 사용합니다.
    return Promise.reject(new Error(message));
  }
);

/**
 * 모든 메뉴 목록을 가져옵니다.
 */
export const fetchMenus = () => apiClient.get('/menus/');

/**
 * 특정 날짜의 마감 보고서를 가져옵니다.
 * @param date - 조회할 날짜 (Dayjs 객체)
 */
export const fetchClosingReport = (date: Dayjs) => {
  const dateString = date.format('YYYY-MM-DD');
  return apiClient.get(`/closing-reports/${dateString}`);
};

/**
 * 마감 보고서를 저장(신규 등록 또는 수정)합니다.
 * @param date - 대상 날짜
 * @param payload - 전송할 데이터
 * @param mode - 'NEW' 또는 'EDIT'
 */
export const saveClosingReport = (date: Dayjs, payload: any, mode: 'NEW' | 'EDIT') => {
  const dateString = date.format('YYYY-MM-DD');
  if (mode === 'NEW') {
    return apiClient.post('/closing-reports/', payload);
  } else {
    return apiClient.put(`/closing-reports/${dateString}`, payload);
  }
};

/**
 * 마감 상태를 변경(마감 또는 마감 취소)합니다.
 * @param date - 대상 날짜
 * @param is_closed - 마감 여부
 */
export const updateClosingStatus = (date: Dayjs, is_closed: boolean) => {
  const dateString = date.format('YYYY-MM-DD');
  return apiClient.patch(`/closing-reports/${dateString}/close`, { is_closed });
};
