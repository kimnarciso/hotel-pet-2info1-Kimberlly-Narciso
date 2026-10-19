<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';

const route = useRoute();
const router = useRouter();

const pet = ref({
  nome: '',
  especie: '',
  tutorId: '',
});

const carregando = ref(true);
const salvando = ref(false);
const erro = ref('');

const API_URL = 'http://localhost:3000';

onMounted(async () => {
  try {
    const resposta = await fetch(`${API_URL}/pets/${route.params.id}`);

    if (!resposta.ok) {
      throw new Error('Pet não encontrado.');
    }

    const dados = await resposta.json();

    pet.value = {
      nome: dados.nome || '',
      especie: dados.especie || '',
      tutorId: dados.tutorId ?? '',
    };
  } catch (e) {
    erro.value = e.message;
  } finally {
    carregando.value = false;
  }
});

async function salvar() {
  erro.value = '';

  if (!pet.value.nome.trim() || !pet.value.especie) {
    erro.value = 'Preencha o nome e a espécie do pet.';
    return;
  }

  salvando.value = true;

  try {
    const resposta = await fetch(
      `${API_URL}/pets/${route.params.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: pet.value.nome.trim(),
          especie: pet.value.especie,
          tutorId: pet.value.tutorId,
        }),
      },
    );

    if (!resposta.ok) {
      throw new Error('Não foi possível atualizar o pet.');
    }

    await router.push(`/pets/${route.params.id}`);
  } catch (e) {
    erro.value = e.message;
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <main class="container py-4">
    <h1 class="h2 mb-4">Editar pet</h1>

    <div v-if="erro" class="alert alert-danger">
      {{ erro }}
    </div>

    <div v-if="carregando" class="alert alert-info">
      Carregando dados do pet...
    </div>

    <form
      v-else
      class="card card-body shadow-sm"
      @submit.prevent="salvar"
    >
      <div class="mb-3">
        <label for="nome" class="form-label">Nome do pet *</label>
        <input
          id="nome"
          v-model="pet.nome"
          class="form-control"
          required
          maxlength="100"
        />
      </div>

      <div class="mb-3">
        <label for="especie" class="form-label">Espécie *</label>
        <select
          id="especie"
          v-model="pet.especie"
          class="form-select"
          required
        >
          <option value="" disabled>Selecione a espécie</option>
          <option value="Cachorro">Cachorro</option>
          <option value="Gato">Gato</option>
        </select>
      </div>

      <div class="d-flex gap-2">
        <button
          type="submit"
          class="btn btn-success"
          :disabled="salvando"
        >
          {{ salvando ? 'Salvando...' : 'Salvar alterações' }}
        </button>

        <RouterLink
          :to="`/pets/${route.params.id}`"
          class="btn btn-outline-secondary"
        >
          Cancelar
        </RouterLink>
      </div>
    </form>
  </main>
</template>
