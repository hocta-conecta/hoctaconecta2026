const PRESTADOR_TIPOS = [
  { value: "consultorio", label: "Consultório" },
  { value: "clinica_medica", label: "Clínica Médica" },
  { value: "clinica_nao_medica", label: "Clínica Não Médica" },
  { value: "laboratorio", label: "Laboratório" },
  { value: "servico_imagem", label: "Serviço de Imagem" },
  { value: "policlinica", label: "Policlínica" },
  { value: "hospital", label: "Hospital" },
  { value: "servico_anestesiologia", label: "Serviços de Anestesiologia" },
  { value: "outro", label: "Outro" }
];
const CLIENTE_TIPOS = [
  { value: "convenio_ans", label: "Convênio ANS" },
  { value: "cartao_saude", label: "Cartão de Saúde" },
  { value: "outro", label: "Outro" }
];
const PROJETO_STATUS = [
  { value: "ativo", label: "Ativo" },
  { value: "pausado", label: "Pausado" },
  { value: "encerrado", label: "Encerrado" }
];
const PROSPECCAO_ETAPAS = [
  { value: "identificado", label: "Identificado" },
  { value: "contato_tentado", label: "Contato Tentado" },
  { value: "contato_estabelecido", label: "Contato Estabelecido" },
  { value: "proposta_enviada", label: "Proposta Enviada" },
  { value: "em_negociacao", label: "Em Negociação" },
  { value: "credenciado", label: "Credenciado" },
  { value: "declinado", label: "Declinado" }
];
const APP_ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "executivo", label: "Executivo" },
  { value: "cliente", label: "Cliente" }
];
function labelOf(list, value) {
  if (!value) return "—";
  return list.find((i) => i.value === value)?.label ?? value;
}
export {
  APP_ROLES as A,
  CLIENTE_TIPOS as C,
  PROSPECCAO_ETAPAS as P,
  PROJETO_STATUS as a,
  PRESTADOR_TIPOS as b,
  labelOf as l
};
