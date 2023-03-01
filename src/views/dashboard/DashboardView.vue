<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '../../stores/dashboard.js';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;
const router = useRouter();
const { token } = storeToRefs(useDashboardStore());

function logout() {
  axios
    .post(`${apiUrl}/v2/logout`, {}, { headers: { Authorization: token.value } })
    .then((res) => {
      if (res.data.success === true) {
        alert(res.data.message);
        document.cookie = 'max-age = 0';
        document.cookie = 'Expires = Thu, 01 Jan 1970 00:00:00 GMT';
        token.value = '';
        router.push('/');
      } else {
        alert(res.data.message);
        router.push('/dashboard');
      }
    })
    .catch((err) => {
      alert(err.data.message);
    });
}

function getToken() {
  let cookieAry = document.cookie.split('; ');
  let cookieObj = {};
  cookieAry.forEach((item) => {
    let key = item.split('=')[0];
    let value = item.split('=')[1];
    cookieObj[key] = value;
  });
  token.value = cookieObj['token'];
}

getToken();
</script>

<template>
  <div class="container">
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <router-link
          :active-class="'active'"
          class="nav-link"
          aria-current="page"
          to="/dashboard/inventories"
          >產品管理</router-link
        >
      </li>
      <li class="nav-item">
        <router-link
          :active-class="'active'"
          class="nav-link"
          aria-current="page"
          to="/dashboard/orders"
          >訂單管理</router-link
        >
      </li>
      <li class="nav-item">
        <router-link
          :active-class="'active'"
          class="nav-link"
          aria-current="page"
          to="/dashboard/coupons"
          >優惠券管理</router-link
        >
      </li>
      <li class="nav-item">
        <a @click.prevent="logout()" class="nav-link">登出</a>
      </li>
    </ul>
    <RouterView />
  </div>
</template>

<style scoped></style>
