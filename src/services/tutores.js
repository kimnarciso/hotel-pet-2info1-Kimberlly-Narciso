const API_URL = 'http://localhost:3000';

async function requisicao(endpoint, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${endpoint}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...opcoes.headers,
    },
  });

  if (!resposta.ok) {
    if (resposta.status === 404) {
      throw new Error('Registro não encontrado.');
    }

    throw new Error(
      'Não foi possível concluir a operação. Verifique se o JSON Server está funcionando.',
    );
  }

  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

// TUTORES

export function listarTutores() {
  return requisicao('/tutores');
}

export function buscarTutor(id) {
  return requisicao(`/tutores/${id}`);
}

export async function criarTutor(dados) {
  const tutores = await listarTutores();

  const proximoId =
    tutores.reduce(
      (maior, tutor) => Math.max(maior, Number(tutor.id) || 0),
      0,
    ) + 1;

  return requisicao('/tutores', {
    method: 'POST',
    body: JSON.stringify({
      ...dados,
      id: proximoId,
    }),
  });
}

export function atualizarTutor(id, dados) {
  return requisicao(`/tutores/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dados),
  });
}

export function removerTutor(id) {
  return requisicao(`/tutores/${id}`, {
    method: 'DELETE',
  });
}

// PETS VINCULADOS A UM TUTOR

export async function listarPetsDoTutor(tutorId) {
  const pets = await requisicao(
    `/pets?tutorId=${encodeURIComponent(tutorId)}`,
  );

  return pets.filter(
    (pet) => String(pet.tutorId) === String(tutorId),
  );
}

export async function criarPetParaTutor(dados) {
  const pets = await requisicao('/pets');

  const proximoId =
    pets.reduce(
      (maior, pet) => Math.max(maior, Number(pet.id) || 0),
      0,
    ) + 1;

  return requisicao('/pets', {
    method: 'POST',
    body: JSON.stringify({
      ...dados,
      id: proximoId,
      tutorId: Number(dados.tutorId),
    }),
  });
}
