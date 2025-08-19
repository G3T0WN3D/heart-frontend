<template>
  <div class="card">
    <h2>Login</h2>
    <form @submit.prevent="submit">
      <input v-model="email" placeholder="Email" type="email" required />
      <input v-model="password" placeholder="Password" type="password" required />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import { api } from '../api';
export default {
  name: 'LoginPage',
  emits: ['loggedIn'],
  data(){ return { email:'', password:'' }; },
  methods:{
    async submit(){
      const res = await api.login({ email:this.email, password:this.password });
      this.$emit('loggedIn', { userId: res.userId });
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
