<script setup>
import axios from 'axios';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '../../stores/dashboard.js';
import CouponModal from '../../components/dashboard/CouponModal.vue';
import DeleteCouponModal from '../../components/dashboard/DeleteCouponModal.vue';
const apiUrl = import.meta.env.VITE_API_URL;
const apiPath = import.meta.env.VITE_API_PATH;
const router = useRouter();
const { token, modalType, modalTarget, modalImageUrl } = storeToRefs(useDashboardStore());
const couponsData = ref([]);
const pagination = ref({
  totalPageNum: null,
  currentPage: 1,
  displayNum: 5
});

const showData = computed(() => {
  return couponsData.value.filter((item, idx) => {
    let maxItemIdx = pagination.value.currentPage * pagination.value.displayNum;
    let minItemIdx = (pagination.value.currentPage - 1) * pagination.value.displayNum;
    return idx < maxItemIdx && idx >= minItemIdx;
  });
});

function getCouponsData() {
  axios
    .get(`${apiUrl}/v2/api/${apiPath}/admin/coupons`, {
      headers: { Authorization: token.value }
    })
    .then((res) => {
      console.log(res);
      if (res.data.success === false) {
        alert(res.data.message);
        router.push('/adminLogin');
      } else {
        couponsData.value = [];
        let originData = Object.entries(res.data.coupons);
        originData.forEach((item) => {
          couponsData.value.push(item[1]);
        });
        paginationFirstSet();
      }
    })
    .catch((err) => {
      console.log(err);
      alert(err.data.message);
    });
}

function modalDataRender(targetId, type) {
  modalTarget.value = '';
  modalType.value = type;
  modalTarget.value = couponsData.value.find((item) => item.id === targetId);
  modalTarget.value = JSON.parse(JSON.stringify(modalTarget.value));
  modalImageUrl.value = modalTarget.value.imageUrl;
}

function dateRender(date) {
  let couponDueDate = new Date(date);
  if (couponDueDate.getMonth() + 1 < 10) {
    return `${couponDueDate.getFullYear()}-0${
      couponDueDate.getMonth() + 1
    }-${couponDueDate.getDate()}`;
  } else {
    return `${couponDueDate.getFullYear()}-${
      couponDueDate.getMonth() + 1
    }-${couponDueDate.getDate()}`;
  }
}

function paginationFirstSet() {
  let remainder = couponsData.value.length % pagination.value.displayNum;
  if (remainder === 0) {
    pagination.value.totalPageNum = couponsData.value.length / pagination.value.displayNum;
  } else {
    pagination.value.totalPageNum = Math.ceil(
      couponsData.value.length / pagination.value.displayNum
    );
  }
  pagination.value.nextPage = pagination.value.currentPage + 1;
}

getCouponsData();
</script>

<template>
  <div class="container">
    <div class="text-end mt-4">
      <button
        class="btn btn-primary"
        type="button"
        data-bs-toggle="modal"
        data-bs-target="#couponModal"
        @click="modalTarget.isNew = true"
      >
        建立新的優惠券
      </button>
    </div>
    <table class="table mt-4">
      <thead>
        <tr>
          <th>名稱</th>
          <th>折扣百分比</th>
          <th>到期日</th>
          <th>是否啟用</th>
          <th>編輯</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="coupon in showData" :key="coupon.id">
          <td>{{ coupon.title }}</td>
          <td>{{ coupon.percent }}</td>
          <td>{{ dateRender(coupon.due_date) }}</td>
          <td>
            <span v-if="coupon.is_enabled" class="text-success">啟用</span>
            <span v-else class="text-muted">未啟用</span>
          </td>
          <td>
            <div class="btn-group">
              <button
                class="btn btn-outline-primary btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#couponModal"
                @click="
                  modalDataRender(coupon.id);
                  modalTarget.due_date = dateRender(modalTarget.due_date);
                  modalTarget.isNew = false;
                "
              >
                編輯
              </button>
              <button
                class="btn btn-outline-danger btn-sm"
                @click="
                  modalDataRender(coupon.id);
                  modalTarget.due_date = dateRender(modalTarget.due_date);
                "
                data-bs-toggle="modal"
                data-bs-target="#delCouponModal"
              >
                刪除
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="d-flex gap-1">
    <button
      @click="pagination.currentPage -= 1"
      type="button"
      class="btn btn-outline-success"
      :disabled="pagination.currentPage - 1 === 0"
    >
      <font-awesome-icon icon="fa-solid fa-chevron-left" />
    </button>
    <button
      v-for="num in pagination.totalPageNum"
      :key="num"
      @click="pagination.currentPage = num"
      type="button"
      class="btn btn-outline-success"
      :disabled="num === pagination.currentPage"
    >
      {{ num }}
    </button>
    <button
      @click="pagination.currentPage += 1"
      type="button"
      class="btn btn-outline-success"
      :disabled="pagination.currentPage + 1 > pagination.totalPageNum"
    >
      <font-awesome-icon icon="fa-solid fa-chevron-right" />
    </button>
  </div>
  <CouponModal @send-data-get="getCouponsData()" />
  <DeleteCouponModal @send-data-get="getCouponsData()" />
</template>

<style scoped></style>
