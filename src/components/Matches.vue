<template>
  <div>
    <h2>Matches</h2>
    <div class="grid">
      <div
        v-for="m in matches"
        :key="m.match_id"
        class="match-card"
        @click="$emit('openChat', m.match_id)"
      >
        <img :src="img(m.photo)" alt="Match profiel" />
        <div class="info">
          <strong>{{ m.username }}</strong>
          <small>{{ m.location }}</small>
        </div>
      </div>
    </div>
    <p v-if="!matches.length">Nog geen matches 💔 — blijf swipen!</p>
  </div>
</template>

<script>
import { api } from '../api';

export default {
  name: 'MatchesList',
  props: { userId: { type: Number, required: true } },
  data() {
    return {
      matches: [],
      // Silhouet placeholder (vrij te gebruiken)
      fallbackImg: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'
    };
  },
  async mounted() {
    this.matches = await api.getMatches({ userId: this.userId });
  },
  methods: {
    img(p) {
      // Geen foto? -> placeholder
      if (!p) return this.fallbackImg;
      // Probeer absolute URL via helper; als dat niets oplevert -> placeholder
      const u = api.imgUrl(p);
      return u || this.fallbackImg;
    }
  }
};
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.match-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,.08);
  cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease;
}
.match-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,.12);
}
.match-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  background: #eee; /* prettige back-up kleur als de image traag laadt */
}
.info {
  padding: 10px 12px;
}
</style>
