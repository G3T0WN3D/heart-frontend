<template>
  <div id="app">
    <nav class="navbar">
      <ul>
        <li v-for="(page, i) in visiblePages" :key="i"
            @click="changePage(page)"
            :class="{ active: activePage === page }">
          {{ label(page) }}
        </li>
        <li v-if="isLoggedIn" @click="logout">Logout</li>
      </ul>
    </nav>

    <div class="content">
      <Home v-if="activePage==='home'" />
      <Register v-if="activePage==='register'" @registered="onRegistered"/>
      <Login v-if="activePage==='login'" @loggedIn="onLoggedIn"/>
      <Swipe v-if="activePage==='swipe'" :userId="userId" @matched="openMatches"/>
      <Matches v-if="activePage==='matches'" :userId="userId" @openChat="openChat"/>
      <Chat v-if="activePage==='chat'" :userId="userId" :matchId="selectedMatchId"/>
      <UpdateProfile v-if="activePage==='update-profile'" :userId="userId"/>
      <AdminDashboard v-if="activePage==='admin-dashboard'" :userId="userId" />
    </div>

    <footer class="footer">
      <p>&copy; 2025 Heart</p>
    </footer>
  </div>
</template>

<script>
import Home from './components/Home.vue';
import Register from './components/Register.vue';
import Login from './components/Login.vue';
import Swipe from './components/Swipe.vue';
import Matches from './components/Matches.vue';
import Chat from './components/Chat.vue';
import UpdateProfile from './components/UpdateProfile.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import { api } from './api';

export default {
  components: { Home, Register, Login, Swipe, Matches, Chat, UpdateProfile, AdminDashboard },
  data() {
    return {
      isLoggedIn: false,
      userId: null,
      activePage: 'home',
      selectedMatchId: null,
    };
  },
  computed: {
    visiblePages() {
      if (!this.isLoggedIn) return ['home', 'register', 'login'];
      return ['home', 'swipe', 'matches', 'update-profile'];
    }
  },
  mounted() {
    // Sessie herstellen na refresh
    const s = api.getSession(); // { userId, isLoggedIn, activePage }
    if (s?.isLoggedIn && s?.userId) {
      this.isLoggedIn = true;
      this.userId = s.userId;
      this.activePage = s.activePage || 'swipe';
    }
  },
  methods: {
    label(page) {
      const map = {
        home: 'Home', register: 'Register', login: 'Login',
        swipe: 'Swipe', matches: 'Matches', 'update-profile': 'Profile'
      };
      return map[page] || page;
    },
    changePage(p) { 
      this.activePage = p; 
      api.setActivePage(p); 
    },
    onRegistered({ userId }) {
      this.isLoggedIn = true; this.userId = userId; this.changePage('swipe');
    },
    async onLoggedIn({ userId }) {
      this.isLoggedIn = true;
      this.userId = userId;

      const me = await api.getMe(userId);
      this.isAdmin = !!me.is_admin;

      // 🔽 Stuur admin meteen naar dashboard
      this.changePage(this.isAdmin ? 'admin-dashboard' : 'swipe');
    },
    logout() {
      this.isLoggedIn = false; this.userId = null; this.changePage('home');
    },
    openMatches() { this.changePage('matches'); },
    openChat(matchId) { this.selectedMatchId = matchId; this.changePage('chat'); }
  }
};
</script>

<style>
body { font-family: 'Poppins', sans-serif; margin:0; background:#fafafa; color:#333; }
#app { display:flex; flex-direction:column; min-height:100vh; }

/* Tinder-like navbar */
.navbar {
  background: linear-gradient(90deg, #ff5864, #ff655b, #ff7d5f);
  color:#fff; padding:12px 20px; box-shadow:0 2px 10px rgba(0,0,0,.15);
}
.navbar ul { list-style:none; display:flex; gap:18px; margin:0; padding:0; justify-content:center; }
.navbar li { cursor:pointer; padding:8px 14px; border-radius:24px; transition:.25s; }
.navbar li:hover { background: rgba(255,255,255,.2); }
.navbar li.active { background:#fff; color:#ff5864; }

.content { flex:1; padding:20px; max-width:900px; margin:auto; }
.footer { text-align:center; padding:12px; color:#777; background:#fff; border-top:1px solid #eee; }
</style>
