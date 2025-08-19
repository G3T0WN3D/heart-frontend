<script>
import { api } from '../api';

export default {
  name: 'UpdateProfilePage',
  props:{ userId:{type:Number, required:true}},
  data(){ 
    return { 
      loading: true,
      mePhoto: '',      // ✅ huidige (of zojuist geüploade) foto tonen
      fileName: '',     // voor UI feedback
      form:{ username:'', bio:'', gender:'', birthdate:'', location:'' } 
    }; 
  },
  async mounted(){
    // 🧾 Huidige gegevens ophalen
    const me = await api.getMe(this.userId);
    if (me) {
      this.form.username = me.username || '';
      this.form.bio = me.bio || '';
      this.form.gender = me.gender || '';
      this.form.birthdate = me.birthdate || '';
      this.form.location = me.location || '';
      this.mePhoto = me.photo || ''; // ✅ filename/relatieve url vanuit backend
    }
    this.loading = false;
  },
  methods:{
    img(p){ return api.imgUrl(p); }, // ✅ helper voor absolute url
    async onFile(e){
      const file = e.target.files?.[0];
      if (!file) return;
      this.fileName = file.name;
      try {
        const res = await api.uploadPhoto(this.userId, file);
        // res: { url: '/images/xxx.jpg', filename: 'xxx.jpg', photoId: ... }
        // Toon meteen de nieuwe foto:
        this.mePhoto = res.filename; // werkt met img() helper
      } catch (err) {
        alert('Upload mislukt: ' + err.message);
      }
    },
    async save(){
      await api.updateProfile({ userId:this.userId, ...this.form });
      alert('Profiel opgeslagen');
    }
  }
}
</script>

<template>
  <div class="card" v-if="!loading">
    <h2>Mijn profiel</h2>

    <!-- ✅ Foto preview -->
    <div class="photo-block" v-if="mePhoto">
      <img :src="img(mePhoto)" alt="Profielfoto" class="avatar" />
    </div>

    <form @submit.prevent="save">
      <input v-model="form.username" placeholder="Username" />
      <input v-model="form.location" placeholder="Locatie" />
      <input v-model="form.birthdate" placeholder="Geboortedatum (YYYY-MM-DD)"/>
      <select v-model="form.gender">
        <option disabled value="">Geslacht</option>
        <option value="male">Man</option>
        <option value="female">Vrouw</option>
        <option value="other">Anders</option>
      </select>
      <textarea v-model="form.bio" placeholder="Bio"></textarea>

      <!-- ✅ Uploader -->
      <div class="uploader">
        <label class="btn">
          Upload foto
          <input type="file" accept="image/*" @change="onFile" hidden />
        </label>
        <span v-if="fileName">{{ fileName }}</span>
      </div>

      <button>Opslaan</button>
    </form>
  </div>
  <div v-else class="card">Profiel laden…</div>
</template>

<style scoped>
.card{ background:#fff; border-radius:20px; box-shadow:0 6px 20px rgba(0,0,0,.1); padding:24px; max-width:520px; margin:auto; }
form{ display:flex; flex-direction:column; gap:12px; }
input, select, textarea{ padding:12px 14px; border-radius:12px; border:1px solid #eee; }
button{ border:none; padding:12px 14px; border-radius:24px; background:#ff5864; color:#fff; cursor:pointer; }
button:hover{ filter:brightness(.95); }
.photo-block { display:flex; justify-content:center; margin-bottom:12px; }
.avatar { width:140px; height:140px; border-radius:50%; object-fit:cover; box-shadow:0 4px 12px rgba(0,0,0,.12); }
.uploader { display:flex; align-items:center; gap:10px; margin-top:8px; margin-bottom:16px; }
.btn { display:inline-block; background:#ff5864; color:#fff; padding:10px 14px; border-radius:14px; cursor:pointer; }
</style>
