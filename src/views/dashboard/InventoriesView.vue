<script setup>
import axios from 'axios';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '../../stores/dashboard.js';
import ProductModal from '../../components/dashboard/ProductModal.vue';
import DeleteProductModal from '../../components/dashboard/DeleteProductModal.vue';
const apiUrl = import.meta.env.VITE_API_URL;
const apiPath = import.meta.env.VITE_API_PATH;
const router = useRouter();
const { token, modalType, modalTarget, modalImageUrl } = storeToRefs(useDashboardStore());
const goodsData = ref([]);
const pagination = ref({
  totalPageNum: null,
  currentPage: 1,
  displayNum: 5
});

const showData = computed(() => {
  return goodsData.value.filter((item, idx) => {
    let maxItemIdx = pagination.value.currentPage * pagination.value.displayNum;
    let minItemIdx = (pagination.value.currentPage - 1) * pagination.value.displayNum;
    return idx < maxItemIdx && idx >= minItemIdx;
  });
});

function getGoodsData() {
  axios
    .get(`${apiUrl}/v2/api/${apiPath}/admin/products/all`, {
      headers: { Authorization: token.value }
    })
    .then((res) => {
      if (res.data.success === false) {
        alert(res.data.message);
        router.push('/adminLogin');
      } else {
        goodsData.value = [];
        let originData = Object.entries(res.data.products);
        originData.forEach((item) => {
          goodsData.value.push(item[1]);
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
  modalTarget.value = goodsData.value.find((item) => item.id === targetId);
  modalTarget.value = JSON.parse(JSON.stringify(modalTarget.value));
  modalImageUrl.value = modalTarget.value.imageUrl;
}

function paginationFirstSet() {
  let remainder = goodsData.value.length % pagination.value.displayNum;
  if (remainder === 0) {
    pagination.value.totalPageNum = goodsData.value.length / pagination.value.displayNum;
  } else {
    pagination.value.totalPageNum = Math.ceil(goodsData.value.length / pagination.value.displayNum);
  }
  pagination.value.nextPage = pagination.value.currentPage + 1;
}

getGoodsData();
</script>

<template>
  <div class="container">
    <div class="text-end mt-4">
      <button
        data-bs-toggle="modal"
        data-bs-target="#productModal"
        class="btn btn-primary"
        @click.prevent="
          modalTarget = {};
          modalImageUrl = '';
          modalType = 'add';
        "
      >
        建立新的產品
      </button>
    </div>
    <table class="table mt-4">
      <thead>
        <tr>
          <th width="120">分類</th>
          <th>產品名稱</th>
          <th width="120">原價</th>
          <th width="120">售價</th>
          <th width="100">是否啟用</th>
          <th width="120">編輯</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in showData" :key="item.id">
          <td>{{ item.category }}</td>
          <td>{{ item.title }}</td>
          <td class="text-end">{{ item.origin_price }}</td>
          <td class="text-end">{{ item.price }}</td>
          <td>
            <span v-if="item.is_enabled" class="text-success">啟用</span>
            <span v-else class="text-danger">未啟用</span>
          </td>
          <td>
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-outline-primary btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#productModal"
                @click.prevent="modalDataRender(item.id)"
              >
                編輯
              </button>
              <button
                type="button"
                class="btn btn-outline-danger btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#delProductModal"
                @click.prevent="modalDataRender(item.id)"
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
  <ProductModal @send-data-get="getGoodsData()" />
  <DeleteProductModal @send-data-get="getGoodsData()" />
</template>

<style scoped></style>
