<template>
  <div class="admin-dashboard">
    <h2>👮 Admin Dashboard</h2>
    <div class="grid">
      <div v-for="user in users" :key="user.id" class="card">
        <img :src="img(user.photo)" alt="Profielfoto" />
        <div class="info">
          <strong>{{ user.username }}</strong>
          <p>{{ user.email }}</p>
          <p>Geslacht: {{ user.gender || '—' }}</p>
          <p>Leeftijd: {{ age(user.birthdate) }}</p>
        </div>
        <div class="actions">
          <button v-if="!user.verified" @click="verify(user.id)">✔ Verifieer</button>
          <button v-if="!user.banned" @click="ban(user.id)">🚫 Ban</button>
          <span v-else class="banned-label">Geband</span>
          <button @click="remove(user.id)">🗑 Verwijder</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '../api';

export default {
  name: 'AdminDashboard',
  data() {
    return {
      users: [],
      fallbackImg: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'
    };
  },
  async mounted() {
    const s = api.getSession();
    if (!s?.userId) return;
    this.users = await api.getAllUsers(s.userId);
    },
  methods: {
    img(photo) {
      const u = api.imgUrl(photo);
      return u || this.fallbackImg;
    },
    age(birthdate) {
      if (!birthdate) return '—';
      const d = new Date(birthdate);
      const diff = Date.now() - d.getTime();
      return Math.floor(diff / 31557600000);
    },
    async verify(id) {
      await api.verifyUser(id);
      const user = this.users.find(u => u.id === id);
      if (user) user.verified = true;
    },
    async ban(id) {
      await api.banUser(id);
      const user = this.users.find(u => u.id === id);
      if (user) user.banned = true;
    },
    async remove(id) {
      if (confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) {
        await api.deleteUser(id);
        this.refresh();
      }
    },
    async refresh() {
        if (!this.userId) return; // extra beveiliging
        this.users = await api.getAllUsers(this.userId);
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,.1);
  overflow: hidden;
  text-align: center;
}
.card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  background: #eee;
}
.info {
  padding: 10px;
}
.actions {
  display: flex;
  justify-content: space-around;
  padding: 10px;
  gap: 6px;
}
.actions button {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.banned-label {
  color: red;
  font-weight: bold;
}
</style>
