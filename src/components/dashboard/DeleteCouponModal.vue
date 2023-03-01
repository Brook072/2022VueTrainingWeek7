<script setup>
import axios from 'axios';
import { Modal } from 'bootstrap';
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '../../stores/dashboard.js';
const apiUrl = import.meta.env.VITE_API_URL;
const apiPath = import.meta.env.VITE_API_PATH;
const { token, modalTarget } = storeToRefs(useDashboardStore());
const emit = defineEmits(['sendDataGet']);
const deleteModalBS = ref({});

function couponDelete() {
  axios
    .delete(`${apiUrl}/v2/api/${apiPath}/admin/coupon/${modalTarget.value.id}`, {
      headers: {
        Authorization: token.value
      }
    })
    .then((res) => {
      alert(res.data.message);
      emit('sendDataGet');
      deleteModalBS.value.hide();
    })
    .catch((err) => {
      alert(err.data.message);
    });
}
onMounted(() => {
  deleteModalBS.value = new Modal(document.getElementById('delCouponModal'));
});
</script>
<template>
  <div
    id="delCouponModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="delCouponModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content border-0">
        <div class="modal-header bg-danger text-white">
          <h5 id="delCouponModalLabel" class="modal-title">
            <span>刪除優惠券</span>
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          是否刪除
          <strong class="text-danger">{{ modalTarget.title }}</strong>
          優惠券(刪除後將無法恢復)。
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            取消
          </button>
          <button @click.prevent="couponDelete()" type="button" class="btn btn-danger">
            確認刪除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
