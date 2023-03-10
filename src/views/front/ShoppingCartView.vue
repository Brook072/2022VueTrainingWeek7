<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { debounce } from "lodash";
import { useLoading } from "vue-loading-overlay";
const apiUrl = import.meta.env.VITE_API_URL;
const apiPath = import.meta.env.VITE_API_PATH;
const $loading = useLoading({
  color: "green",
  isFullPage: true,
  loader: "bars",
  lockScroll: true,
  opacity: 1,
});
const cartData = ref([]);
const cartTotalPrice = ref(0);
const cartFinalTotalPrice = ref(0);
const cartItemTarget = ref({});
const orderData = ref({
  user: {
    name: "",
    email: "",
    tel: "",
    address: "",
  },
  message: "",
});

function getCartItem() {
  axios.get(`${apiUrl}/v2/api/${apiPath}/cart`).then((res) => {
    cartData.value = {};
    cartData.value = res.data.data.carts;
    cartTotalPrice.value = res.data.data.total;
    cartFinalTotalPrice.value = res.data.data.final_total;
  });
}

const putCartItemQty = debounce(() => {
  axios
    .put(`${apiUrl}/v2/api/${apiPath}/cart/${cartItemTarget.value.id}`, {
      data: {
        product_id: cartItemTarget.value.product_id,
        qty: cartItemTarget.value.qty,
      },
    })
    .then(() => {
      getCartItem();
    })
    .catch((err) => {
      alert(err.data.message);
    });
}, 1000);

function deleteCartItem(id) {
  axios
    .delete(`${apiUrl}/v2/api/${apiPath}/cart/${id}`)
    .then((res) => {
      alert(res.data.message);
      getCartItem();
    })
    .catch((err) => {
      alert(err.data.message);
    });
}

function deleteCartAllItem() {
  let deleteConfirm = confirm("確定清空購物車？");
  if (deleteConfirm) {
    axios
      .delete(`${apiUrl}/v2/api/${apiPath}/carts`)
      .then((res) => {
        alert(res.data.message);
        getCartItem();
      })
      .catch((err) => {
        alert(err.data.message);
      });
  } else {
    return;
  }
}

function postOrder() {
  axios
    .post(`${apiUrl}/v2/api/${apiPath}/order`, {
      data: orderData.value,
    })
    .then((res) => {
      alert(res.data.message);
    })
    .catch((err) => {
      alert(err.data.message);
    });
}

function phoneValidate(value) {
  const phonePattern = /^(09)[0-9]{8}$/;
  if (value === "") {
    return "請輸入電話";
  } else if (!phonePattern.test(value)) {
    return "請確認電話格式是否有誤";
  } else {
    return true;
  }
}

function emailValidation(value) {
  const emailPattern =
    /^\w+((-\w+)|(\.\w+))*(@)[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  if (value === "") {
    return "請輸入電子郵件";
  } else if (!emailPattern.test(value)) {
    return "請確認電子郵件格式是否有誤";
  } else {
    return true;
  }
}

onMounted(() => {
  const loader = $loading.show();
  setTimeout(() => {
    loader.hide();
  }, 500);
});

getCartItem();
</script>

<template>
  <div class="container">
    <div class="mt-4">
      <div class="text-end">
        <button
          @click="deleteCartAllItem()"
          class="btn btn-outline-danger"
          type="button"
        >
          清空購物車
        </button>
      </div>
      <table class="table align-middle">
        <thead>
          <tr>
            <th></th>
            <th>品名</th>
            <th style="width: 150px">數量/單位</th>
            <th>單價</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="goods in cartData" :key="goods.id">
            <td>
              <button
                @click="deleteCartItem(goods.id)"
                type="button"
                class="btn btn-outline-danger btn-sm"
              >
                x
              </button>
            </td>
            <td>
              {{ goods.product.title }}
              <div class="text-success">已套用優惠券</div>
            </td>
            <td>
              <div class="input-group input-group-sm">
                <div class="input-group mb-3">
                  <input
                    min="1"
                    type="number"
                    class="form-control"
                    v-model="goods.qty"
                    @change="
                      cartItemTarget = goods;
                      putCartItemQty();
                    "
                  />
                  <span class="input-group-text" id="basic-addon2">{{
                    goods.product.unit
                  }}</span>
                </div>
              </div>
            </td>
            <td class="text-end">
              <small class="text-success">折扣價：</small>
              {{ goods.product.price }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="text-end">總計</td>
            <td class="text-end">{{ cartTotalPrice }}</td>
          </tr>
          <tr>
            <td colspan="3" class="text-end text-success">折扣價</td>
            <td class="text-end text-success">{{ cartFinalTotalPrice }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div class="my-5 row justify-content-center">
      <v-form
        @submit="postOrder()"
        ref="form"
        class="col-md-6"
        v-slot="{ errors }"
      >
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <v-field
            id="email"
            name="customerEmail"
            label="電子郵件"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': errors['customerEmail'] }"
            v-model="orderData.user.email"
            placeholder="請輸入 Email"
            :rules="emailValidation"
          ></v-field>
          <error-message
            name="customerEmail"
            class="invalid-feedback"
          ></error-message>
        </div>

        <div class="mb-3">
          <label for="name" class="form-label">收件人姓名</label>
          <v-field
            id="name"
            name="customerName"
            label="姓名"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors['customerName'] }"
            v-model="orderData.user.name"
            placeholder="請輸入姓名"
            rules="required"
          ></v-field>
          <error-message
            name="customerName"
            class="invalid-feedback"
          ></error-message>
        </div>

        <div class="mb-3">
          <label for="tel" class="form-label">收件人電話</label>
          <v-field
            id="tel"
            name="customerTel"
            label="電話"
            type="tel"
            class="form-control"
            :class="{ 'is-invalid': errors['customerTel'] }"
            v-model="orderData.user.tel"
            placeholder="請輸入電話"
            :rules="phoneValidate"
          ></v-field>
          <error-message
            name="customerTel"
            class="invalid-feedback"
          ></error-message>
        </div>

        <div class="mb-3">
          <label for="address" class="form-label">收件人地址</label>
          <v-field
            id="address"
            name="customerAddress"
            label="地址"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors['customerAddress'] }"
            v-model="orderData.user.address"
            placeholder="請輸入地址"
            rules="required"
          ></v-field>
          <error-message
            name="customerAddress"
            class="invalid-feedback"
          ></error-message>
        </div>

        <div class="mb-3">
          <label for="message" class="form-label">留言</label>
          <textarea
            id="message"
            class="form-control"
            v-model="orderData.message"
            cols="30"
            rows="10"
          ></textarea>
        </div>
        <div class="text-end">
          <button type="submit" class="btn btn-danger">送出訂單</button>
        </div>
      </v-form>
    </div>
  </div>
</template>

<style scoped>
.goodsImg {
  height: 100px;
  background-size: cover;
  background-position: center;
}
</style>
