<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  listarTutores,
  listarPetsDoTutor,
  removerTutor,
} from '../services/tutores';

const tutores = ref([]);
const carregando = ref(true);
const erro = ref('');

async function carregarTutores() {
  carregando.value = true;
  erro.value = '';

  try {
    const lista = await listarTutores();

    tutores.value = await Promise.all(
      lista.map(async (tutor) => {
        try {
          const pets = await listarPetsDoTutor(tutor.id);

          return {
            ...tutor,
            petsVinculados: pets,
          };
        } catch {
          return {
            ...tutor,
            petsVinculados: [],
          };
        }
      }),
    );
  } catch (e) {
    erro.value = e.message;
  } finally {
    carregando.value = false;
  }
}

async function excluirTutor(tutor) {
  if (!window.confirm('Deseja realmente remover este tutor?')) {
    return;
  }

  try {
    const pets = await listarPetsDoTutor(tutor.id);

    if (pets.length > 0) {
      alert(
        'Este tutor possui pets vinculados. Remova ou transfira os pets antes de excluir o tutor.',
      );
      return;
    }

    await removerTutor(tutor.id);
    await carregarTutores();
  } catch (e) {
    erro.value = e.message;
  }
}

onMounted(carregarTutores);
</script>

<template>
  <main class="container py-4">
    <div
      class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4"
    >
      <div>
        <h1 class="h2">Listagem de Tutores</h1>
        <p class="text-body-secondary mb-0">
          Consulte os tutores e seus pets vinculados.
        </p>
      </div>

      <RouterLink to="/tutores/novo" class="btn btn-primary">
        Novo tutor
      </RouterLink>
    </div>

    <div v-if="erro" class="alert alert-danger">
      {{ erro }}
    </div>

    <div v-if="carregando" class="alert alert-info">
      Carregando tutores...
    </div>

    <div
      v-else-if="tutores.length === 0"
      class="alert alert-info"
    >
      Nenhum tutor cadastrado.
    </div>

    <div v-else class="table-responsive">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>Nome completo</th>
            <th>Telefone</th>
            <th>Quantidade de pets</th>
            <th>Pets vinculados</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="tutor in tutores" :key="tutor.id">
            <td>{{ tutor.id }}</td>
            <td>{{ tutor.nome }}</td>
            <td>{{ tutor.telefone }}</td>
            <td>{{ tutor.petsVinculados.length }}</td>

            <td>
              <span v-if="tutor.petsVinculados.length">
                {{
                  tutor.petsVinculados
                    .map((pet) => pet.nome)
                    .join(', ')
                }}
              </span>

              <span v-else class="text-body-secondary">
                Nenhum pet
              </span>
            </td>

            <td class="text-nowrap">
              <RouterLink
                :to="`/tutores/${tutor.id}`"
                class="btn btn-sm btn-outline-primary me-1"
              >
                Visualizar
              </RouterLink>

              <RouterLink
                :to="`/tutores/${tutor.id}/editar`"
                class="btn btn-sm btn-outline-secondary me-1"
              >
                Editar
              </RouterLink>

              <button
                class="btn btn-sm btn-outline-danger"
                @click="excluirTutor(tutor)"
              >
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
