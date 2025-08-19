<template>
  <div class="card">
    <h2>Register</h2>
    <form @submit.prevent="submit">
      <input v-model="form.email" placeholder="Email" type="email" required />
      <input v-model="form.username" placeholder="Username" required />
      <input v-model="form.password" placeholder="Password" type="password" required />
      <button type="submit">Create account</button>
    </form>
  </div>
</template>

<script>
import { api } from '../api';
export default {
  name: 'RegisterPage',
  emits: ['registered'],
  data(){ return { form:{ email:'', username:'', password:'' }, loading:false, error:'' }; },
  methods:{
    async submit(){
      this.error=''; this.loading=true;
      try{
        const res = await api.register(this.form);
        this.$emit('registered', { userId: res.userId });
      }catch(e){ this.error='Kon niet registreren'; }
      finally{ this.loading=false; }
    }
  }
}
</script>

<style scoped>
.card { background:#fff; border-radius:20px; box-shadow:0 6px 20px rgba(0,0,0,.1); padding:24px; max-width:420px; margin:auto; }
form { display:flex; flex-direction:column; gap:12px; }
input { padding:12px 14px; border-radius:12px; border:1px solid #eee; }
button { border:none; padding:12px 14px; border-radius:24px; background:#ff5864; color:#fff; cursor:pointer; }
button:hover { filter:brightness(.95); }
</style>
