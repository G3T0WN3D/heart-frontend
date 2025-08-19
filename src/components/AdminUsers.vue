<template>
  <div class="admin-dashboard">
    <h2>Admin Dashboard</h2>
    <div class="user-grid">
      <div v-for="user in users" :key="user.id" class="user-card">
        <img :src="api.imgUrl(user.photo)" alt="Profile" class="profile-photo" />
        <h3>{{ user.username }}</h3>
        <p>{{ user.email }}</p>
        <p>Geslacht: {{ user.gender || '–' }}</p>
        <p>Locatie: {{ user.location || '–' }}</p>
        <p>Geverifieerd: {{ user.verified ? '✔️' : '❌' }}</p>
        <p>Geband: {{ user.banned ? '❌' : '✔️' }}</p>
        <div class="actions">
          <button v-if="!user.verified" @click="verify(user)">Verifieer</button>
          <button v-if="!user.banned" @click="ban(user)">Ban</button>
          <button @click="remove(user.id)">Verwijder</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '../api';

export default {
  data() {
    return {
      users: [],
      adminId: null,
    };
  },
  async mounted() {
    const session = api.getSession();
    if (!session?.userId) return;
    this.adminId = session.userId;
    await this.loadUsers();
  },
  methods: {
    async loadUsers() {
      try {
        this.users = await api.getAllUsers(this.adminId);
      } catch (err) {
        console.error('Gebruikers ophalen mislukt:', err);
      }
    },
    async verify(user) {
      try {
        await api.verifyUser(user.id);
        user.verified = true;
        // Optioneel: await this.loadUsers();
      } catch (err) {
        console.error('Verifiëren mislukt:', err);
      }
    },
    async ban(user) {
      try {
        await api.banUser(user.id);
        user.banned = true;
        // Optioneel: await this.loadUsers();
      } catch (err) {
        console.error('Bannen mislukt:', err);
      }
    },
    async remove(userId) {
      try {
        await api.deleteUser(userId);
        this.users = this.users.filter(u => u.id !== userId);
      } catch (err) {
        console.error('Verwijderen mislukt:', err);
      }
    }
  },
  computed: {
    api() {
      return api; // zodat je api.imgUrl kunt gebruiken in template
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}
.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}
.user-card {
  background: #fff;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.profile-photo {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}
.actions button {
  margin: 4px;
  padding: 6px 10px;
  border: none;
  background-color: #ff5864;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
.actions button:hover {
  background-color: #e74c3c;
}
</style>
