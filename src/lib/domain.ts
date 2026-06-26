export const PRESTADOR_TIPOS: { value: string; label: string }[] = [
  { value: "consultorio", label: "Consultório" },
  { value: "clinica_medica", label: "Clínica Médica" },
  { value: "clinica_nao_medica", label: "Clínica Não Médica" },
  { value: "laboratorio", label: "Laboratório" },
  { value: "servico_imagem", label: "Serviço de Imagem" },
  { value: "policlinica", label: "Policlínica" },
  { value: "hospital", label: "Hospital" },
  { value: "outro", label: "Outro" },
];

export const CLIENTE_TIPOS: { value: string; label: string }[] = [
  { value: "convenio_ans", label: "Convênio ANS" },
  { value: "cartao_saude", label: "Cartão de Saúde" },
  { value: "outro", label: "Outro" },
];

export const PROJETO_STATUS: { value: string; label: string }[] = [
  { value: "ativo", label: "Ativo" },
  { value: "pausado", label: "Pausado" },
  { value: "encerrado", label: "Encerrado" },
];

export const PROSPECCAO_ETAPAS: { value: string; label: string }[] = [
  { value: "identificado", label: "Identificado" },
  { value: "contato_tentado", label: "Contato Tentado" },
  { value: "contato_estabelecido", label: "Contato Estabelecido" },
  { value: "proposta_enviada", label: "Proposta Enviada" },
  { value: "em_negociacao", label: "Em Negociação" },
  { value: "credenciado", label: "Credenciado" },
  { value: "declinado", label: "Declinado" },
];

export const APP_ROLES: { value: string; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "executivo", label: "Executivo" },
  { value: "cliente", label: "Cliente" },
];

export function labelOf(
  list: { value: string; label: string }[],
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return list.find((i) => i.value === value)?.label ?? value;
}
