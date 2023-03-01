<script setup>
import axios from 'axios';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '../../stores/dashboard.js';
import OrderModal from '../../components/dashboard/OrderModal.vue';
import DeleteOrderModal from '../../components/dashboard/DeleteOrderModal.vue';
const apiUrl = import.meta.env.VITE_API_URL;
const apiPath = import.meta.env.VITE_API_PATH;
const router = useRouter();
const { token, modalType, modalTarget, modalImageUrl } = storeToRefs(useDashboardStore());
const ordersData = ref([]);
const pagination = ref({
  totalPageNum: null,
  currentPage: 1,
  displayNum: 5
});

const showData = computed(() => {
  return ordersData.value.filter((item, idx) => {
    let maxItemIdx = pagination.value.currentPage * pagination.value.displayNum;
    let minItemIdx = (pagination.value.currentPage - 1) * pagination.value.displayNum;
    return idx < maxItemIdx && idx >= minItemIdx;
  });
});

function getOrdersData() {
  axios
    .get(`${apiUrl}/v2/api/${apiPath}/admin/orders`, {
      headers: { Authorization: token.value }
    })
    .then((res) => {
      if (res.data.success === false) {
        alert(res.data.message);
        router.push('/adminLogin');
      } else {
        ordersData.value = [];
        let originData = Object.entries(res.data.orders);
        originData.forEach((item) => {
          ordersData.value.push(item[1]);
        });
        paginationFirstSet();
      }
    })
    .catch((err) => {
      console.log(err);
      alert(err.data.message);
    });
}

function putPaidState(id) {
  let stateTarget = showData.value.find((item) => item.id === id);
  let paidState;
  if (modalTarget.value) {
    paidState = modalTarget.value.is_paid;
  } else {
    paidState = !stateTarget.is_paid;
  }
  axios
    .put(
      `${apiUrl}/v2/api/${apiPath}/admin/order/${id}`,
      { data: { is_paid: paidState } },
      {
        headers: { Authorization: token.value }
      }
    )
    .then(() => {
      alert('已更新付款狀態');
      getOrdersData();
    })
    .catch((err) => {
      console.log(err);
      alert(err.data.message);
    });
}

function modalDataRender(targetId, type) {
  modalTarget.value = '';
  modalType.value = type;
  modalTarget.value = ordersData.value.find((item) => item.id === targetId);
  modalTarget.value = JSON.parse(JSON.stringify(modalTarget.value));
  modalImageUrl.value = modalTarget.value.imageUrl;
}

function paginationFirstSet() {
  let remainder = ordersData.value.length % pagination.value.displayNum;
  if (remainder === 0) {
    pagination.value.totalPageNum = ordersData.value.length / pagination.value.displayNum;
  } else {
    pagination.value.totalPageNum = Math.ceil(
      ordersData.value.length / pagination.value.displayNum
    );
  }
  pagination.value.nextPage = pagination.value.currentPage + 1;
}

function orderDateRender(date) {
  let orderDate = new Date(date);
  if (orderDate.getMonth() + 1 < 10) {
    return `${orderDate.getFullYear()}-0${orderDate.getMonth() + 1}-${orderDate.getDate()}`;
  } else {
    return `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}-${orderDate.getDate()}`;
  }
}

getOrdersData();
</script>

<template>
  <div class="container">
    <table class="table mt-4">
      <thead>
        <tr>
          <th>購買時間</th>
          <th>Email</th>
          <th>購買款項</th>
          <th>應付金額</th>
          <th>是否付款</th>
          <th>編輯</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(order, key) in showData" :key="key">
          <td>{{ orderDateRender(order.create_at) }}</td>
          <td>
            <span>{{ order.user.email }}</span>
          </td>
          <td>
            <ul class="list-unstyled">
              <li v-for="(item, key) in order.products" :key="key">
                {{ item.product.title }} 數量：{{ item.qty }}
                {{ item.product.unit }}
              </li>
            </ul>
          </td>
          <td class="text-right">{{ order.total }}</td>
          <td>
            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                v-model="order.is_paid"
                @click="putPaidState(order.id)"
              />
              <label class="form-check-label">
                <span v-if="order.is_paid">已付款</span>
                <span v-else>未付款</span>
              </label>
            </div>
          </td>
          <td>
            <div class="btn-group">
              <button
                class="btn btn-outline-primary btn-sm"
                type="button"
                data-bs-target="#orderModal"
                data-bs-toggle="modal"
                @click="modalDataRender(order.id)"
              >
                檢視
              </button>
              <button
                class="btn btn-outline-danger btn-sm"
                type="button"
                data-bs-target="#delOrderModal"
                data-bs-toggle="modal"
                @click="modalDataRender(order.id)"
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
  <OrderModal @send-paid-states-put="putPaidState(modalTarget.id)" />
  <DeleteOrderModal @send-data-get="getOrdersData()" />
</template>

<style scoped></style>
