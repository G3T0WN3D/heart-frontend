<template>
  <div class="chat">
    <div class="messages" ref="scroll">
      <div v-for="m in messages" :key="m.id"
           :class="['bubble', m.sender_id===userId?'me':'them']">
        {{ m.content }}
        <div class="time">{{ new Date(m.sent_at).toLocaleTimeString() }}</div>
      </div>
    </div>
    <form class="input" @submit.prevent="send">
      <input v-model="text" placeholder="Typ een bericht..." />
      <button>Stuur</button>
    </form>
</div>
</template>

<script>
import { api } from '../api';
export default {
  name: 'ChatBox',
  props:{ userId:{type:Number, required:true}, matchId:{type:Number, required:true}},
  data(){ return { messages:[], text:'' }; },
  async mounted(){
    await this.load();
    this.scrollBottom();
  },
  methods:{
    async load(){ this.messages = await api.getMessages({ matchId:this.matchId, userId:this.userId }); },
    async send(){
      if(!this.text.trim()) return;
      await api.sendMessage({ matchId:this.matchId, senderId:this.userId, content:this.text });
      this.text=''; await this.load(); this.scrollBottom();
    },
    scrollBottom(){ this.$nextTick(()=>{ const el=this.$refs.scroll; if(el) el.scrollTop = el.scrollHeight; }); }
  }
}
</script>

<style scoped>
.chat{ background:#fff; border-radius:16px; box-shadow:0 6px 20px rgba(0,0,0,.1); height:70vh; display:flex; flex-direction:column; }
.messages{ flex:1; overflow:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }
.bubble{ max-width:70%; padding:10px 14px; border-radius:16px; position:relative; }
.me{ align-self:flex-end; background:#ff5864; color:#fff; }
.them{ align-self:flex-start; background:#f0f0f0; }
.time{ font-size:11px; opacity:.7; margin-top:6px; }
.input{ display:flex; gap:10px; padding:10px; border-top:1px solid #eee; }
input{ flex:1; padding:12px 14px; border-radius:12px; border:1px solid #eee; }
button{ border:none; padding:12px 16px; border-radius:12px; background:#ff5864; color:#fff; cursor:pointer; }
</style>
