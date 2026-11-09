import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import router from './router';
import { useTemaStore } from './stores/tema';
import { useAuthStore } from './stores/auth';
import { me } from './api/auth';

const app = createApp(App);
app.use(createPinia());
useTemaStore(); // aplica o tema antes de montar, evitando piscar
app.use(router);
// Sessão salva: revalida o token e atualiza o usuário (o interceptor trata o 401)
const auth = useAuthStore();
if (auth.logado) me().then(auth.atualizarUsuario).catch(() => {});
app.mount('#app');
