<script setup>
import { Modal } from 'bootstrap';
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '../../stores/dashboard.js';
const { modalTarget } = storeToRefs(useDashboardStore());
const emit = defineEmits(['sendPaidStatesPut']);
const orderModalBS = ref({});
let orderPaidState;

function orderDateRender(date) {
  let orderDate = new Date(date);
  return `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}-${orderDate.getDate()}`;
}

onMounted(() => {
  orderModalBS.value = new Modal(document.getElementById('orderModal'));
});

watch(modalTarget, () => {
  orderPaidState = modalTarget.value.is_paid;
});
</script>

<template>
  <div
    class="modal fade"
    id="orderModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
    ref="modal"
  >
    <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content border-0">
        <div class="modal-header bg-dark text-white">
          <h5 class="modal-title" id="exampleModalLabel">
            <span>訂單細節</span>
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-4">
              <h3>用戶資料</h3>
              <table class="table">
                <tbody v-if="modalTarget.user">
                  <tr>
                    <th style="width: 100px">姓名</th>
                    <td>{{ modalTarget.user.name }}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{{ modalTarget.user.email }}</td>
                  </tr>
                  <tr>
                    <th>電話</th>
                    <td>{{ modalTarget.user.tel }}</td>
                  </tr>
                  <tr>
                    <th>地址</th>
                    <td>{{ modalTarget.user.address }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col-md-8">
              <h3>訂單細節</h3>
              <table class="table">
                <tbody>
                  <tr>
                    <th style="width: 100px">訂單編號</th>
                    <td>{{ modalTarget.id }}</td>
                  </tr>
                  <tr>
                    <th>下單時間</th>
                    <td>{{ orderDateRender(modalTarget.create_at) }}</td>
                  </tr>
                  <tr>
                    <th>付款時間</th>
                    <td>
                      <span v-if="modalTarget.paid_date">
                        {{ orderDateRender(modalTarget.paid_date) }}
                      </span>
                      <span v-else>尚無付款時間</span>
                    </td>
                  </tr>
                  <tr>
                    <th>付款狀態</th>
                    <td>
                      <strong v-if="orderPaidState" class="text-success">已付款</strong>
                      <span v-else class="text-muted">尚未付款</span>
                    </td>
                  </tr>
                  <tr>
                    <th>總金額</th>
                    <td>
                      {{
                        new Intl.NumberFormat('zh-TW', {
                          style: 'currency',
                          currency: 'NTD'
                        }).format(modalTarget.total)
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <h3>選購商品</h3>
              <table class="table">
                <thead>
                  <tr></tr>
                </thead>
                <tbody>
                  <tr v-for="item in modalTarget.products" :key="item.id">
                    <th>
                      {{ item.product.title }}
                    </th>
                    <td>{{ item.qty }} / {{ item.product.unit }}</td>
                    <td class="text-end"></td>
                  </tr>
                </tbody>
              </table>
              <div class="d-flex justify-content-end">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    value=""
                    id="flexCheckDefault"
                    v-model="modalTarget.is_paid"
                  />
                  <label class="form-check-label" for="flexCheckDefault">
                    <span v-if="modalTarget.is_paid">已付款</span>
                    <span v-else>未付款</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            取消
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="
              emit('sendPaidStatesPut');
              orderModalBS.hide();
            "
          >
            修改付款狀態
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
