<script setup>
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import axios from 'axios';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '../../stores/dashboard.js';
const productModalBS = ref({});
const productModalDOM = ref({});
const imgShowed = ref('');
const imageOnChange = ref('');
const imgUploaded = ref('');
const apiUrl = import.meta.env.VITE_API_URL;
const apiPath = import.meta.env.VITE_API_PATH;
const { token, modalType, modalTarget } = storeToRefs(useDashboardStore());
const emit = defineEmits(['sendDataGet']);

function changeImage(img) {
  imageOnChange.value = img;
  imgShowed.value = img;
}

function editGoodsPut() {
  axios
    .put(
      `${apiUrl}/v2/api/${apiPath}/admin/product/${modalTarget.value.id}`,
      {
        data: modalTarget.value
      },
      {
        headers: {
          Authorization: token.value
        }
      }
    )
    .then((res) => {
      alert(res.data.message);
      emit('sendDataGet');
      productModalBS.value.hide();
    })
    .catch((err) => {
      alert(err.data.message);
    });
}

function addImage() {
  if (imgShowed.value === '') {
    alert('請填入網址');
    return;
  }
  let imgIsExisted;
  if (!modalTarget.value.imagesUrl) modalTarget.value.imagesUrl = [];
  if (
    modalTarget.value.imageUrl === imgShowed.value ||
    modalTarget.value.imagesUrl.includes(imgShowed.value)
  )
    imgIsExisted = true;
  if (!modalTarget.value.imageUrl && !imgIsExisted) {
    modalTarget.value.imageUrl = imgShowed.value;
    imgShowed.value = '';
  } else if (!imgIsExisted) {
    modalTarget.value.imagesUrl.push(imgShowed.value);
    imgShowed.value = '';
  }
}

function editImage() {
  if (imageOnChange.value === modalTarget.value.imageUrl) {
    modalTarget.value.imageUrl = imgShowed.value;
    imageOnChange.value = '';
  } else {
    let key = modalTarget.value.imagesUrl.indexOf(imageOnChange.value);
    modalTarget.value.imagesUrl[key] = imgShowed.value;
    imageOnChange.value = '';
  }
}

function deleteImage() {
  if (imageOnChange.value === modalTarget.value.imageUrl) {
    modalTarget.value.imageUrl = '';
    imageOnChange.value = '';
  } else {
    let key = modalTarget.value.imagesUrl.indexOf(imageOnChange.value);
    modalTarget.value.imagesUrl.splice(key, 1);
    imageOnChange.value = '';
    imgShowed.value = '';
  }
}

function uploadImage() {
  let imageUploaded = new FormData();
  imageUploaded.append('file-to-upload', document.getElementById('imageUpload').files[0]);

  axios
    .post(`${apiUrl}/v2/api/${apiPath}/admin/upload`, imageUploaded, {
      headers: {
        Authorization: token.value
      }
    })
    .then((res) => {
      alert('圖片上傳成功');
      imgUploaded.value = res.data.imageUrl;
      changeImage(imgUploaded.value);
      addImage();
    })
    .catch((err) => {
      console.log(err);
    });
}

function addGoodsPost() {
  axios
    .post(
      `${apiUrl}/v2/api/${apiPath}/admin/product`,
      { data: modalTarget.value },
      {
        headers: {
          Authorization: token.value
        }
      }
    )
    .then((res) => {
      alert(res.data.message);
      emit('sendDataGet');
      productModalBS.value.hide();
    })
    .catch((err) => {
      alert(err.data.message);
    });
}

