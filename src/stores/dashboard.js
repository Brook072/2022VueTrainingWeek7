import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useDashboardStore = defineStore('dashboard', () => {
  const token = ref('');
  const modalType = ref('');
  const modalTarget = ref({});
  const modalImageUrl = ref('');
  return { token, modalType, modalTarget, modalImageUrl };
});
