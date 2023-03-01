<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '../../stores/dashboard.js';
const apiUrl = import.meta.env.VITE_API_URL;
const router = useRouter();
const username = ref('');
const password = ref('');
const { token } = storeToRefs(useDashboardStore());

function loginPost() {
  axios
    .post(`${apiUrl}/v2/admin/signin`, {
      username: username.value,
      password: password.value
    })
    .then((res) => {
      document.cookie = 'max-age = 86400';
      document.cookie = `token = ${res.data.token}`;
      document.cookie = 'Path = /';
      getToken();
      alert(res.data.message);
      router.push('/dashboard/inventories');
    })
    .catch((err) => {
      alert(err.response.data.message);
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
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <h1 class="h3 mt-3 mb-3 font-weight-normal text-center">歡迎回來！</h1>
      <div class="col-8">
        <form id="form" class="form-signin">
          <div class="form-floating mb-3">
            <input
              v-model="username"
              type="email"
              class="form-control"
              id="username"
              placeholder="name@example.com"
              required
              autocomplete="username"
            />
            <label for="username">Email address</label>
          </div>
          <div class="form-floating">
            <input
              v-model="password"
              type="password"
              class="form-control"
              id="password"
              placeholder="Password"
              required
              autocomplete="current-password"
            />
            <label for="password">Password</label>
          </div>
          <button
            @click.prevent="loginPost()"
            class="btn btn-lg btn-primary w-100 mt-3"
            type="submit"
          >
            登入
          </button>
        </form>
      </div>
    </div>
    <p class="mt-5 mb-3 text-muted text-center">&copy; 2021~∞ - 六角學院</p>
  </div>
</template>

<style scoped>
.form-signin {
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: auto;
}
</style>
