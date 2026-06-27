import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MunicipioMultiCombobox, 
  UfSingleSelect, 
  CidadeSingleCombobox 
} from "@/components/municipio-combobox";
import { EspecialidadeMultiSelect } from "@/components/especialidade-multiselect";

export function NewPrestadorModal({ 
  open, 
  onClose, 
  onSuccess 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSuccess: (id: number) => void;
}) {
  const qc = useQueryClient();
  const [municipiosSel, setMunicipiosSel] = React.useState<string[]>([]);
  const [especialidadesSel, setEspecialidadesSel] = React.useState<number[]>([]);
  const [ufSede, setUfSede] = React.useState("");
  const [cidadeSede, setCidadeSede] = React.useState("");

  const form = useForm({
    defaultValues: {
      razao_social: "",
      nome_fantasia: "",
      cnpj: "",
      tipo: "clinica_medica",
      telefone: "",
      email: "",
      observacoes: "",
    }
  });

  const save = useMutation({
    mutationFn: async (v: any) => {
      // 1. Inserir prestador
      const { data: prestador, error } = await supabase
        .from("prestadores")
        .insert({
          ...v,
          uf: ufSede,
          cidade: cidadeSede,
        })
        .select("id")
        .single();

      if (error) throw error;
      const prestadorId = prestador.id;

      // 2. Salvar especialidades
      if (especialidadesSel.length) {
        const rows = especialidadesSel.map((eid) => ({
          prestador_id: prestadorId,
          especialidade_id: eid,
        }));
        const { error: eError } = await supabase.from("prestador_especialidades").insert(rows);
        if (eError) throw eError;
      }

      // 3. Salvar municípios
      if (municipiosSel.length) {
        const rows = municipiosSel.map((m) => ({
          prestador_id: prestadorId,
          municipio_codigo: m,
        }));
        const { error: mError } = await supabase.from("prestador_municipios").insert(rows);
        if (mError) throw mError;
      }

      return prestadorId;
    },
    onSuccess: (id) => {
      toast.success("Prestador cadastrado com sucesso");
      onSuccess(id);
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Prestador</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="space-y-2">
            <Label>Razão social *</Label>
            <Input placeholder="Ex: Hospital Central de Exemplo Ltda" {...form.register("razao_social", { required: true })} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nome fantasia</Label>
              <Input placeholder="Ex: Hospital Central" {...form.register("nome_fantasia")} />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input placeholder="00.000.000/0000-00" {...form.register("cnpj")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={form.watch("tipo")} onValueChange={(v) => form.setValue("tipo", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "consultorio", label: "Consultório" },
                  { value: "clinica_medica", label: "Clínica Médica" },
                  { value: "clinica_nao_medica", label: "Clínica Não Médica" },
                  { value: "laboratorio", label: "Laboratório" },
                  { value: "servico_imagem", label: "Serviço de Imagem" },
                  { value: "policlinica", label: "Policlínica" },
                  { value: "hospital", label: "Hospital" },
                  { value: "outro", label: "Outro" },
                ].map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Especialidades atendidas</Label>
            <EspecialidadeMultiSelect value={especialidadesSel} onChange={setEspecialidadesSel} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>UF *</Label>
              <UfSingleSelect 
                value={ufSede} 
                onChange={(val) => {
                  setUfSede(val);
                  setCidadeSede(""); // Limpa cidade ao trocar UF
                }} 
              />
            </div>
            <div className="space-y-2">
              <Label>Cidade-sede *</Label>
              <CidadeSingleCombobox 
                uf={ufSede} 
                value={cidadeSede} 
                onChange={setCidadeSede} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Municípios cobertos</Label>
            <MunicipioMultiCombobox value={municipiosSel} onChange={setMunicipiosSel} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input placeholder="(00) 00000-0000" {...form.register("telefone")} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" placeholder="contato@exemplo.com" {...form.register("email")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea placeholder="Informações adicionais, observações ou detalhes importantes..." {...form.register("observacoes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
