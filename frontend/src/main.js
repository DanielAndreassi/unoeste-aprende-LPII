import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import router from './router';
import { useTemaStore } from './stores/tema';

const app = createApp(App);
app.use(createPinia());
useTemaStore(); // aplica o tema antes de montar, evitando piscar
app.use(router);
app.mount('#app');