onMounted(() => {
  productModalBS.value = new Modal(document.getElementById('productModal'));
  productModalDOM.value = document.getElementById('productModal');
  productModalDOM.value.addEventListener('hidden.bs.modal', () => {
    modalTarget.value = {};
    imgShowed.value = '';
  });
});
</script>
<template>
  <div
    id="productModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="productModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-xl">
      <div class="modal-content border-0">
        <div class="modal-header bg-dark text-white">
          <h5 id="productModalLabel" class="modal-title">
            <span>{{ modalTarget === '' ? '新增產品' : '編輯產品' }}</span>
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
            <div class="col-sm-4">
              <div class="mb-2">
                <div class="mb-3">
                  <label for="imageUrl" class="form-label">輸入圖片網址</label>
                  <input
                    v-model="imgShowed"
                    type="text"
                    class="form-control"
                    placeholder="請輸入圖片連結"
                  />
                </div>
                <img class="img-fluid" :src="imgShowed" alt="" />
              </div>
              <div v-if="imageOnChange === ''">
                <button
                  @click.prevent="addImage()"
                  class="btn btn-outline-primary btn-sm d-block w-100 mb-2"
                >
                  新增圖片
                </button>
              </div>
              <div v-if="imageOnChange != ''">
                <button
                  @click.prevent="editImage()"
                  class="btn btn-outline-primary btn-sm d-block w-100 mb-2"
                >
                  修改圖片
                </button>
              </div>
              <div v-if="imageOnChange != ''">
                <button
                  @click.prevent="deleteImage()"
                  class="btn btn-outline-danger btn-sm d-block w-100 mb-2"
                >
                  刪除圖片
                </button>
              </div>
              <div v-if="imageOnChange != ''">
                <button
                  @click.prevent="changeImage('')"
                  class="btn btn-outline-danger btn-sm d-block w-100 mb-2"
                >
                  取消
                </button>
              </div>
              <div>
                <label
                  class="imageUploadBtn d-flex flex-column align-items-center rounded p-3"
                  for="imageUpload"
                >
                  <input
                    @change="uploadImage()"
                    type="file"
                    id="imageUpload"
                    name="file-to-upload"
                    class="d-none"
                    formenctype="multipart/form-data"
                    accept=".jpg, .jpeg, .png"
                  />
                  <font-awesome-icon icon="fa-regular fa-image" class="fs-2" />
                  <span class="fs-6 text-dark">上傳圖片</span>
                </label>
              </div>
              <div class="mt-3" v-if="modalTarget.imageUrl">
                <span>圖片列表</span>
                <div>
                  <button
                    @click.prevent="changeImage(modalTarget.imageUrl)"
                    class="btn btn-outline-success d-block w-100 btn-sm mb-1"
                  >
                    主要圖片
                  </button>
                  <button
                    @click.prevent="changeImage(img)"
                    v-for="img in modalTarget.imagesUrl"
                    :key="modalTarget.imagesUrl.indexOf(img)"
                    class="btn btn-outline-success d-block w-100 btn-sm mb-1"
                  >
                    次要圖片{{ modalTarget.imagesUrl.indexOf(img) }}
                  </button>
                </div>
              </div>
            </div>
            <div class="col-sm-8">
              <div class="mb-3">
                <label for="title" class="form-label">標題</label>
                <input
                  v-model="modalTarget.title"
                  id="title"
                  type="text"
                  class="form-control"
                  placeholder="請輸入標題"
                />
              </div>

              <div class="row">
                <div class="mb-3 col-md-6">
                  <label for="category" class="form-label">分類</label>
                  <input
                    v-model="modalTarget.category"
                    id="category"
                    type="text"
                    class="form-control"
                    placeholder="請輸入分類"
                  />
                </div>
                <div class="mb-3 col-md-6">
                  <label for="price" class="form-label">單位</label>
                  <input
                    v-model="modalTarget.unit"
                    id="unit"
                    type="text"
                    class="form-control"
                    placeholder="請輸入單位"
                  />
                </div>
              </div>

              <div class="row">
                <div class="mb-3 col-md-6">
                  <label for="origin_price" class="form-label">原價</label>
                  <input
                    v-model.number="modalTarget.origin_price"
                    id="origin_price"
                    type="number"
                    min="0"
                    class="form-control"
                    placeholder="請輸入原價"
                  />
                </div>
                <div class="mb-3 col-md-6">
                  <label for="price" class="form-label">售價</label>
                  <input
                    v-model.number="modalTarget.price"
                    id="price"
                    type="number"
                    min="0"
                    class="form-control"
                    placeholder="請輸入售價"
                  />
                </div>
                <div class="mb-3 col-md-6">
                  <label for="rate" class="form-label">星數</label>
                  <select v-model="modalTarget.rate" id="rate" class="form-control">
                    <option value="">請選擇星數</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              </div>
              <hr />
              <div class="mb-3">
                <label for="description" class="form-label">產品描述</label>
                <textarea
                  v-model="modalTarget.description"
                  id="description"
                  type="text"
                  class="form-control"
                  placeholder="請輸入產品描述"
                >
                </textarea>
              </div>
              <div class="mb-3">
                <label for="content" class="form-label">說明內容</label>
                <textarea
                  v-model="modalTarget.content"
                  id="content"
                  type="text"
                  class="form-control"
                  placeholder="請輸入說明內容"
                >
                </textarea>
              </div>
              <div class="mb-3">
                <div class="form-check">
                  <input
                    v-model="modalTarget.is_enabled"
                    id="is_enabled"
                    class="form-check-input"
                    type="checkbox"
                    :true-value="1"
                    :false-value="0"
                  />
                  <label class="form-check-label" for="is_enabled">是否啟用</label>
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
            v-if="modalType === 'add'"
            @click.prevent="addGoodsPost()"
            class="btn btn-primary"
          >
            確認
          </button>
          <button v-else @click.prevent="editGoodsPut()" class="btn btn-primary">確認</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.imageUploadBtn {
  border: 2px;
  border-radius: 12px;
  border-style: dashed;
  border-color: lightgray;
}
</style>
