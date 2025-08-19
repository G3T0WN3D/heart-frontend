<template>
  <div class="swipe-container">

    <!-- 🔍 Filters -->
    <form class="filters" @submit.prevent="applyFilters">
      <select v-model="filters.gender">
        <option value="">Geslacht</option>
        <option value="male">Man</option>
        <option value="female">Vrouw</option>
        <option value="other">Anders</option>
      </select>
      <input type="number" v-model.number="filters.min_age" placeholder="Min leeftijd" />
      <input type="number" v-model.number="filters.max_age" placeholder="Max leeftijd" />
      <button>Toepassen</button>
    </form>

    <!-- 🖼 Profielkaart -->
    <div v-if="currentProfile" class="card"
         @mousedown="startDrag" @touchstart="startDrag"
         @mouseup="endDrag" @touchend="endDrag">
      <img :src="imgUrl(currentProfile.photo)" alt="Profile"/>
      <div class="card-content">
        <h2>{{ currentProfile.username }}, {{ age(currentProfile.birthdate) }}</h2>
        <p>{{ currentProfile.bio }}</p>
      </div>
    </div>
    <div v-else class="no-more">Geen profielen meer</div>

    <!-- ❤️ Acties -->
    <div class="action-buttons">
      <button class="dislike-btn" @click="swipe('left')">✖</button>
      <button class="like-btn" @click="swipe('right')">❤</button>
    </div>
  </div>
</template>

<script>
import { api } from '../api';

export default {
  name: 'SwipePage',
  props: { userId: { type: Number, required: true } },
  emits: ['matched'],
  data() {
    return {
      profiles: [],
      currentIndex: 0,
      startX: 0,
      filters: {
        gender: '',
        min_age: '',
        max_age: ''
      },
      fallbackImg: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'
    };
  },
  computed: {
    currentProfile() {
      return this.profiles[this.currentIndex] || null;
    }
  },
  async mounted() {
    await this.loadProfiles();
  },
  methods: {
    imgUrl(photo) {
      if (!photo) return this.fallbackImg;
      const url = api.imgUrl ? api.imgUrl(photo) : `http://localhost:3000/images/${photo}`;
      return url || this.fallbackImg;
    },
    age(b) {
      if (!b) return '—';
      const d = new Date(b);
      const diff = Date.now() - d.getTime();
      return Math.floor(diff / 31557600000);
    },
    async swipe(direction) {
      if (!this.currentProfile) return;
      const targetId = this.currentProfile.id;
      const res = await api.swipe({ swiperId: this.userId, targetId, direction });
      this.currentIndex++;
      if (res.matched) this.$emit('matched');
    },
    startDrag(e) {
      this.startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    },
    endDrag(e) {
      const endX = e.type.includes('mouse') ? e.clientX : e.changedTouches[0].clientX;
      const diff = endX - this.startX;
      if (diff > 100) this.swipe('right');
      else if (diff < -100) this.swipe('left');
    },
    async applyFilters() {
      await this.loadProfiles();
    },
    async loadProfiles() {
      const { gender, min_age, max_age} = this.filters;
      this.profiles = await api.getProfiles({ userId: this.userId, gender, min_age, max_age});
      this.currentIndex = 0;
    }
  }
};
</script>

<style scoped>
.swipe-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
  justify-content: center;
}
.filters input, .filters select {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,.1);
  width: 360px;
  height: 520px;
  user-select: none;
  margin-bottom: 20px;
}
.card img {
  width: 100%;
  height: 70%;
  object-fit: cover;
  background: #eee;
}
.card-content {
  padding: 16px;
}
.no-more {
  padding: 20px;
}

.action-buttons {
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  max-width: 260px;
}
.action-buttons button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  font-size: 22px;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,.2);
}
.like-btn {
  background: #4CAF50;
}
.dislike-btn {
  background: #F44336;
}
</style>
