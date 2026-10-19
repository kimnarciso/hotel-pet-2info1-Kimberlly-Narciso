<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  buscarTutor,
  atualizarTutor,
} from '../services/tutores';

const route = useRoute();
const router = useRouter();

const tutor = ref({
  nome: '',
  telefone: '',
});

const carregando = ref(true);
const salvando = ref(false);
const erro = ref('');

async function carregarTutor() {
  try {
    const dados = await buscarTutor(route.params.id);

    tutor.value = {
      nome: dados.nome || '',
      telefone: dados.telefone || '',
    };
  } catch (e) {
    erro.value = e.message;
  } finally {
    carregando.value = false;
  }
}

function mascararTelefone(valor) {
  const numero = valor.replace(/\D/g, '').slice(0, 11);

  if (numero.length <= 2) {
    return numero ? `(${numero}` : '';
  }

  if (numero.length <= 6) {
    return `(${numero.slice(0, 2)}) ${numero.slice(2)}`;
  }

  if (numero.length <= 10) {
    return `(${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`;
  }

  return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
}

async function salvarAlteracoes() {
  erro.value = '';

  const telefone = tutor.value.telefone.replace(/\D/g, '');

  if (!tutor.value.nome.trim() || ![10, 11].includes(telefone.length)) {
    erro.value = 'Preencha corretamente o nome e o telefone.';
    return;
  }

  salvando.value = true;

  try {
    await atualizarTutor(route.params.id, {
      nome: tutor.value.nome.trim(),
      telefone: tutor.value.telefone,
    });

    await router.push(`/tutores/${route.params.id}`);
  } catch (e) {
    erro.value = e.message;
  } finally {
    salvando.value = false;
  }
}

onMounted(carregarTutor);
</script>

<template>
  <main class="container py-4">
    <h1 class="h2 mb-4">Editar tutor</h1>

    <div v-if="carregando" class="alert alert-info">
      Carregando dados...
    </div>

    <div v-if="erro" class="alert alert-danger">
      {{ erro }}
    </div>

    <form
      v-if="!carregando"
      class="card card-body shadow-sm"
      @submit.prevent="salvarAlteracoes"
    >
      <div class="mb-3">
        <label for="nome" class="form-label">
          Nome completo *
        </label>

        <input
          id="nome"
          v-model="tutor.nome"
          class="form-control"
          required
          maxlength="120"
        />
      </div>

      <div class="mb-3">
        <label for="telefone" class="form-label">
          Telefone *
        </label>

        <input
          id="telefone"
          :value="tutor.telefone"
          class="form-control"
          type="tel"
          placeholder="(47) 99999-9999"
          required
          @input="
            tutor.telefone = mascararTelefone($event.target.value)
          "
        />
      </div>

      <div class="d-flex gap-2">
        <button
          class="btn btn-success"
          type="submit"
          :disabled="salvando"
        >
          {{ salvando ? 'Salvando...' : 'Salvar alterações' }}
        </button>

        <RouterLink
          :to="`/tutores/${route.params.id}`"
          class="btn btn-outline-secondary"
        >
          Cancelar
        </RouterLink>
      </div>
    </form>
  </main>
</template>
