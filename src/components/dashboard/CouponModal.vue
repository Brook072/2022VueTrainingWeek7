<script setup>
import { Modal } from 'bootstrap';
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '../../stores/dashboard.js';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;
const apiPath = import.meta.env.VITE_API_PATH;
const { token, modalTarget } = storeToRefs(useDashboardStore());
const emit = defineEmits(['sendDataGet']);
const couponModalBS = ref({});
const couponModalDOM = ref({});

function addCouponPost() {
  modalTarget.value.due_date = Date.parse(modalTarget.value.due_date);
  delete modalTarget.value.isNew;
  axios
    .post(
      `${apiUrl}/v2/api/${apiPath}/admin/coupon`,
      { data: modalTarget.value },
      {
        headers: {
          Authorization: token.value
        }
      }
    )
    .then((res) => {
      console.log(res);
      alert(res.data.message);
      emit('sendDataGet');
      couponModalBS.value.hide();
    })
    .catch((err) => {
      console.log(err);
      alert(err.data.message);
    });
}

function editCouponPut() {
  modalTarget.value.due_date = Date.parse(modalTarget.value.due_date);
  axios
    .put(
      `${apiUrl}/v2/api/${apiPath}/admin/coupon/${modalTarget.value.id}`,
      { data: modalTarget.value },
      {
        headers: {
          Authorization: token.value
        }
      }
    )
    .then((res) => {
      console.log(res);
      alert(res.data.message);
      emit('sendDataGet');
      couponModalBS.value.hide();
    })
    .catch((err) => {
      console.log(err);
      alert(err.data.message);
    });
}

onMounted(() => {
  couponModalBS.value = new Modal(document.getElementById('couponModal'));
  couponModalDOM.value = document.getElementById('couponModal');
  couponModalDOM.value.addEventListener('hidden.bs.modal', () => {
    modalTarget.value = {};
  });
});
</script>

<template>
  <div
    class="modal fade"
    id="couponModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
    ref="modal"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">
            <span v-if="modalTarget.isNew">???????????????</span>
            <span v-else>???????????????</span>
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="title">??????</label>
            <input
              type="text"
              class="form-control"
              id="title"
              v-model="modalTarget.title"
              placeholder="???????????????"
            />
          </div>
          <div class="mb-3">
            <label for="coupon_code">?????????</label>
            <input
              type="text"
              class="form-control"
              id="coupon_code"
              v-model="modalTarget.code"
              placeholder="??????????????????"
            />
          </div>
          <div class="mb-3">
            <label for="due_date">?????????</label>
            <input type="date" class="form-control" id="due_date" v-model="modalTarget.due_date" />
          </div>
          <div class="mb-3">
            <label for="price">???????????????</label>
            <input
              type="number"
              class="form-control"
              id="price"
              min="0"
              v-model.number="modalTarget.percent"
              placeholder="????????????????????????"
            />
          </div>
          <div class="mb-3">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                :true-value="1"
                :false-value="0"
                v-model="modalTarget.is_enabled"
                id="is_enabled"
              />
              <label class="form-check-label" for="is_enabled"> ???????????? </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">??????</button>
          <button
            type="button"
            class="btn btn-primary"
            @click="
              if (modalTarget.isNew) {
                addCouponPost();
              } else {
                editCouponPut();
              }
            "
          >
            {{ modalTarget.isNew ? '???????????????' : '???????????????' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
