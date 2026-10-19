<script setup>
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { criarTutor } from '../services/tutores';

const router = useRouter();

const tutor = ref({
  nome: '',
  telefone: '',
  email: '',
  cpfCnpj: '',
});

const erro = ref('');
const salvando = ref(false);
const tentouEnviar = ref(false);

const telefoneNumeros = computed(() =>
  tutor.value.telefone.replace(/\D/g, ''),
);

const nomeValido = computed(
  () => tutor.value.nome.trim().length > 0,
);

const telefoneValido = computed(
  () =>
    telefoneNumeros.value.length === 10 ||
    telefoneNumeros.value.length === 11,
);

const emailValido = computed(
  () =>
    !tutor.value.email.trim() ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tutor.value.email),
);

const documentoValido = computed(() => {
  const numero = tutor.value.cpfCnpj.replace(/\D/g, '');

  return (
    numero.length === 0 ||
    numero.length === 11 ||
    numero.length === 14
  );
});

const formularioValido = computed(
  () =>
    nomeValido.value &&
    telefoneValido.value &&
    emailValido.value &&
    documentoValido.value,
);

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

function mascararDocumento(valor) {
  const numero = valor.replace(/\D/g, '').slice(0, 14);

  if (numero.length <= 11) {
    return numero
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  return numero
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

async function salvarTutor() {
  tentouEnviar.value = true;
  erro.value = '';

  if (!formularioValido.value) return;

  salvando.value = true;

  try {
    await criarTutor({
      nome: tutor.value.nome.trim(),
      telefone: tutor.value.telefone,
      ...(tutor.value.email.trim()
        ? { email: tutor.value.email.trim() }
        : {}),
      ...(tutor.value.cpfCnpj.trim()
        ? { cpfCnpj: tutor.value.cpfCnpj }
        : {}),
    });

    await router.push('/tutores');
  } catch (e) {
    erro.value = e.message;
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <main class="container py-4">
    <h1 class="h2 mb-1">Cadastrar tutor</h1>

    <p class="text-body-secondary mb-4">
      Preencha os dados do tutor.
    </p>

    <div v-if="erro" class="alert alert-danger">
      {{ erro }}
    </div>

    <form
      class="card card-body shadow-sm"
      novalidate
      @submit.prevent="salvarTutor"
    >
      <div class="mb-3">
        <label for="nome" class="form-label">
          Nome completo *
        </label>

        <input
          id="nome"
          v-model="tutor.nome"
          class="form-control"
          :class="{
            'is-invalid': tentouEnviar && !nomeValido,
          }"
          maxlength="120"
          autocomplete="name"
        />

        <div
          v-if="tentouEnviar && !nomeValido"
          class="invalid-feedback"
        >
          Ops, campo obrigatório, por favor preencha-o!
        </div>
      </div>

      <div class="mb-3">
        <label for="telefone" class="form-label">
          Telefone *
        </label>

        <input
          id="telefone"
          :value="tutor.telefone"
          class="form-control"
          :class="{
            'is-invalid': tentouEnviar && !telefoneValido,
          }"
          type="tel"
          placeholder="(47) 99999-9999"
          autocomplete="tel"
          @input="
            tutor.telefone = mascararTelefone($event.target.value)
          "
        />

        <div
          v-if="tentouEnviar && !telefoneValido"
          class="invalid-feedback"
        >
          Ops, campo obrigatório, por favor preencha-o!
        </div>
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">
          E-mail (opcional)
        </label>

        <input
          id="email"
          v-model="tutor.email"
          type="email"
          class="form-control"
          :class="{
            'is-invalid': tentouEnviar && !emailValido,
          }"
          autocomplete="email"
        />

        <div
          v-if="tentouEnviar && !emailValido"
          class="invalid-feedback"
        >
          Informe um e-mail válido.
        </div>
      </div>

      <div class="mb-3">
        <label for="cpfCnpj" class="form-label">
          CPF/CNPJ (opcional)
        </label>

        <input
          id="cpfCnpj"
          :value="tutor.cpfCnpj"
          class="form-control"
          placeholder="CPF ou CNPJ"
          :class="{
            'is-invalid': tentouEnviar && !documentoValido,
          }"
          @input="
            tutor.cpfCnpj = mascararDocumento($event.target.value)
          "
        />

        <div
          v-if="tentouEnviar && !documentoValido"
          class="invalid-feedback"
        >
          Informe 11 dígitos para CPF ou 14 para CNPJ.
        </div>
      </div>

      <div class="d-flex gap-2">
        <button
          class="btn btn-success"
          type="submit"
          :disabled="salvando || !formularioValido"
        >
          {{ salvando ? 'Salvando...' : 'Salvar tutor' }}
        </button>

        <RouterLink
          to="/tutores"
          class="btn btn-outline-secondary"
        >
          Cancelar
        </RouterLink>
      </div>
    </form>
  </main>
</template>
