<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  buscarTutor,
  listarPetsDoTutor,
  criarPetParaTutor,
  removerTutor,
} from '../services/tutores';

const route = useRoute();
const router = useRouter();

const tutor = ref(null);
const pets = ref([]);
const carregando = ref(true);
const erro = ref('');
const erroPet = ref('');
const sucessoPet = ref('');
const salvandoPet = ref(false);

const novoPet = ref({
  nome: '',
  especie: '',
});

async function carregarDados() {
  carregando.value = true;
  erro.value = '';

  try {
    tutor.value = await buscarTutor(route.params.id);
    pets.value = await listarPetsDoTutor(route.params.id);
  } catch (e) {
    erro.value = e.message;
  } finally {
    carregando.value = false;
  }
}

async function cadastrarPet() {
  erroPet.value = '';
  sucessoPet.value = '';

  if (
    !novoPet.value.nome.trim() ||
    !novoPet.value.especie
  ) {
    erroPet.value = 'Preencha o nome e a espécie do pet.';
    return;
  }

  salvandoPet.value = true;

  try {
    await criarPetParaTutor({
      nome: novoPet.value.nome.trim(),
      especie: novoPet.value.especie,
      tutorId: route.params.id,
    });

    novoPet.value = {
      nome: '',
      especie: '',
    };

    pets.value = await listarPetsDoTutor(route.params.id);
    sucessoPet.value = 'Pet cadastrado com sucesso!';
  } catch (e) {
    erroPet.value = e.message;
  } finally {
    salvandoPet.value = false;
  }
}

async function excluirTutor() {
  if (!window.confirm('Deseja realmente remover este tutor?')) {
    return;
  }

  try {
    pets.value = await listarPetsDoTutor(route.params.id);

    if (pets.value.length > 0) {
      erro.value =
        'Este tutor possui pets vinculados. Remova ou transfira os pets antes de excluir o tutor.';
      return;
    }

    await removerTutor(route.params.id);
    await router.push('/tutores');
  } catch (e) {
    erro.value = e.message;
  }
}

onMounted(carregarDados);
</script>

<template>
  <main class="container py-4">
    <div v-if="carregando" class="alert alert-info">
      Carregando dados do tutor...
    </div>

    <div v-if="erro" class="alert alert-danger">
      {{ erro }}
    </div>

    <template v-if="!carregando && tutor">
      <header
        class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4"
      >
        <div>
          <h1 class="h2">Detalhes do tutor</h1>
          <p class="text-body-secondary mb-0">
            Informações cadastrais e animais vinculados.
          </p>
        </div>

        <div class="d-flex gap-2">
          <RouterLink
            :to="`/tutores/${tutor.id}/editar`"
            class="btn btn-warning"
          >
            Editar tutor
          </RouterLink>

          <RouterLink
            to="/tutores"
            class="btn btn-outline-secondary"
          >
            Voltar
          </RouterLink>
        </div>
      </header>

      <section class="card shadow-sm mb-4">
        <div class="card-header">
          <h2 class="h5 mb-0">Dados do tutor</h2>
        </div>

        <div class="card-body">
          <p><strong>ID:</strong> {{ tutor.id }}</p>
          <p><strong>Nome:</strong> {{ tutor.nome }}</p>
          <p class="mb-0">
            <strong>Telefone:</strong> {{ tutor.telefone }}
          </p>
        </div>
      </section>

      <section class="card shadow-sm mb-4">
        <div class="card-header">
          <h2 class="h5 mb-0">
            Pets vinculados ({{ pets.length }})
          </h2>
        </div>

        <div class="card-body">
          <p v-if="pets.length === 0" class="mb-0">
            Nenhum pet vinculado a este tutor.
          </p>

          <div v-else class="table-responsive">
            <table class="table table-striped align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Espécie</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="pet in pets" :key="pet.id">
                  <td>{{ pet.id }}</td>
                  <td>{{ pet.nome }}</td>
                  <td>{{ pet.especie }}</td>
                  <td>
                    <RouterLink
                      :to="`/pets/${pet.id}`"
                      class="btn btn-sm btn-outline-primary me-1"
                    >
                      Visualizar
                    </RouterLink>

                    <RouterLink
                      :to="`/pets/${pet.id}/editar`"
                      class="btn btn-sm btn-warning"
                    >
                      Editar
                    </RouterLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="card shadow-sm mb-4">
        <div class="card-header">
          <h2 class="h5 mb-0">Cadastrar pet para este tutor</h2>
        </div>

        <div class="card-body">
          <div v-if="erroPet" class="alert alert-danger">
            {{ erroPet }}
          </div>

          <div v-if="sucessoPet" class="alert alert-success">
            {{ sucessoPet }}
          </div>

          <form @submit.prevent="cadastrarPet">
            <div class="mb-3">
              <label for="nomePet" class="form-label">
                Nome do pet
              </label>

              <input
                id="nomePet"
                v-model="novoPet.nome"
                class="form-control"
                required
                maxlength="100"
              />
            </div>

            <div class="mb-3">
              <label for="especiePet" class="form-label">
                Espécie
              </label>

              <select
                id="especiePet"
                v-model="novoPet.especie"
                class="form-select"
                required
              >
                <option value="" disabled>
                  Selecione a espécie
                </option>
                <option value="Cachorro">Cachorro</option>
                <option value="Gato">Gato</option>
              </select>
            </div>

            <button
              type="submit"
              class="btn btn-success"
              :disabled="salvandoPet"
            >
              {{ salvandoPet ? 'Salvando...' : 'Cadastrar pet' }}
            </button>
          </form>
        </div>
      </section>

      <button class="btn btn-outline-danger" @click="excluirTutor">
        Excluir tutor
      </button>
    </template>
  </main>
</template>
