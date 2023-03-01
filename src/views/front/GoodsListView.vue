<script setup>
import GoodsListModal from '../../components/GoodsListModal.vue';
import axios from 'axios';
import { ref, watch, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import { useLoading } from 'vue-loading-overlay';
const apiUrl = import.meta.env.VITE_API_URL;
const apiPath = import.meta.env.VITE_API_PATH;
const $loading = useLoading({
  color: 'green',
  isFullPage: true,
  loader: 'bars',
  lockScroll: true,
  opacity: 1
});
const originData = ref([]);
const pagination = ref({
  totalPageNum: null,
  currentPage: 1,
  displayNum: 5
});
const modalTarget = ref({});
const modalTargetQty = ref(null);
const productModal = ref({});

const showedData = computed(() => {
  return originData.value.filter((item, idx) => {
    let maxItemIdx = pagination.value.currentPage * pagination.value.displayNum;
    let minItemIdx = (pagination.value.currentPage - 1) * pagination.value.displayNum;
    return idx < maxItemIdx && idx >= minItemIdx;
  });
});

function getGoodsList() {
  axios.get(`${apiUrl}/v2/api/${apiPath}/products/all`).then((res) => {
    originData.value = res.data.products;
  });
}

function goodsInfoSet(id) {
  modalTarget.value = {};
  showedData.value.find((item) => {
    if (item.id === id) modalTarget.value = item;
  });
}

function paginationFirstSet() {
  pagination.value.totalPageNum = Math.ceil(originData.value.length / pagination.value.displayNum);
  pagination.value.nextPage = pagination.value.currentPage + 1;
}

function postAddCartItem(id) {
  let qty = modalTargetQty.value ? modalTargetQty.value : 1;
  axios
    .post(`${apiUrl}/v2/api/${apiPath}/cart`, {
      data: {
        product_id: id,
        qty
      }
    })
    .then((res) => {
      alert(res.data.message);
      productModal.value.hide();
    })
    .catch((err) => {
      alert(err.data.message);
    });
}

onMounted(() => {
  const loader = $loading.show();
  setTimeout(() => {
    loader.hide();
  }, 500);
  productModal.value = new Modal('#productModal');
});

watch(originData, () => {
  paginationFirstSet();
});

getGoodsList();
</script>

<template>
  <div class="container">
    <div class="mt-4">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>圖片</th>
            <th>商品名稱</th>
            <th>價格</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="goods in showedData" :key="goods.id">
            <td style="width: 200px">
              <div class="goodsImg" :style="{ backgroundImage: `url(${goods.imageUrl})` }"></div>
            </td>
            <td>{{ goods.title }}</td>
            <td>
              <del class="h6">原價 {{ goods.origin_price }} 元</del>
              <div class="h5">現在只要 {{ goods.price }} 元</div>
            </td>
            <td>
              <div class="btn-group btn-group-sm">
                <button
                  @click.prevent="goodsInfoSet(goods.id)"
                  type="button"
                  class="btn btn-outline-secondary"
                  data-bs-toggle="modal"
                  data-bs-target="#productModal"
                >
                  <font-awesome-icon icon="fa-solid fa-circle-info" />
                  查看更多
                </button>
                <button
                  @click="postAddCartItem(goods.id)"
                  type="button"
                  class="btn btn-outline-danger"
                >
                  <font-awesome-icon icon="fa-solid fa-cart-shopping" />
                  加到購物車
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
    </div>
  </div>
  <GoodsListModal
    :modalTarget="modalTarget"
    @send-modal-target-qty="
      (qty) => {
        modalTargetQty = qty;
      }
    "
    @send-add-cart-item="
      (id) => {
        postAddCartItem(id);
      }
    "
  />
</template>

<style scoped>
.goodsImg {
  height: 100px;
  background-size: cover;
  background-position: center;
}
</style>
